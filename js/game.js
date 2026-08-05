// 核心战斗引擎：Three.js 正交渲染 + 塔防逻辑 + 粒子 + 屏震
class Game {
  constructor(container, heroId, levelIdx) {
    this.container = container;
    this.hero = HEROES[heroId];
    this.levelIdx = levelIdx;
    this.level = LEVELS[levelIdx];

    // 资源
    this.gold = this.level.startGold;
    this.lives = this.level.startLives;
    this.passive = this.hero.passive;

    // 状态
    this.state = 'build';            // build | wave | won | lost
    this.waveIdx = -1;
    this.spawnQueue = [];
    this.enemies = [];
    this.towers = [];
    this.projectiles = [];
    this.particles = [];
    this.effects = [];               // 技能特效
    this.skillCd = 0;
    this.shake = 0;
    this.time = 0;
    this.speed = 1;

    this._setupThree();
    this._buildPath();
    this._buildSlots();
    this._bindInput();
    this._updateHud();
  }

  // ---------- Three.js 场景 ----------
  _setupThree() {
    const w = CANVAS_W, h = CANVAS_H;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(0, w, h, 0, -100, 200);
    this.camera.position.set(0, 0, 100);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // 背景
    const bgTex = Assets.tex(BG_IMG[this.level.bg] || BG_IMG.plain);
    if (bgTex) {
      const bg = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: bgTex })
      );
      bg.position.set(w / 2, h / 2, -10);
      this.scene.add(bg);
    } else {
      this.scene.background = new THREE.Color(0x1a2233);
    }

    // 顶部半透明叠加，增强可读性
    const veil = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.12 })
    );
    veil.position.set(w / 2, h / 2, -9);
    this.scene.add(veil);
  }

  // 路径折线 → 渲染 + 供敌人行进
  _buildPath() {
    this.path = this.level.path.map(p => ({ x: p.x, y: p.y })); // 世界坐标 = 画布坐标（相机 top=h）
    // 路径线段
    const pts = this.path.map(p => new THREE.Vector3(p.x, p.y, -5));
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x8a6b3a, linewidth: 3 }));
    this.scene.add(line);
    // 路径宽带（视觉）
    for (let i = 0; i < this.path.length - 1; i++) {
      const a = this.path[i], b = this.path[i + 1];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const seg = new THREE.Mesh(
        new THREE.PlaneGeometry(len, 40),
        new THREE.MeshBasicMaterial({ color: 0x6b5330, transparent: true, opacity: 0.5 })
      );
      seg.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, -6);
      seg.rotation.z = Math.atan2(b.y - a.y, b.x - a.x);
      this.scene.add(seg);
    }
    // 基地（终点）
    const base = new THREE.Mesh(
      new THREE.CircleGeometry(26, 24),
      new THREE.MeshBasicMaterial({ color: 0x3aa0ff, transparent: true, opacity: 0.8 })
    );
    const end = this.path[this.path.length - 1];
    base.position.set(end.x, end.y, -4);
    this.scene.add(base);
    this.basePos = end;
  }

  // 可建塔的空地槽位：沿路径两侧自动布置
  _buildSlots() {
    this.slots = [];
    const used = [];
    const minDistPath = 55, minDistSlot = 64;
    for (let i = 0; i < this.path.length - 1; i++) {
      const a = this.path[i], b = this.path[i + 1];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const nx = -(b.y - a.y) / len, ny = (b.x - a.x) / len; // 法线
      const steps = Math.floor(len / 110);
      for (let s = 0; s <= steps; s++) {
        const t = s / Math.max(steps, 1);
        const px = a.x + (b.x - a.x) * t, py = a.y + (b.y - a.y) * t;
        for (const side of [1, -1]) {
          const x = px + nx * 62 * side, y = py + ny * 62 * side;
          if (x < 40 || x > CANVAS_W - 40 || y < 60 || y > CANVAS_H - 40) continue;
          if (used.some(u => Math.hypot(u.x - x, u.y - y) < minDistSlot)) continue;
          if (this._distToPath(x, y) < minDistPath) continue;
          used.push({ x, y });
          this._addSlot(x, y);
        }
      }
    }
  }

  _distToPath(x, y) {
    let m = 1e9;
    for (let i = 0; i < this.path.length - 1; i++) {
      const a = this.path[i], b = this.path[i + 1];
      const dx = b.x - a.x, dy = b.y - a.y;
      const L2 = dx * dx + dy * dy;
      let t = L2 ? ((x - a.x) * dx + (y - a.y) * dy) / L2 : 0;
      t = Math.max(0, Math.min(1, t));
      m = Math.min(m, Math.hypot(x - (a.x + dx * t), y - (a.y + dy * t)));
    }
    return m;
  }

  _addSlot(x, y) {
    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(20, 20),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 })
    );
    mesh.position.set(x, y, 0);
    this.scene.add(mesh);
    this.slots.push({ x, y, mesh, tower: null });
  }

  // ---------- 输入 ----------
  _bindInput() {
    this.ray = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    const el = this.renderer.domElement;
    el.addEventListener('click', e => this._onClick(e));
    el.addEventListener('mousemove', e => this._onMove(e));
  }

  _toWorld(e) {
    const r = this.renderer.domElement.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * CANVAS_W;
    const y = (e.clientY - r.top) / r.height * CANVAS_H;
    return { x, y };
  }

  _onMove(e) {
    const p = this._toWorld(e);
    this.hoverSlot = this.slots.find(s => Math.hypot(s.x - p.x, s.y - p.y) < 22) || null;
    this.slots.forEach(s => { if (!s.tower) s.mesh.material.opacity = (s === this.hoverSlot) ? 0.4 : 0.18; });
  }

  _onClick(e) {
    const p = this._toWorld(e);
    const slot = this.slots.find(s => Math.hypot(s.x - p.x, s.y - p.y) < 22);
    if (slot) {
      if (slot.tower) UI.showUpgradePanel(this, slot);
      else UI.showBuildWheel(this, slot, e.clientX, e.clientY);
    } else {
      UI.hidePanels();
    }
  }

  // ---------- 建塔 / 升级 ----------
  buildTower(slot, typeId) {
    const def = TOWERS[typeId];
    if (this.gold < def.cost) { UI.toast('金币不足'); return false; }
    this.gold -= def.cost;
    const lvl = def.levels[0];
    const tex = Assets.tex(def.img);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(46, 46),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, color: tex ? 0xffffff : def.color })
    );
    mesh.position.set(slot.x, slot.y, 1);
    this.scene.add(mesh);
    slot.mesh.visible = false;
    const tower = {
      type: typeId, def, lvl: 0, slot, mesh,
      cd: 0, ...this._towerStats(def, 0)
    };
    slot.tower = tower;
    this.towers.push(tower);
    AudioMan.play('attack_sword', 0.3);
    this._updateHud();
    return true;
  }

  _towerStats(def, lvl) {
    const s = def.levels[lvl];
    let dmg = s.damage * (1 + (this.passive.damage || 0));
    let rate = s.rate * (1 + (this.passive.attackSpeed || 0));
    return { damage: dmg, range: s.range, rate, slow: s.slow, slowTime: s.slowTime };
  }

  upgradeTower(slot) {
    const t = slot.tower;
    if (!t || t.lvl >= 2) { UI.toast('已满级'); return; }
    const cost = t.def.levels[t.lvl + 1].cost;
    if (this.gold < cost) { UI.toast('金币不足'); return; }
    this.gold -= cost;
    t.lvl++;
    Object.assign(t, this._towerStats(t.def, t.lvl));
    t.mesh.scale.setScalar(1 + t.lvl * 0.15);
    // 升级特效
    this._burst(slot.x, slot.y, 0xffe08a, 14);
    AudioMan.play('skill_cast', 0.4);
    this._updateHud();
  }

  sellTower(slot) {
    const t = slot.tower;
    if (!t) return;
    let refund = Math.floor(t.def.cost * 0.7);
    for (let i = 1; i <= t.lvl; i++) refund += Math.floor(t.def.levels[i].cost * 0.7);
    this.gold += refund;
    this.scene.remove(t.mesh);
    this.towers = this.towers.filter(x => x !== t);
    slot.tower = null; slot.mesh.visible = true;
    this._updateHud();
  }

  // ---------- 波次 ----------
  startWave() {
    if (this.state === 'wave') return;
    this.waveIdx++;
    if (this.waveIdx >= this.level.waves.length) return;
    this.state = 'wave';
    AudioMan.play('wave_horn', 0.5);
    // 展开生成队列
    this.spawnQueue = [];
    const wave = this.level.waves[this.waveIdx];
    let t = 0;
    wave.forEach(group => {
      for (let i = 0; i < group.count; i++) {
        this.spawnQueue.push({ type: group.type, at: t });
        t += group.interval;
      }
      t += 1.5;
    });
    UI.setWaveBtn(false);
    UI.toast('第 ' + (this.waveIdx + 1) + ' 波来袭！');
  }

  _spawn(typeId) {
    const def = ENEMIES[typeId];
    const hp = def.hp * this.level.diff;
    const tex = Assets.tex(def.img);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(def.size, def.size),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, color: tex ? 0xffffff : def.color })
    );
    const start = this.path[0];
    mesh.position.set(start.x, start.y, 2);
    this.scene.add(mesh);

    // 血条
    let hpBar = null;
    if (def.boss || true) {
      hpBar = new THREE.Mesh(
        new THREE.PlaneGeometry(def.size, 4),
        new THREE.MeshBasicMaterial({ color: 0x4ade80 })
      );
      hpBar.position.set(start.x, start.y + def.size / 2 + 6, 3);
      this.scene.add(hpBar);
    }

    this.enemies.push({
      type: typeId, def, mesh, hpBar,
      hp, maxHp: hp, speed: def.speed, armor: def.armor,
      seg: 0, dist: 0, x: start.x, y: start.y,
      slowFactor: 1, slowT: 0, burnT: 0, burnDps: 0, stunT: 0,
      wob: Math.random() * Math.PI * 2, dead: false
    });
  }

  // ---------- 技能 ----------
  castSkill() {
    if (this.skillCd > 0 || this.enemies.length === 0) return;
    const sk = this.hero.skill;
    const cdMul = 1 - (this.passive.cooldown || 0);
    this.skillCd = sk.cd * cdMul;
    AudioMan.play(sk.sfx, 0.8);
    this.shake = Math.max(this.shake, 14);

    const cx = CANVAS_W / 2, cy = CANVAS_H / 2;
    const tex = Assets.tex(sk.effectImg);

    if (sk.type === 'dragon') {
      // 直线贯穿
      this._skillSprite(tex, cx, cy, 500, 90, sk.color);
      this.enemies.forEach(e => this._damage(e, sk.damage, { knock: 30 }));
    } else if (sk.type === 'blade') {
      this._skillSprite(tex, cx, cy, 560, 560, sk.color);
      this.enemies.forEach(e => { this._damage(e, sk.damage); e.stunT = Math.max(e.stunT, sk.stun); });
    } else if (sk.type === 'fire') {
      this._skillSprite(tex, cx, cy, 420, 420, sk.color);
      this.enemies.forEach(e => { this._damage(e, sk.damage); e.burnT = sk.burn; e.burnDps = sk.damage / sk.burn; this._slow(e, sk.slow, sk.burn); });
    } else if (sk.type === 'smash') {
      // 找最密集点
      let best = this.enemies[0], mx = -1;
      this.enemies.forEach(e => {
        const near = this.enemies.filter(o => Math.hypot(o.x - e.x, o.y - e.y) < 160).length;
        if (near > mx) { mx = near; best = e; }
      });
      this._skillSprite(tex, best.x, best.y, 380, 380, sk.color);
      this._burst(best.x, best.y, sk.color, 30);
      this.enemies.forEach(e => {
        if (Math.hypot(e.x - best.x, e.y - best.y) < 190) this._damage(e, sk.damage, { knock: 50 });
      });
      this.shake = 22;
    }
    this._updateHud();
  }

  _skillSprite(tex, x, y, w, h, color) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, color: tex ? 0xffffff : color, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    m.position.set(x, y, 5);
    this.scene.add(m);
    this.effects.push({ mesh: m, life: 0, max: 0.8, spin: 2.5 });
  }

  // ---------- 主循环 ----------
  update(dt) {
    dt *= this.speed;
    this.time += dt;
    if (this.skillCd > 0) this.skillCd = Math.max(0, this.skillCd - dt);
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 30);

    // 生成敌人
    if (this.state === 'wave') {
      while (this.spawnQueue.length && this.spawnQueue[0].at <= this.time) {
        this._spawn(this.spawnQueue.shift().type);
      }
    }

    this._updateEnemies(dt);
    this._updateTowers(dt);
    this._updateProjectiles(dt);
    this._updateParticles(dt);
    this._updateEffects(dt);

    // 波次结束判定
    if (this.state === 'wave' && this.spawnQueue.length === 0 && this.enemies.length === 0) {
      if (this.waveIdx >= this.level.waves.length - 1) {
        this._win();
      } else {
        this.state = 'build';
        this.gold += 30 + this.waveIdx * 5;
        UI.setWaveBtn(true);
        UI.toast('本波已清剿，整备后继续');
      }
      this._updateHud();
    }

    // 相机震动
    const sx = (Math.random() - 0.5) * this.shake, sy = (Math.random() - 0.5) * this.shake;
    this.camera.position.set(sx, sy, 100);
    this.renderer.render(this.scene, this.camera);
  }

  _updateEnemies(dt) {
    for (const e of this.enemies) {
      if (e.dead) continue;
      // 灼烧
      if (e.burnT > 0) { e.burnT -= dt; this._damage(e, e.burnDps * dt, { silent: true }); if (Math.random() < dt * 6) this._particle(e.x, e.y, 0xff7030); }
      if (e.dead) continue;
      // 减速
      if (e.slowT > 0) { e.slowT -= dt; if (e.slowT <= 0) e.slowFactor = 1; }
      // 眩晕
      if (e.stunT > 0) { e.stunT -= dt; continue; }

      // 沿路径移动
      const sp = e.speed * e.slowFactor;
      let move = sp * dt;
      while (move > 0 && e.seg < this.path.length - 1) {
        const a = this.path[e.seg], b = this.path[e.seg + 1];
        const segLen = Math.hypot(b.x - a.x, b.y - a.y);
        const remain = segLen - e.dist;
        if (move < remain) { e.dist += move; move = 0; }
        else { move -= remain; e.seg++; e.dist = 0; }
      }
      if (e.seg >= this.path.length - 1) { this._reachBase(e); continue; }
      const a = this.path[e.seg], b = this.path[e.seg + 1];
      const segLen = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const t = e.dist / segLen;
      e.x = a.x + (b.x - a.x) * t;
      e.y = a.y + (b.y - a.y) * t;
      // 朝向 + 行走摆动
      e.wob += dt * 10;
      e.mesh.position.set(e.x, e.y + Math.sin(e.wob) * 2, 2);
      e.mesh.rotation.z = Math.atan2(b.y - a.y, b.x - a.x) * 0; // 保持直立
      const face = (b.x - a.x) < 0 ? -1 : 1;
      e.mesh.scale.x = face;
      if (e.hpBar) {
        e.hpBar.position.set(e.x, e.y + e.def.size / 2 + 6, 3);
        const ratio = Math.max(0, e.hp / e.maxHp);
        e.hpBar.scale.x = ratio;
        e.hpBar.material.color.setHex(ratio > 0.5 ? 0x4ade80 : ratio > 0.25 ? 0xfbbf24 : 0xef4444);
      }
    }
    // 清理死亡
    this.enemies = this.enemies.filter(e => {
      if (e._remove) {
        this.scene.remove(e.mesh); if (e.hpBar) this.scene.remove(e.hpBar);
        return false;
      }
      return true;
    });
  }

  _reachBase(e) {
    e._remove = true; e.dead = true;
    this.lives -= e.def.boss ? 5 : 1;
    this._burst(e.x, e.y, 0xff4040, 10);
    this.shake = Math.max(this.shake, 8);
    AudioMan.play('hit', 0.5);
    this._updateHud();
    if (this.lives <= 0) this._lose();
  }

  _updateTowers(dt) {
    for (const t of this.towers) {
      t.cd -= dt;
      if (t.cd > 0) continue;
      // 找射程内最靠前的敌人
      let target = null, bestProg = -1;
      for (const e of this.enemies) {
        if (e.dead) continue;
        const d = Math.hypot(e.x - t.slot.x, e.y - t.slot.y);
        if (d <= t.range) {
          const prog = e.seg * 1000 + e.dist;
          if (prog > bestProg) { bestProg = prog; target = e; }
        }
      }
      if (target) {
        t.cd = 1 / t.rate;
        this._fire(t, target);
        // 炮口朝向
        t.mesh.rotation.z = Math.atan2(target.y - t.slot.y, target.x - t.slot.x);
      }
    }
  }

  _fire(t, target) {
    const crit = Math.random() < (this.passive.crit || 0);
    const dmg = t.damage * (crit ? 2 : 1);
    const m = new THREE.Mesh(
      new THREE.CircleGeometry(5, 8),
      new THREE.MeshBasicMaterial({ color: t.def.projColor })
    );
    m.position.set(t.slot.x, t.slot.y, 4);
    this.scene.add(m);
    this.projectiles.push({
      mesh: m, target, x: t.slot.x, y: t.slot.y,
      speed: 420, dmg, splash: t.def.splash || 0,
      slow: t.slow, slowTime: t.slowTime, color: t.def.projColor
    });
    AudioMan.play('whoosh', 0.15);
  }

  _updateProjectiles(dt) {
    for (const p of this.projectiles) {
      if (p.target.dead) { p._remove = true; continue; }
      const dx = p.target.x - p.x, dy = p.target.y - p.y;
      const d = Math.hypot(dx, dy);
      const step = p.speed * dt;
      if (d <= step + 4) {
        // 命中
        if (p.splash > 0) {
          this._burst(p.target.x, p.target.y, p.color, 12);
          AudioMan.play('explosion', 0.3);
          this.enemies.forEach(e => {
            if (!e.dead && Math.hypot(e.x - p.target.x, e.y - p.target.y) < p.splash) this._damage(e, p.dmg);
          });
          this.shake = Math.max(this.shake, 3);
        } else {
          this._damage(p.target, p.dmg);
          this._particle(p.target.x, p.target.y, p.color);
          if (p.slow) this._slow(p.target, p.slow, p.slowTime);
          AudioMan.play('hit', 0.2);
        }
        p._remove = true;
      } else {
        p.x += dx / d * step; p.y += dy / d * step;
        p.mesh.position.set(p.x, p.y, 4);
      }
    }
    this.projectiles = this.projectiles.filter(p => {
      if (p._remove) { this.scene.remove(p.mesh); return false; }
      return true;
    });
  }

  _slow(e, factor, time) {
    e.slowFactor = Math.min(e.slowFactor, 1 - factor);
    e.slowT = Math.max(e.slowT, time);
  }

  _damage(e, amount, opt = {}) {
    if (e.dead) return;
    const real = Math.max(1, amount - (e.armor || 0));
    e.hp -= real;
    if (opt.knock) { e.dist = Math.max(0, e.dist - opt.knock); }
    // 受击闪白
    e.mesh.material.color.setHex(0xffffff);
    setTimeout(() => { if (e.mesh && !e.dead) e.mesh.material.color.setHex(0xffffff); }, 40);
    if (e.hp <= 0) {
      e.dead = true; e._remove = true;
      this.gold += e.def.reward;
      this._burst(e.x, e.y, e.def.color, e.def.boss ? 40 : 12);
      if (e.def.boss) { this.shake = 20; AudioMan.play('skill_ultimate', 0.6); }
      else AudioMan.play('die', 0.25);
      this._updateHud();
    }
  }

  _particle(x, y, color) {
    const m = new THREE.Mesh(
      new THREE.CircleGeometry(3, 6),
      new THREE.MeshBasicMaterial({ color, transparent: true })
    );
    m.position.set(x, y, 6);
    this.scene.add(m);
    this.particles.push({ mesh: m, life: 0, max: 0.4, vx: (Math.random() - 0.5) * 80, vy: (Math.random() - 0.5) * 80 });
  }

  _burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(
        new THREE.CircleGeometry(2 + Math.random() * 3, 6),
        new THREE.MeshBasicMaterial({ color, transparent: true })
      );
      m.position.set(x, y, 6);
      this.scene.add(m);
      const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 140;
      this.particles.push({ mesh: m, life: 0, max: 0.5 + Math.random() * 0.3, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp });
    }
  }

  _updateParticles(dt) {
    this.particles = this.particles.filter(p => {
      p.life += dt;
      if (p.life >= p.max) { this.scene.remove(p.mesh); return false; }
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.material.opacity = 1 - p.life / p.max;
      return true;
    });
  }

  _updateEffects(dt) {
    this.effects = this.effects.filter(f => {
      f.life += dt;
      if (f.life >= f.max) { this.scene.remove(f.mesh); return false; }
      f.mesh.rotation.z += f.spin * dt;
      f.mesh.material.opacity = 0.95 * (1 - f.life / f.max);
      f.mesh.scale.setScalar(1 + f.life * 0.8);
      return true;
    });
  }

  _win() {
    this.state = 'won';
    AudioMan.play('skill_ultimate', 0.8);
    UI.showResult(true, this);
  }
  _lose() {
    this.state = 'lost';
    UI.showResult(false, this);
  }

  _updateHud() {
    UI.updateHud(this);
  }

  destroy() {
    this.container.innerHTML = '';
    this.renderer.dispose();
  }
}
