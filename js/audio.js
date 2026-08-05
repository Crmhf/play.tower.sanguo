// 音频管理：BGM + 音效（Web Audio）
const AudioMan = {
  ctx: null, buffers: {}, bgmSource: null, currentBgm: null,
  muted: false,

  init() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  // 预加载音效（小文件）
  async load() {
    const sfx = {
      attack_sword: 'assets/audio/sfx/attack_sword.mp3',
      hit: 'assets/audio/sfx/hit.mp3',
      skill_cast: 'assets/audio/sfx/skill_cast.mp3',
      skill_fire: 'assets/audio/sfx/skill_fire.wav',
      skill_thunder: 'assets/audio/sfx/skill_thunder.wav',
      skill_ultimate: 'assets/audio/sfx/skill_ultimate.wav',
      explosion: 'assets/audio/sfx/explosion.mp3',
      whoosh: 'assets/audio/sfx/whoosh.wav',
      die: 'assets/audio/sfx/die.wav',
      wave_horn: 'assets/audio/sfx/wave_horn.wav'
    };
    if (!this.ctx) return;
    const jobs = Object.entries(sfx).map(async ([k, u]) => {
      try {
        const r = await fetch(u); const ab = await r.arrayBuffer();
        this.buffers[k] = await this.ctx.decodeAudioData(ab);
      } catch (e) {}
    });
    await Promise.all(jobs);
  },

  play(name, vol = 0.7) {
    if (!this.ctx || this.muted || !this.buffers[name]) return;
    const s = this.ctx.createBufferSource();
    s.buffer = this.buffers[name];
    const g = this.ctx.createGain(); g.gain.value = vol;
    s.connect(g); g.connect(this.ctx.destination);
    s.start(0);
  },

  // BGM 用 <audio> 便于流式
  playBgm(name) {
    if (this.currentBgm === name) return;
    this.stopBgm();
    this.currentBgm = name;
    const el = new Audio('assets/audio/bgm/' + name);
    el.loop = true; el.volume = this.muted ? 0 : 0.5;
    el.play().catch(() => {});
    this.bgmEl = el;
  },
  stopBgm() { if (this.bgmEl) { this.bgmEl.pause(); this.bgmEl = null; } this.currentBgm = null; },
  toggleMute() {
    this.muted = !this.muted;
    if (this.bgmEl) this.bgmEl.volume = this.muted ? 0 : 0.5;
    return this.muted;
  }
};
