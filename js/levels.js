// 50 关数据：路径 + 波次，数据驱动，难度递增
// 坐标基于 960×600 逻辑画布。路径为敌军行进折线（起点→基地）。

const CANVAS_W = 960, CANVAS_H = 600;

// 5 种地形路径模板（对应 5 大章节背景）
const PATHS = {
  plain:   [[0,120],[300,120],[300,320],[640,320],[640,150],[960,150]],
  forest:  [[0,480],[200,480],[200,180],[430,180],[430,470],[680,470],[680,140],[960,140]],
  river:   [[0,300],[250,300],[250,90],[720,90],[720,510],[960,510]],
  snow:    [[0,200],[360,200],[360,420],[600,420],[600,120],[960,120]],
  volcano: [[0,90],[180,90],[180,510],[520,510],[520,200],[760,200],[760,420],[960,420]]
};

const CHAPTERS = [
  { name:'第1章 · 中原逐鹿', bg:'plain',   path:'plain'   },
  { name:'第2章 · 竹林伏兵', bg:'forest',  path:'forest'  },
  { name:'第3章 · 赤壁水战', bg:'river',   path:'river'   },
  { name:'第4章 · 北境雪原', bg:'snow',    path:'snow'    },
  { name:'第5章 · 魔域决战', bg:'volcano', path:'volcano' }
];

// 背景图文件名映射
const BG_IMG = {
  menu:'assets/img/backgrounds/menu_bg.jpg',
  plain:'assets/img/backgrounds/bg_plain.jpg',
  forest:'assets/img/backgrounds/bg_forest.jpg',
  river:'assets/img/backgrounds/bg_river.jpg',
  snow:'assets/img/backgrounds/bg_snow.jpg',
  volcano:'assets/img/backgrounds/bg_volcano.jpg',
  boss:'assets/img/backgrounds/bg_boss.jpg'
};

// 生成一关：lvl 1..50
function makeLevel(lvl) {
  const chap = CHAPTERS[Math.min(4, Math.floor((lvl - 1) / 10))];
  const diff = 1 + (lvl - 1) * 0.12;              // 难度系数
  const isBossStage = (lvl % 10 === 0);            // 每 10 关一个 Boss 关
  const waves = [];
  const waveCount = Math.min(6 + Math.floor(lvl / 5), 12);

  // 解锁的敌种随章节推进
  const pool = ['soldier'];
  if (lvl >= 3)  pool.push('cavalry');
  if (lvl >= 8)  pool.push('shield');
  if (lvl >= 13) pool.push('assassin');

  for (let w = 0; w < waveCount; w++) {
    const comp = [];
    const n = 4 + w + Math.floor(lvl / 3);
    for (let i = 0; i < Math.min(pool.length, 1 + Math.floor(w / 2)); i++) {
      const t = pool[Math.floor(Math.random() * pool.length)];
      comp.push({ type: t, count: Math.max(2, Math.floor(n / (i + 1) / 2)), interval: 0.9 });
    }
    waves.push(comp);
  }

  // Boss 关：最后一波加入 Boss
  if (isBossStage) {
    const bossType = lvl === 10 ? 'huaxiong' : (lvl === 30 ? 'dongzhuo' : (lvl === 50 ? 'demon' : 'huaxiong'));
    waves.push([{ type: bossType, count: lvl === 50 ? 1 : 1, interval: 1 },
                { type: 'soldier', count: 6, interval: 1.2 }]);
  }

  return {
    level: lvl,
    name: chap.name + ' · 第' + lvl + '关',
    chapter: chap.name,
    bg: isBossStage && lvl === 50 ? 'boss' : chap.bg,
    path: PATHS[chap.path].map(p => ({ x: p[0], y: p[1] })),
    waves,
    diff,
    startGold: 220 + lvl * 6,
    startLives: 20,
    boss: isBossStage
  };
}

// 预生成 50 关
const LEVELS = [];
for (let i = 1; i <= 50; i++) LEVELS.push(makeLevel(i));
