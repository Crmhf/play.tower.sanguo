// 核心战斗引擎：Three.js 正交渲染 + 塔防逻辑 + 粒子 + 屏震
// 武将以积分召唤上阵当「塔」，固定槽位，可升 3 星
class Game {
  constructor(container, levelIdx) {
    this.container = container;
    this.levelIdx = levelIdx;
    this.level = LEVELS[levelIdx];

    // 科技树加成
    this.tech = Tech.mods();

    // 势力羁绊（在场武将联动加成/削弱，build/sell 时重算）
    this.synergy = { mods:{}, debuff:{}, active:[], count:{wei:0,shu:0,wu:0,qun:0} };

    // 资源（积分，应用科技）
    this.gold = this.level.startGold + this.tech.startGold;
    this.lives = Math.round(this.level.startLives * (1 + this.tech.livesMult));
    this.maxLives = this.lives;

    // 状态
    this.state = 'build';            // build | wave | won | lost
    this.waveIdx = -1;
    this.spawnQueue = [];
    this.enemies = [];
    this.towers = [];
    this.projectiles = [];
    this.particles = [];
    this.shake = 0;
    this.time = 0;
    this.speed = 1;
    this._floaters = [];              // DOM 飘字（随 dt 推进，后台不堆积）

    this._setupThree();
    this._initParticles();            // 单一 THREE.Points 承载全部粒子（1 次 draw call）
    this._buildPath();
    this._buildSlots();
    this._buildRangeRing();
    this._buildDecor();
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

  // ---------- 统一粒子系统：单一 THREE.Points 承载全部粒子（整场 1 次 draw call） ----------
  // 自定义 ShaderMaterial 以真正读取每粒子 aAlpha/aSize（PointsMaterial 不支持逐粒子属性）。
  // additive 混合下黑色即透明，故 aColor 直接随生命衰减到黑即淡出；aAlpha 恒 1 占位。
  _initParticles() {
    const MAX = this.MAX_PARTICLES = 600;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(MAX * 3);
    const col = new Float32Array(MAX * 3);
    const aSize = new Float32Array(MAX);
    const aAlpha = new Float32Array(MAX);
    // 初始全部移到屏外并隐藏
    for (let i = 0; i < MAX; i++) { pos[i * 3 + 1] = -9999; aAlpha[i] = 0; }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(aAlpha, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aSize; attribute float aAlpha; attribute vec3 aColor;
        varying float vA; varying vec3 vC;
        void main(){ vA=aAlpha; vC=aColor; gl_PointSize=aSize;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `
        varying float vA; varying vec3 vC;
        void main(){ vec2 d=gl_PointCoord-vec2(0.5); float a=smoothstep(0.5,0.1,length(d));
          gl_FragColor=vec4(vC, a*vA); }`
    });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 60;
    this.scene.add(this.points);
    this._pMax = MAX;
    this._pCursor = 0;                 // 环形写入游标
    this._pData = new Array(MAX);      // 平行数组：{x,y,vx,vy,life,max,r,g,b,size,grow}
    for (let i = 0; i < MAX; i++) this._pData[i] = { life: -1 };
  }

  // 写入一个粒子（环形覆盖最旧槽）。color 为 0xRRGGBB。
  _emit(x, y, color, opt = {}) {
    const i = this._pCursor; this._pCursor = (this._pCursor + 1) % this._pMax;
    const d = this._pData[i];
    d.x = x; d.y = y;
    d.vx = opt.vx !== undefined ? opt.vx : (Math.random() - 0.5) * 80;
    d.vy = opt.vy !== undefined ? opt.vy : (Math.random() - 0.5) * 80;
    d.life = 0; d.max = opt.max || 0.45;
    d.r = ((color >> 16) & 255) / 255; d.g = ((color >> 8) & 255) / 255; d.b = (color & 255) / 255;
    d.size = opt.size || 7; d.grow = opt.grow || 0;   // grow>0：命中闪光，半径随生命膨胀
    const posAttr = this.points.geometry.attributes.position;
    posAttr.array[i * 3] = x; posAttr.array[i * 3 + 1] = y; posAttr.array[i * 3 + 2] = 6;
    this.points.geometry.attributes.aAlpha.array[i] = 1;
  }

  _particle(x, y, color, scale = 1, max = 0.4) {
    this._emit(x, y, color, { size: 7 * scale, max });
  }

  _burst(x, y, color, n) {
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 150;
      this._emit(x, y, color, { vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, size: 5 + Math.random() * 6, max: 0.5 + Math.random() * 0.3 });
    }
  }

  // 命中闪光：一颗快速膨胀并淡出的亮点
  _flash(x, y, color, r) {
    this._emit(x, y, color, { vx: 0, vy: 0, size: r * 2, max: 0.16, grow: r });
  }

  _updateParticles(dt) {
    const posAttr = this.points.geometry.attributes.position;
    const colAttr = this.points.geometry.attributes.aColor;
    const sizeAttr = this.points.geometry.attributes.aSize;
    const alphaAttr = this.points.geometry.attributes.aAlpha;
    const pos = posAttr.array, col = colAttr.array;
    for (let i = 0; i < this._pMax; i++) {
      const d = this._pData[i];
      if (d.life < 0) continue;                 // 空槽
      d.life += dt;
      if (d.life >= d.max) { d.life = -1; alphaAttr.array[i] = 0; pos[i * 3 + 1] = -9999; continue; }
      const k = d.life / d.max;                  // 0→1
      d.x += d.vx * dt; d.y += d.vy * dt;
      pos[i * 3] = d.x; pos[i * 3 + 1] = d.y;
      const fade = 1 - k;                        // additive：颜色衰减到黑 = 透明
      col[i * 3] = d.r * fade; col[i * 3 + 1] = d.g * fade; col[i * 3 + 2] = d.b * fade;
      sizeAttr.array[i] = d.grow ? d.grow * (0.5 + k * 1.2) * 2 : d.size;
    }
    posAttr.needsUpdate = true; colAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true; alphaAttr.needsUpdate = true;
  }

  // ---------- 射程圈：hover/选中塔时显示的呼吸虚线圈 ----------
  _buildRangeRing() {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1, 1.05, 48),
      new THREE.MeshBasicMaterial({ color: 0xffd98a, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide })
    );
    const fill = new THREE.Mesh(
      new THREE.CircleGeometry(1, 48),
      new THREE.MeshBasicMaterial({ color: 0xffd98a, transparent: true, opacity: 0.07, depthWrite: false })
    );
    g.add(ring); g.add(fill);
    g.position.z = 2.5; g.visible = false;
    g.renderOrder = 25;
    this.scene.add(g);
    this.rangeRing = g; this._ringMat = ring.material; this._rangeTower = null;
  }
  _showRange(tower) {
    this._rangeTower = tower;
    const c = tower.hero.projColor || 0xffd98a;
    this._ringMat.color.setHex(c);
    this.rangeRing.position.set(tower.slot.x, tower.slot.y, 2.5);
    this.rangeRing.scale.set(tower.range, tower.range, 1);
    this.rangeRing.visible = true;
  }
  _hideRange() { this.rangeRing.visible = false; this._rangeTower = null; }

  // ---------- 战场装饰：基地旁与路径拐角的程序化小旗（正弦摆动） ----------
  _buildDecor() {
    this.decors = [];
    const spots = [this.basePos];
    for (let i = 1; i < this.path.length - 1; i++) spots.push(this.path[i]);
    const cols = [0xc0392b, 0xd8a93a, 0x3a7bd5];
    spots.slice(0, 6).forEach((s, idx) => {
      const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(16, 11),
        new THREE.MeshBasicMaterial({ color: cols[idx % cols.length], transparent: true, opacity: 0.9, depthWrite: false })
      );
      flag.position.set(s.x + 20, s.y - 26, -3);
      flag.renderOrder = 5;
      // 顶点锚在左边缘，便于绕杆摆动
      flag.geometry.translate(8, 0, 0);
      this.scene.add(flag);
      // 旗杆
      const pole = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 26),
        new THREE.MeshBasicMaterial({ color: 0x5a4a2a, transparent: true, opacity: 0.9, depthWrite: false })
      );
      pole.position.set(s.x + 20, s.y - 13, -3.1);
      pole.renderOrder = 4;
      this.scene.add(pole);
      this.decors.push({ mesh: flag, phase: Math.random() * 6.28 });
    });
  }

  // 环境装饰每帧更新：旗帜摆动 + 槽位/基地呼吸 + 射程圈脉冲
  _updateAmbient(dt) {
    // 旗帜
    for (const d of this.decors) d.mesh.rotation.z = Math.sin(this.time * 2 + d.phase) * 0.28;
    // 路径行军方向箭头：纹理 offset 递减 → 朝行进方向流动
    for (const t of this._pathArrows) t.offset.x -= dt * 0.5;
    // 空槽呼吸（可建提示）
    for (const s of this.slots) {
      if (s.tower) continue;
      const base = (s === this.hoverSlot);
      s.mesh.material.opacity = base ? 0.5 : 0.16 + 0.07 * Math.sin(this.time * 2.5 + s.x * 0.05);
      const sc = base ? 1.2 : 1;
      if (s.mesh.scale.x !== sc) s.mesh.scale.setScalar(sc);
    }
    // 基地光环脉动 + 漏怪变红预警
    if (this.baseHalo) {
      const danger = this.enemies.some(e => !e.dead && e.seg >= this.path.length - 2);
      const pulse = 0.3 + 0.18 * Math.sin(this.time * (danger ? 8 : 2.5));
      this.baseHalo.material.opacity = pulse;
      this.baseHalo.material.color.setHex(danger ? 0xff4040 : 0x3aa0ff);
      const hs = 1 + 0.08 * Math.sin(this.time * (danger ? 8 : 2.5));
      this.baseHalo.scale.set(hs, hs, 1);
    }
    // 射程圈呼吸 + 卖出惰性隐藏
    if (this.rangeRing.visible) {
      if (this._rangeTower && !this._rangeTower.slot.tower) this._hideRange();
      else this._ringMat.opacity = 0.5 + 0.22 * Math.sin(this.time * 4);
    }
  }

  // DOM 伤害飘字随 dt 推进（后台标签页不会堆积 setTimeout 节点）
  _updateFloaters(dt) {
    this._floaters = this._floaters.filter(f => {
      f.life += dt;
      if (f.life >= f.max) { f.el.remove(); return false; }
      f.el.style.transform = `translate(-50%,-50%) translateY(${-f.life * 46}px)`;
      f.el.style.opacity = 1 - f.life / f.max;
      return true;
    });
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
    this._pathArrows = [];
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
      // 行军方向流动箭头（纹理 offset 滚动，恒朝行进方向）
      const atex = new THREE.CanvasTexture(this._makeArrowCanvas());
      atex.wrapS = THREE.RepeatWrapping;
      atex.repeat.x = Math.max(1, Math.round(len / 46));
      const arrow = new THREE.Mesh(
        new THREE.PlaneGeometry(len, 30),
        new THREE.MeshBasicMaterial({ map: atex, transparent: true, opacity: 0.28, depthWrite: false })
      );
      arrow.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, -5.5);
      arrow.rotation.z = Math.atan2(b.y - a.y, b.x - a.x);
      arrow.renderOrder = 3;
      this.scene.add(arrow);
      this._pathArrows.push(atex);
    }
    // 基地（终点）
    const base = new THREE.Mesh(
      new THREE.CircleGeometry(26, 24),
      new THREE.MeshBasicMaterial({ color: 0x3aa0ff, transparent: true, opacity: 0.8 })
    );
    const end = this.path[this.path.length - 1];
    base.position.set(end.x, end.y, -4);
    this.scene.add(base);
    this.baseMesh = base;
    // 基地光环（脉动 + 漏怪变红预警）
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(30, 40, 32),
      new THREE.MeshBasicMaterial({ color: 0x3aa0ff, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide })
    );
    halo.position.set(end.x, end.y, -3.5);
    halo.renderOrder = 4;
    this.scene.add(halo);
    this.baseHalo = halo;
    this.basePos = end;
  }

  // 程序化生成「行军方向」箭头纹理（朝 +x，即段局部行进方向）
  _makeArrowCanvas() {
    const c = document.createElement('canvas'); c.width = 46; c.height = 30;
    const g = c.getContext('2d');
    g.strokeStyle = '#e8c86a'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath();
    g.moveTo(8, 22); g.lineTo(30, 15); g.lineTo(8, 8);   // › 形箭头
    g.stroke();
    return c;
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
    // hover 到已建塔：显示射程圈
    if (this.hoverSlot && this.hoverSlot.tower) this._showRange(this.hoverSlot.tower);
    else if (this._rangeTower && !document.getElementById('upgrade-panel').classList.contains('show')) this._hideRange();
  }

  _onClick(e) {
    const p = this._toWorld(e);
    const slot = this.slots.find(s => Math.hypot(s.x - p.x, s.y - p.y) < 22);
    if (slot) {
      if (slot.tower) { UI.showUpgradePanel(this, slot); this._showRange(slot.tower); }
      else UI.showBuildWheel(this, slot, e.clientX, e.clientY);
    } else {
      UI.hidePanels();
      this._hideRange();
    }
  }

  // ---------- 召唤武将 / 升级 ----------
  buildTower(slot, heroKey) {
    const hero = HEROES[heroKey];
    if (!hero) return false;
    if (this.gold < hero.cost) { UI.toast('积分不足'); return false; }
    this.gold -= hero.cost;
    const tex = Assets.tex(hero.img);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(52, 52),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, color: tex ? 0xffffff : hero.color })
    );
    mesh.position.set(slot.x, slot.y, 1);
    this.scene.add(mesh);
    slot.mesh.visible = false;
    const tower = {
      heroKey, hero, lvl: 0, slot, mesh,
      cd: 0, ...this._towerStats(hero, 0)
    };
    slot.tower = tower;
    tower.animSeed = Math.random() * 6.28;
    tower.attackT = 0;
    this.towers.push(tower);
    this._recalcSynergy();
    AudioMan.play('attack_sword', 0.3);
    this._updateHud();
    return true;
  }

  // 重算势力羁绊：在场武将变化时调用，重新计算全场加成并把结果叠回每座塔
  _recalcSynergy() {
    const fielded = this.towers.map(t => t.heroKey);
    this.synergy = Synergy.compute(fielded);
    // 把新羁绊数值叠回所有塔（保持已升的星级不变）
    this.towers.forEach(t => Object.assign(t, this._towerStats(t.hero, t.lvl)));
  }

  _towerStats(hero, lvl) {
    const s = hero.levels[lvl];
    const p = hero.passive;
    const syn = this.synergy.mods, deb = this.synergy.debuff;
    // 增益（个体特性 + 科技 + 羁绊）− 削弱（羁绊内耗），保底不为负
    const dmgMul  = Math.max(0.2, 1 + (p.damage||0)      + this.tech.damage      + (syn.damage||0)      - (deb.damage||0));
    const rateMul = Math.max(0.2, 1 + (p.attackSpeed||0) + this.tech.attackSpeed + (syn.attackSpeed||0) - (deb.attackSpeed||0));
    const rngMul  = Math.max(0.2, 1 + (p.range||0)       + this.tech.range       + (syn.range||0)       - (deb.range||0));
    let dmg = s.damage * dmgMul;
    let rate = s.rate * rateMul;
    let range = s.range * rngMul;
    return { damage: dmg, range, rate,
             slow: s.slow ? Math.min(0.8, s.slow * (1 + (p.slow||0) + (syn.slow||0))) : 0,
             slowTime: s.slowTime,
             splash: hero.splash ? hero.splash * (1 + (p.splash||0) + (syn.splash||0)) : 0,
             pierce: (hero.pierce||0) + this.tech.pierce + (syn.pierce||0),
             bossKiller: !!hero.bossKiller,
             projColor: hero.projColor };
  }

  upgradeTower(slot) {
    const t = slot.tower;
    if (!t || t.lvl >= 2) { UI.toast('已满级'); return; }
    const cost = t.hero.levels[t.lvl + 1].cost;
    if (this.gold < cost) { UI.toast('积分不足'); return; }
    this.gold -= cost;
    t.lvl++;
    Object.assign(t, this._towerStats(t.hero, t.lvl));
    t.mesh.scale.setScalar(1 + t.lvl * 0.15);
    // 升级特效
    this._burst(slot.x, slot.y, 0xffe08a, 14);
    AudioMan.play('skill_cast', 0.4);
    this._updateHud();
  }

  sellTower(slot) {
    const t = slot.tower;
    if (!t) return;
    let refund = Math.floor(t.hero.cost * 0.7);
    for (let i = 1; i <= t.lvl; i++) refund += Math.floor(t.hero.levels[i].cost * 0.7);
    this.gold += refund;
    this.scene.remove(t.mesh);
    this.towers = this.towers.filter(x => x !== t);
    slot.tower = null; slot.mesh.visible = true;
    this._recalcSynergy();
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
    // 出兵号角：出兵口错相位金色冲击环
    const s = this.path[0];
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this._ringFX(s.x, s.y, 0xffd98a), i * 130);
    }
  }

  // 冲击环：一片快速放大淡出的圆（用 Points 闪光近似，叠两道大小错开形成环感）
  _ringFX(x, y, color) {
    this._emit(x, y, color, { vx: 0, vy: 0, size: 20, max: 0.5, grow: 34 });
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
      poisonT: 0, poisonDps: 0, fearT: 0, charmT: 0,
      healTick: 0, summonTick: 0, regen: def.regen || 0,
      stealth: def.stealth || false,
      wob: Math.random() * Math.PI * 2, dead: false
    });
    if (def.stealth) mesh.material.opacity = 0.35;
    // Boss 登场仪式：横幅 + 中幅震 + 出场闪光
    if (def.boss) {
      this.shake = Math.max(this.shake, 10);
      AudioMan.play('skill_ultimate', 0.5);
      this._flash(start.x, start.y, 0xff4040, 36);
      UI.bossBanner(def.name);
    }
  }

  // ---------- 主循环 ----------
  update(dt) {
    dt *= this.speed;
    this.time += dt;
    // 屏幕震动：指数平滑衰减，避免长时间乱晃
    this.shake *= Math.max(0, 1 - dt * 6);
    if (this.shake < 0.05) this.shake = 0;

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
    this._updateFloaters(dt);
    this._updateAmbient(dt);

    // 波次结束判定
    if (this.state === 'wave' && this.spawnQueue.length === 0 && this.enemies.length === 0) {
      if (this.waveIdx >= this.level.waves.length - 1) {
        this._win();
      } else {
        this.state = 'build';
        this.gold += 30 + this.waveIdx * 5 + this.tech.interest;
        this.lives = Math.min(this.maxLives, this.lives + this.tech.regen);
        UI.setWaveBtn(true);
        UI.toast('本波已清剿，整备后继续');
      }
      this._updateHud();
    }
  }

  render() {
    // 相机震动
    const sx = (Math.random() - 0.5) * this.shake, sy = (Math.random() - 0.5) * this.shake;
    this.camera.position.set(sx, sy, 100);
    this.renderer.render(this.scene, this.camera);
  }

  _updateEnemies(dt) {
    for (const e of this.enemies) {
      if (e.dead) continue;
      // 受击闪白恢复（dt 计时器）
      if (e._flashT > 0) { e._flashT -= dt; if (e._flashT <= 0 && e._origColor !== undefined) e.mesh.material.color.setHex(e._origColor); }
      // 持续伤害：灼烧 + 中毒
      if (e.burnT > 0) { e.burnT -= dt; this._damage(e, e.burnDps * dt, { silent: true }); if (Math.random() < dt * 6) this._particle(e.x, e.y, 0xff7030); }
      if (e.poisonT > 0) { e.poisonT -= dt; this._damage(e, e.poisonDps * dt, { silent: true }); if (Math.random() < dt * 4) this._particle(e.x, e.y, 0xa04ad8); }
      if (e.dead) continue;
      // Boss 回血
      if (e.regen > 0) e.hp = Math.min(e.maxHp, e.hp + e.regen * dt);
      // 治疗兵 / 妖术师：治疗周围友军
      if (e.def.heal) {
        e.healTick -= dt;
        if (e.healTick <= 0) {
          e.healTick = 1.0;
          this.enemies.forEach(o => {
            if (!o.dead && o !== e && Math.hypot(o.x - e.x, o.y - e.y) < 120) {
              o.hp = Math.min(o.maxHp, o.hp + e.def.heal);
              this._particle(o.x, o.y, 0x4ad88a);
            }
          });
        }
      }
      // 召唤者：周期召唤小怪
      if (e.def.summon) {
        e.summonTick -= dt;
        if (e.summonTick <= 0 && this.enemies.length < 120) {
          e.summonTick = 4.0;
          const s = { ...this._spawnAt(e.def.summon, e.seg, e.dist) };
        }
      }
      // 减速
      if (e.slowT > 0) { e.slowT -= dt; if (e.slowT <= 0) e.slowFactor = 1; }
      // 恐惧 / 眩晕：原地不动
      if (e.stunT > 0) { e.stunT -= dt; continue; }
      if (e.fearT > 0) { e.fearT -= dt; continue; }
      // 魅惑：自相残杀（攻击最近的友军）
      if (e.charmT > 0) {
        e.charmT -= dt;
        let tgt = null, md = 1e9;
        this.enemies.forEach(o => { if (!o.dead && o !== e) { const d = Math.hypot(o.x-e.x, o.y-e.y); if (d < md) { md = d; tgt = o; } } });
        if (tgt && md < 60) this._damage(tgt, 30 * dt * 5, { silent: true });
        continue; // 魅惑时不前进
      }

      // 沿路径移动
      const chargeMul = (e.def.charge && e.hp < e.maxHp * 0.5) ? 2.2 : 1; // 吕布半血冲撞
      const sp = e.speed * e.slowFactor * chargeMul;
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
      // 行走摆动
      e.wob += dt * 10;
      e.mesh.position.set(e.x, e.y + Math.sin(e.wob) * 2, 2);
      const face = (b.x - a.x) < 0 ? -1 : 1;
      e.mesh.scale.x = face;
      // 隐身透明度呼吸
      if (e.stealth) e.mesh.material.opacity = 0.25 + Math.abs(Math.sin(this.time * 3)) * 0.2;
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

  // 在指定路径位置召唤（供召唤者用）
  _spawnAt(typeId, seg, dist) {
    this._spawn(typeId);
    const ne = this.enemies[this.enemies.length - 1];
    ne.seg = seg; ne.dist = Math.max(0, dist - 20);
    return ne;
  }

  _reachBase(e) {
    e._remove = true; e.dead = true;
    this.lives -= e.def.boss ? 5 : 1;
    this._burst(e.x, e.y, 0xff4040, 10);
    this.shake = Math.max(this.shake, 10);
    AudioMan.play('hit', 0.5);
    UI.hurtFlash();
    this._updateHud();
    if (this.lives <= 0) this._lose();
  }

  _updateTowers(dt) {
    for (const t of this.towers) {
      // 待机浮动 + 开火冲量（务必放在冷却 continue 之前，否则冷却中的塔会冻结）
      const idleY = Math.sin(this.time * 2 + t.animSeed) * 1.5;
      if (t.attackT > 0) {
        t.attackT -= dt;
        const k = 1 + Math.max(0, t.attackT) * 0.9;
        t.mesh.scale.setScalar((1 + t.lvl * 0.15) * k);
      } else {
        t.mesh.scale.setScalar(1 + t.lvl * 0.15);
      }
      t.cd -= dt;
      if (t.cd > 0) { t.mesh.position.y = t.slot.y + idleY; continue; }
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
        t.attackT = 0.18;               // 开火后坐冲量
        this._fire(t, target);
        // 炮口朝向
        t.mesh.rotation.z = Math.atan2(target.y - t.slot.y, target.x - t.slot.x);
        t.mesh.position.y = t.slot.y + idleY;
      } else {
        t.mesh.position.y = t.slot.y + idleY;
      }
    }
  }

  _fire(t, target) {
    const crit = Math.random() < ((t.hero.passive.crit || 0) + this.tech.crit + (this.synergy.mods.crit || 0));
    let dmg = t.damage * (crit ? 2 : 1);
    if (t.bossKiller && target.def.boss) dmg *= 2;   // 吕布等克 Boss
    const m = new THREE.Mesh(
      new THREE.CircleGeometry(5, 8),
      new THREE.MeshBasicMaterial({ color: t.projColor })
    );
    m.position.set(t.slot.x, t.slot.y, 4);
    this.scene.add(m);
    this.projectiles.push({
      mesh: m, target, x: t.slot.x, y: t.slot.y,
      speed: 460, dmg, splash: t.splash || 0, crit,
      slow: t.slow, slowTime: t.slowTime, color: t.projColor,
      poison: !!t.hero.passive.poison   // 司马懿：攻击附毒
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
        this._flash(p.target.x, p.target.y, p.color, 9);
        if (p.splash > 0) {
          this._burst(p.target.x, p.target.y, p.color, 12);
          AudioMan.play('explosion', 0.3);
          this.enemies.forEach(e => {
            if (!e.dead && Math.hypot(e.x - p.target.x, e.y - p.target.y) < p.splash) this._damage(e, p.dmg, { crit: p.crit });
          });
          this.shake = Math.max(this.shake, 4);
        } else {
          this._damage(p.target, p.dmg, { crit: p.crit });
          this._particle(p.target.x, p.target.y, p.color);
          if (p.slow) this._slow(p.target, p.slow, p.slowTime);
          if (p.poison && !p.target.dead) { p.target.poisonT = 3; p.target.poisonDps = p.dmg * 0.3; }
          AudioMan.play('hit', 0.2);
        }
        p._remove = true;
      } else {
        p.x += dx / d * step; p.y += dy / d * step;
        p.mesh.position.set(p.x, p.y, 4);
        // 弹道拖尾（弹越快残影越明显）
        if (Math.random() < dt * 28) this._particle(p.x, p.y, p.color, 0.55, 0.22);
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
    // 受击闪白：用 dt 计时器（不用 setTimeout，规避后台节流/状态错乱），恢复原色
    if (!opt.silent) {
      e._origColor = e.mesh.material.map ? 0xffffff : e.def.color;
      e.mesh.material.color.setHex(0xffffff);
      e._flashT = 0.06;
      // 暴击飘字（金色大字）
      if (opt.crit) this._spawnFloater(e.x, e.y - e.def.size / 2 - 8, Math.round(real), true);
    }
    if (e.hp <= 0) {
      e.dead = true; e._remove = true;
      // 击杀积分 = 兵种基础分 × 关卡难度系数 × 科技加成
      this.gold += Math.round(e.def.score * this.level.diff * (1 + this.tech.goldMult));
      // 击杀反馈按体型/重要性分级
      const n = e.def.boss ? 40 : (e.def.size >= 44 ? 22 : 16);
      this._burst(e.x, e.y, e.def.color, n);
      if (e.def.boss) {
        this._flash(e.x, e.y, 0xffffff, 44);
        this._burst(e.x, e.y, 0xffe08a, 22);          // 金屑
        this.shake = Math.max(this.shake, 18);
        AudioMan.play('skill_ultimate', 0.6);
      } else {
        this.shake = Math.max(this.shake, 1.5);
        AudioMan.play('die', 0.25);
      }
      this._updateHud();
    }
  }

  // 在 #stage 内生成一个 DOM 飘字（交由 _updateFloaters 随 dt 推进/清理）
  _spawnFloater(wx, wy, text, crit) {
    if (this._floaters.length > 40) return;            // 上限保险丝
    const stage = document.getElementById('stage');
    if (!stage) return;
    const el = document.createElement('div');
    el.className = 'dmg-num' + (crit ? ' crit' : '');
    el.textContent = crit ? '暴 ' + text : text;
    // 世界坐标 → stage 内像素（考虑 canvas 实际显示缩放）
    const canvas = this.renderer.domElement;
    const scale = canvas.clientWidth ? (canvas.clientWidth / CANVAS_W) : 1;
    el.style.left = (wx * scale) + 'px';
    el.style.top = (wy * scale) + 'px';
    stage.appendChild(el);
    this._floaters.push({ el, life: 0, max: 0.7 });
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
    // 释放粒子系统与渲染器，避免泄漏
    if (this.points) { this.points.geometry.dispose(); this.points.material.dispose(); }
    this.renderer.dispose();
  }
}
