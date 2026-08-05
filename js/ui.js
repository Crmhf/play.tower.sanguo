// UI 管理：HUD、建造轮盘、升级面板、结算
const UI = {
  game: null,

  updateHud(g) {
    this.game = g;
    document.getElementById('hud-gold').textContent = g.gold;
    document.getElementById('hud-lives').textContent = g.lives;
    document.getElementById('hud-wave').textContent =
      Math.max(0, g.waveIdx + 1) + '/' + g.level.waves.length;
    document.getElementById('hud-level').textContent = '第 ' + g.level.level + ' 关';
    const sk = document.getElementById('skill-btn');
    if (g.skillCd > 0) {
      sk.classList.add('cooling');
      sk.querySelector('.cd-text').textContent = Math.ceil(g.skillCd);
    } else {
      sk.classList.remove('cooling');
      sk.querySelector('.cd-text').textContent = '';
    }
  },

  setWaveBtn(enabled) {
    const b = document.getElementById('wave-btn');
    b.disabled = !enabled;
    b.textContent = enabled ? '▶ 出兵' : '战斗中…';
  },

  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this._tt);
    this._tt = setTimeout(() => t.classList.remove('show'), 1600);
  },

  hidePanels() {
    document.getElementById('build-wheel').classList.remove('show');
    document.getElementById('upgrade-panel').classList.remove('show');
  },

  showBuildWheel(g, slot, cx, cy) {
    this.hidePanels();
    const w = document.getElementById('build-wheel');
    w.innerHTML = '';
    TOWER_KEYS.forEach(k => {
      const d = TOWERS[k];
      const b = document.createElement('div');
      b.className = 'wheel-item' + (g.gold < d.cost ? ' disabled' : '');
      b.innerHTML = `<img src="${d.img}" onerror="this.style.display='none'">
        <div class="wi-name">${d.name}</div><div class="wi-cost">💰${d.cost}</div>`;
      b.onclick = (e) => { e.stopPropagation(); if (g.buildTower(slot, k)) this.hidePanels(); };
      w.appendChild(b);
    });
    // 定位
    const stage = document.getElementById('stage').getBoundingClientRect();
    let x = cx - stage.left, y = cy - stage.top;
    w.style.left = Math.min(Math.max(x, 90), stage.width - 90) + 'px';
    w.style.top = Math.min(Math.max(y, 110), stage.height - 60) + 'px';
    w.classList.add('show');
    w.onclick = (e) => e.stopPropagation();
  },

  showUpgradePanel(g, slot) {
    this.hidePanels();
    const t = slot.tower;
    const p = document.getElementById('upgrade-panel');
    const next = t.lvl < 2 ? t.def.levels[t.lvl + 1] : null;
    p.innerHTML = `
      <div class="up-title">${t.def.name} · Lv${t.lvl + 1}</div>
      <div class="up-stat">伤害 ${Math.round(t.damage)} · 射程 ${t.range} · 攻速 ${t.rate.toFixed(1)}</div>
      ${next ? `<button id="up-btn" class="up-btn">升级 💰${next.cost}</button>` : '<div class="up-max">已满级</div>'}
      <button id="sell-btn" class="sell-btn">出售</button>`;
    if (next) p.querySelector('#up-btn').onclick = () => { g.upgradeTower(slot); this.showUpgradePanel(g, slot); };
    p.querySelector('#sell-btn').onclick = () => { g.sellTower(slot); this.hidePanels(); };
    p.classList.add('show');
    p.onclick = (e) => e.stopPropagation();
  },

  showResult(won, g) {
    const r = document.getElementById('result');
    document.getElementById('result-title').textContent = won ? '🎉 大获全胜' : '💀 城池陷落';
    document.getElementById('result-title').className = won ? 'win' : 'lose';
    document.getElementById('result-sub').textContent = won
      ? `你守住了 ${g.level.name}！` : '敌军攻破了防线…';
    const next = document.getElementById('result-next');
    next.style.display = (won && g.levelIdx < LEVELS.length - 1) ? 'inline-block' : 'none';

    // 通关奖励科技点 → 3 选 1
    const techBox = document.getElementById('tech-choice');
    if (won) {
      Tech.addPoint();
      const choices = Tech.choices();
      if (choices.length) {
        techBox.innerHTML = '<div class="tech-title">⭐ 获得科技点 · 三选一强化</div>';
        const row = document.createElement('div');
        row.className = 'tech-row';
        choices.forEach(t => {
          const b = document.createElement('button');
          b.className = 'tech-card';
          b.innerHTML = `<div class="tc-cat">${t.cat}</div><div class="tc-name">${t.name}</div>`;
          b.onclick = () => {
            Tech.pick(t.id);
            techBox.innerHTML = `<div class="tech-done">已选择：${t.name}</div>`;
          };
          row.appendChild(b);
        });
        techBox.appendChild(row);
        techBox.style.display = 'block';
      } else {
        techBox.innerHTML = '<div class="tech-done">科技已全部点满！</div>';
        techBox.style.display = 'block';
      }
    } else {
      techBox.style.display = 'none';
    }
    r.classList.add('show');
  }
};
