// 主入口：场景管理（菜单 → 选关 → 战斗）
const App = {
  game: null, raf: null, last: 0,
  unlocked: Math.max(1, parseInt(localStorage.getItem('sg_unlocked') || '1', 10) || 1),
  faction: localStorage.getItem('sg_faction') || 'shu',   // 本局统军势力（首页可选）

  start() {
    this._bindMenu();
    this._renderFactions();
    this._renderParade();
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

  // 首页名将剪影轮播：36 将，复制一份首尾相接无缝滚动
  _renderParade() {
    const track = document.getElementById('parade-track');
    if (!track) return;
    const imgs = HERO_KEYS.map(k => `<img src="${HEROES[k].img}" alt="">`).join('');
    track.innerHTML = imgs + imgs;   // 复制一份，translateX(-50%) 无缝循环
  },

  // 首页势力选择：4 张势力卡，选定高亮 + 存 localStorage
  _renderFactions() {
    const row = document.getElementById('faction-row');
    if (!row) return;
    row.innerHTML = '';
    const BLURB = {
      wei: '中原霸主 · 人才济济', shu: '仁义之师 · 五虎上将',
      wu:  '江东基业 · 水陆并进', qun: '群雄并起 · 各显神通'
    };
    Object.keys(FACTIONS).forEach(f => {
      const meta = FACTIONS[f];
      const n = heroesByFaction(f).length;
      const card = document.createElement('div');
      card.className = 'fs-card' + (this.faction === f ? ' sel' : '');
      card.style.setProperty('--fac', meta.color);
      card.innerHTML = `<div class="fs-name">${meta.name}</div>
        <div class="fs-count">${n} 将</div>
        <div class="fs-blurb">${BLURB[f] || ''}</div>`;
      card.onclick = () => {
        this.faction = f;
        localStorage.setItem('sg_faction', f);
        AudioMan.play('attack_sword', 0.2);
        this._renderFactions();
      };
      row.appendChild(card);
    });
  },

  _renderLevels() {
    const box = document.getElementById('level-grid');
    box.innerHTML = '';
    // 当前势力标识（点击可回首页换势力）
    const lf = document.getElementById('levels-faction');
    if (lf) {
      const fm = FACTIONS[this.faction] || { name:'?', color:'#888' };
      lf.innerHTML = `当前统军：<b style="color:${fm.color}">${fm.name}军</b>（${heroesByFaction(this.faction).length} 将） · <span class="lf-change" id="lf-change">更换势力</span>`;
      const ch = document.getElementById('lf-change');
      if (ch) ch.onclick = () => { this.showScreen('menu'); };
    }
    // 战役进度条（5 章分段，点刻度可跳到对应章节块）
    this._renderCampaignBar();
    const TERRAIN = { plain:'平原', forest:'森林', river:'河谷', volcano:'火山', snow:'雪原', boss:'决战' };
    const CHAP_COLOR = ['#c9a227','#4a9a4a','#4a8ad0','#d06a3a','#aac8e8'];
    // 按 10 关一章拆成 5 个章节块
    for (let chapIdx = 0; chapIdx < 5; chapIdx++) {
      const chap = CHAPTERS[chapIdx];
      const block = document.createElement('div');
      block.className = 'chapter-block';
      block.dataset.chap = chapIdx;
      block.id = 'chapter-' + chapIdx;
      const head = document.createElement('div');
      head.className = 'chapter-head';
      head.innerHTML = `<span class="chapter-name">${chap.name}</span>
        <span class="chapter-terrain">${TERRAIN[chap.bg] || ''}</span>
        <span class="chapter-reward">通关奖励 · ${chap.reward}</span>`;
      block.appendChild(head);
      const cells = document.createElement('div');
      cells.className = 'chapter-cells';
      for (let k = 0; k < 10; k++) {
        const i = chapIdx * 10 + k;
        const lv = LEVELS[i];
        if (!lv) continue;
        const locked = (i + 1) > this.unlocked;
        const cleared = (i + 1) < this.unlocked;
        const wrap = document.createElement('div');
        wrap.className = 'cell-wrap';
        const b = document.createElement('button');
        b.className = 'level-cell' + (locked ? ' locked' : '') + (lv.boss ? ' boss' : '');
        b.textContent = locked ? '🔒' : (lv.boss ? '👹' : lv.level);
        if (cleared) {
          const s = document.createElement('span');
          s.className = 'stars';
          s.textContent = '★★★';
          b.appendChild(s);
        }
        // 悬停信息卡：关名 / 地形 / 血量倍率 / Boss·奖励
        if (!locked) {
          const tip = document.createElement('div');
          tip.className = 'cell-tip';
          tip.innerHTML = `<div class="ct-name">${lv.name}</div>
            <div class="ct-line">地形 ${TERRAIN[lv.bg] || ''} · 血量×${lv.diff}</div>
            ${lv.boss ? '<div class="ct-boss">⚔ 章节 BOSS 关</div>' : ''}`;
          wrap.appendChild(tip);
          b.onclick = () => this.startBattle(i);
        }
        wrap.appendChild(b);
        cells.appendChild(wrap);
      }
      block.appendChild(cells);
      box.appendChild(block);
    }
  },

  // 顶部战役进度条：已解锁进度 + 5 章分段刻度
  _renderCampaignBar() {
    const bar = document.getElementById('campaign-bar');
    if (!bar) return;
    bar.innerHTML = '';
    const label = document.createElement('span');
    label.className = 'campaign-label';
    label.textContent = `战役进度 ${Math.min(this.unlocked, 50)}/50`;
    bar.appendChild(label);
    const CHAP_COLOR = ['#c9a227','#4a9a4a','#4a8ad0','#d06a3a','#aac8e8'];
    for (let c = 0; c < 5; c++) {
      const seg = document.createElement('div');
      seg.className = 'campaign-seg';
      seg.title = CHAPTERS[c].name;
      const fill = document.createElement('div');
      fill.className = 'fill';
      // 本章已通关比例 0..1
      const chapStart = c * 10 + 1;                 // 本章第一关编号
      const cleared = Math.max(0, Math.min(10, this.unlocked - chapStart));
      fill.style.background = CHAP_COLOR[c];
      fill.style.transform = `scaleX(${cleared / 10})`;
      seg.appendChild(fill);
      seg.onclick = () => {
        const t = document.getElementById('chapter-' + c);
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      bar.appendChild(seg);
    }
  },

  startBattle(levelIdx) {
    this.showScreen('battle');
    AudioMan.playBgm(LEVELS[levelIdx].boss ? 'boss.mp3' : 'battle.mp3');
    const container = document.getElementById('stage');
    container.innerHTML = '';
    if (this.game) this.game.destroy();
    this.game = new Game(container, levelIdx);
    UI.hidePanels();
    UI.hideHelp();
    document.getElementById('result').classList.remove('show');

    // 绑定战斗 UI（出兵为自动，无需出兵按钮）
    const speedBtn = document.getElementById('speed-btn');
    speedBtn.textContent = '×1';                       // 每局重置倍率显示
    speedBtn.onclick = (e) => {
      this.game.speed = this.game.speed === 1 ? 2 : 1;
      e.target.textContent = '×' + this.game.speed;
    };
    document.getElementById('quit-btn').onclick = () => this.quitBattle();
    document.getElementById('result-retry').onclick = () => this.startBattle(levelIdx);
    document.getElementById('result-next').onclick = () => this.startBattle(levelIdx + 1);
    document.getElementById('result-menu').onclick = () => this.quitBattle();

    // 键盘快捷键
    window.onkeydown = (e) => {
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
        if (!document.hidden) this.game.render();   // 后台标签页只推进逻辑、不空渲染
      } else if (this.game) {
        this.game.update(0); // 仍推进结算画面逻辑
        if (!document.hidden) this.game.render();
      }
    };
    // requestAnimationFrame 驱动（流畅），setInterval 兜底（标签页后台/被节流时仍推进）
    const loop = (t) => { step(t); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
    this.timer = setInterval(() => { if (document.hidden) step(performance.now()); }, 33);
    // 自动出兵：开局给一段布防整备时间后第一波自动来袭
    this.game._autoWaveT = 8.0;
  },

  _stopLoop() {
    cancelAnimationFrame(this.raf);
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  },

  quitBattle() {
    this._stopLoop();
    window.onkeydown = null;                 // 解绑快捷键，避免驱动已销毁的旧 game
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
