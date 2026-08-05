// 素材加载器：图片 + Three 纹理（精灵自动去除深色背景）
const Assets = {
  images: {}, textures: {},

  // 需要去背景的精灵（角色/塔/敌人/Boss 立绘）
  _isSprite(u) {
    return /heroes|towers|enemies|boss\//.test(u);
  },

  // 用 canvas 把接近纯黑/深灰的背景像素转为透明
  _chroma(img) {
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height);
    const px = d.data;
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], g = px[i + 1], b = px[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      const sat = mx - mn;
      // 很暗且低饱和 → 背景，按亮度渐变透明以柔化边缘
      if (lum < 48 && sat < 40) {
        px[i + 3] = 0;
      } else if (lum < 70 && sat < 30) {
        px[i + 3] = Math.min(255, (lum - 48) * 12);
      }
    }
    ctx.putImageData(d, 0, 0);
    return c;
  },

  load(onProgress) {
    const urls = new Set();
    Object.values(HEROES).forEach(h => { urls.add(h.img); urls.add(h.skill.effectImg); });
    Object.values(TOWERS).forEach(t => urls.add(t.img));
    Object.values(ENEMIES).forEach(e => urls.add(e.img));
    Object.values(BG_IMG).forEach(u => urls.add(u));

    const list = [...urls];
    let done = 0;
    const tick = () => { done++; onProgress && onProgress(done / list.length); };

    const jobs = list.map(u => new Promise(res => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const src = this._isSprite(u) ? this._chroma(img) : img;
          const tex = new THREE.Texture(src);
          tex.needsUpdate = true;
          this.textures[u] = tex;
        } catch (e) {
          this.textures[u] = new THREE.Texture(img);
          this.textures[u].needsUpdate = true;
        }
        tick(); res();
      };
      img.onerror = () => { tick(); res(); };
      img.src = u;
    }));
    return Promise.all(jobs);
  },

  tex(u) { return this.textures[u]; }
};
