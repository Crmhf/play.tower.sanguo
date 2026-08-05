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
    // 上阵位
    const capEl = document.getElementById('hud-cap');
    if (capEl) capEl.textContent = g.towers.length + '/' + g.towerCap();
    // 势力羁绊提示
    const syn = document.getElementById('hud-synergy');
    if (syn && g.synergy) {
      if (g.synergy.active.length) {
        const buff = g.synergy.active.filter(a => a.kind !== 'nerf').length;
        const nerf = g.synergy.active.filter(a => a.kind === 'nerf').length;
        syn.textContent = '🤝' + buff + (nerf ? ' ⚠️' + nerf : '');
        syn.title = g.synergy.active.map(a => a.text).join('\n');
      } else { syn.textContent = ''; syn.title = ''; }
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

  // 基地受击红屏脉冲
  hurtFlash() {
    const f = document.getElementById('hurt-flash');
    if (!f) return;
    f.style.transition = 'none'; f.style.opacity = '0.85';
    requestAnimationFrame(() => { f.style.transition = 'opacity .5s'; f.style.opacity = '0'; });
  },

  // Boss 出场红色横幅
  bossBanner(name) {
    const wrap = document.getElementById('stage-wrap');
    if (!wrap) return;
    let b = wrap.querySelector('.boss-banner');
    if (!b) { b = document.createElement('div'); b.className = 'boss-banner'; wrap.appendChild(b); }
    b.textContent = '⚔ ' + name + ' ⚔';
    b.classList.remove('show'); void b.offsetWidth;   // 重启动画
    b.classList.add('show');
  },

  hidePanels() {
    document.getElementById('build-wheel').classList.remove('show');
    document.getElementById('upgrade-panel').classList.remove('show');
  },

  showBuildWheel(g, slot, cx, cy) {
    this.hidePanels();
    const w = document.getElementById('build-wheel');
    w.innerHTML = '';
    const cap = g.towerCap(), full = g.towers.length >= cap;
    // 上阵位提示
    const capInfo = document.createElement('div');
    capInfo.className = 'wheel-cap';
    capInfo.textContent = `上阵 ${g.towers.length}/${cap}` + (full ? ' · 已满，请升星/撤回' : '');
    w.appendChild(capInfo);
    HERO_KEYS.forEach(k => {
      const h = HEROES[k];
      const f = FACTIONS[h.faction] || { name:'?', color:'#888' };
      const b = document.createElement('div');
      b.className = 'wheel-item' + ((g.gold < h.cost || full) ? ' disabled' : '');
      b.innerHTML = `<img src="${h.img}" onerror="this.style.display='none'">
        <span class="fac-dot" style="background:${f.color}" title="${f.name}"></span>
        <div class="wi-name">${h.name}</div><div class="wi-cost">⚡${h.cost}</div>`;
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
    const next = t.lvl < 2 ? t.hero.levels[t.lvl + 1] : null;
    p.innerHTML = `
      <div class="up-title" style="color:${t.hero.color}">${t.hero.name} · Lv${t.lvl + 1}</div>
      <div class="up-stat">伤害 ${Math.round(t.damage)} · 射程 ${Math.round(t.range)} · 攻速 ${t.rate.toFixed(1)}</div>
      ${next ? `<button id="up-btn" class="up-btn">升级 ⚡${next.cost}</button>` : '<div class="up-max">已满级</div>'}
      <button id="sell-btn" class="sell-btn">撤回（返积分）</button>`;
    if (next) p.querySelector('#up-btn').onclick = () => { g.upgradeTower(slot); this.showUpgradePanel(g, slot); };
    p.querySelector('#sell-btn').onclick = () => { g.sellTower(slot); this.hidePanels(); };
    p.classList.add('show');
    p.onclick = (e) => e.stopPropagation();
  },

  // ---------- 图鉴说明 ----------
  showHelp(tab = 'hero') {
    const m = document.getElementById('help-modal');
    m.classList.add('show');
    this._renderHelp(tab);
  },
  hideHelp() { document.getElementById('help-modal').classList.remove('show'); },

  _renderHelp(tab) {
    document.querySelectorAll('.help-tab').forEach(b =>
      b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.help-tab').forEach(b =>
      b.onclick = () => this._renderHelp(b.dataset.tab));
    const grid = document.getElementById('help-grid');
    grid.innerHTML = '';
    if (tab === 'hero') {
      HERO_KEYS.forEach(k => {
        const h = HEROES[k];
        const f = FACTIONS[h.faction] || { name:'?', color:'#888' };
        const l1 = h.levels[0], l3 = h.levels[2];
        const card = document.createElement('div');
        card.className = 'help-card';
        card.innerHTML = `
          <img src="${h.img}" onerror="this.style.display='none'">
          <div class="hc-title" style="color:${h.color}">${h.name} · ${h.title}</div>
          <div class="hc-role"><span class="fac-tag" style="background:${f.color}">${f.name}</span> ${h.role}　召唤 ⚡${h.cost}</div>
          <div class="hc-line">伤害 ${l1.damage}→${l3.damage}　射程 ${l1.range}→${l3.range}</div>
          <div class="hc-line">攻速 ${l1.rate}→${l3.rate}/秒</div>
          <div class="hc-trait">✦ ${h.passive.text}</div>
          <div class="hc-desc">${h.desc}</div>`;
        grid.appendChild(card);
      });
    } else if (tab === 'enemy') {
      Object.values(ENEMIES).forEach(e => {
        const card = document.createElement('div');
        card.className = 'help-card enemy';
        card.innerHTML = `
          <img src="${e.img}" onerror="this.style.display='none'">
          <div class="hc-title">${e.name}${e.boss ? ' <span class="boss-tag">BOSS</span>' : ''}</div>
          <div class="hc-role">击杀积分 ⚡${e.score}</div>
          <div class="hc-line">血量 ${e.hp}　速度 ${e.speed}　护甲 ${e.armor}</div>
          <div class="hc-desc">${e.ability || ''}</div>`;
        grid.appendChild(card);
      });
    } else {
      this._renderSynergy(grid);
    }
  },

  // 势力羁绊说明页：阵营规则 + 全部组合
  _renderSynergy(grid) {
    const mk = (html, cls) => { const d = document.createElement('div'); d.className = 'syn-card ' + (cls||''); d.innerHTML = html; grid.appendChild(d); };
    // 阵营羁绊规则
    mk(`<div class="syn-h">🤝 阵营羁绊（同势力上阵人数）</div>
        <div class="syn-line">2 人 · 双璧小成：伤害 +10%</div>
        <div class="syn-line">3 人 · 三杰大成：伤害 +18% 攻速 +8%</div>
        <div class="syn-line">4 人 · 四雄鼎盛：伤害 +30% 攻速 +12%</div>
        <div class="syn-sub">同一武将重复上阵只计 1 人；魏/蜀/吴/群 各自独立计算。</div>`, 'syn-wide');
    // 组合羁绊
    const grp = { buff:[], nerf:[], none:[] };
    Synergy.combos.forEach(c => grp[c.kind].push(c));
    const names = c => c.need.map(id => HEROES[id].name).join(' + ');
    mk(`<div class="syn-h">✨ 增益组合</div>` + grp.buff.map(c =>
        `<div class="syn-line"><b>${names(c)}</b> — ${c.text.split('：')[1] || ''}</div>`).join(''), 'syn-wide syn-buff');
    mk(`<div class="syn-h">⚠️ 内耗组合（同场削弱）</div>` + grp.nerf.map(c =>
        `<div class="syn-line"><b>${names(c)}</b> — ${c.text.split('：')[1] || ''}</div>`).join(''), 'syn-wide syn-nerf');
    mk(`<div class="syn-h">⚖️ 中和组合（无效果）</div>` + grp.none.map(c =>
        `<div class="syn-line"><b>${names(c)}</b></div>`).join(''), 'syn-wide syn-none');
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
