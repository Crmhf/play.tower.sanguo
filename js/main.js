// 主入口：场景管理（菜单 → 选关 → 战斗）
const App = {
  game: null, raf: null, last: 0,
  unlocked: parseInt(localStorage.getItem('sg_unlocked') || '1'),

  start() {
    this._bindMenu();
    this.showScreen('menu');
    // 加载素材
    const bar = document.getElementById('load-bar');
    Assets.load(p => { bar.style.width = (p * 100) + '%'; }).then(() => {
      document.getElementById('loading').classList.add('hide');
      document.getElementById('menu-inner').classList.remove('hide');
      AudioMan.init(); AudioMan.load();
    });
  },

  showScreen(id) {
    ['menu', 'levels', 'battle'].forEach(s => {
      document.getElementById('screen-' + s).classList.toggle('active', s === id);
    });
  },

  _bindMenu() {
    document.getElementById('btn-start').onclick = () => {
      AudioMan.init(); AudioMan.playBgm('menu.mp3');
      this._renderLevels(); this.showScreen('levels');
    };
    document.getElementById('btn-mute').onclick = (e) => {
      const m = AudioMan.toggleMute();
      e.target.textContent = m ? '🔇' : '🔊';
    };
    // 图鉴说明
    ['btn-help', 'btn-help2', 'btn-help3'].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.onclick = () => UI.showHelp('hero');
    });
    document.getElementById('help-close').onclick = () => UI.hideHelp();
    document.getElementById('help-modal').onclick = (e) => {
      if (e.target.id === 'help-modal') UI.hideHelp();
    };
  },

  _renderLevels() {
    const box = document.getElementById('level-grid');
    box.innerHTML = '';
    LEVELS.forEach((lv, i) => {
      const b = document.createElement('button');
      const locked = (i + 1) > this.unlocked;
      b.className = 'level-cell' + (locked ? ' locked' : '') + (lv.boss ? ' boss' : '');
      b.textContent = locked ? '🔒' : (lv.boss ? '👹' + lv.level : lv.level);
      b.title = lv.name;
      if (!locked) b.onclick = () => this.startBattle(i);
      box.appendChild(b);
    });
  },

  startBattle(levelIdx) {
    this.showScreen('battle');
    AudioMan.playBgm(LEVELS[levelIdx].boss ? 'boss.mp3' : 'battle.mp3');
    const container = document.getElementById('stage');
    container.innerHTML = '';
    if (this.game) this.game.destroy();
    this.game = new Game(container, levelIdx);
    UI.setWaveBtn(true);
    UI.hidePanels();
    UI.hideHelp();
    document.getElementById('result').classList.remove('show');

    // 绑定战斗 UI
    document.getElementById('wave-btn').onclick = () => this.game.startWave();
    document.getElementById('speed-btn').onclick = (e) => {
      this.game.speed = this.game.speed === 1 ? 2 : 1;
      e.target.textContent = '×' + this.game.speed;
    };
    document.getElementById('quit-btn').onclick = () => this.quitBattle();
    document.getElementById('result-retry').onclick = () => this.startBattle(levelIdx);
    document.getElementById('result-next').onclick = () => this.startBattle(levelIdx + 1);
    document.getElementById('result-menu').onclick = () => this.quitBattle();

    // 键盘快捷键
    window.onkeydown = (e) => {
      if (e.code === 'Enter') this.game.startWave();
      if (e.code === 'Escape') UI.hideHelp();
    };

    this.last = performance.now();
    this._stopLoop();
    const step = (t) => {
      const dt = Math.min((t - this.last) / 1000, 0.05);
      this.last = t;
      if (this.game && (this.game.state === 'build' || this.game.state === 'wave')) {
        this.game.update(dt);
        UI.updateHud(this.game);
      } else if (this.game) {
        this.game.update(0); // 仍渲染结算画面
      }
    };
    // requestAnimationFrame 驱动（流畅），setInterval 兜底（标签页后台/被节流时仍推进）
    const loop = (t) => { step(t); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
    this.timer = setInterval(() => { if (document.hidden) step(performance.now()); }, 33);
  },

  _stopLoop() {
    cancelAnimationFrame(this.raf);
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  },

  quitBattle() {
    this._stopLoop();
    if (this.game && this.game.state === 'won') {
      // 解锁下一关
      const nl = this.game.level.level + 1;
      if (nl > this.unlocked) {
        this.unlocked = Math.min(50, nl);
        localStorage.setItem('sg_unlocked', this.unlocked);
      }
    }
    AudioMan.playBgm('menu.mp3');
    this._renderLevels();
    this.showScreen('levels');
  }
};

window.addEventListener('DOMContentLoaded', () => App.start());
