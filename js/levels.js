// 50 关：5章 × 10，新剧情 + 10 种手写地形 + 难度曲线
const CANVAS_W = 960, CANVAS_H = 600;

// 10 种手写地形路径（坐标基于 960×600）
const PATHS = {
  // 第1章 单路 S 弯
  single_a: [[0,120],[300,120],[300,320],[640,320],[640,150],[960,150]],
  single_b: [[0,480],[260,480],[260,180],[600,180],[600,460],[960,460]],
  // 第2章 双路分流（取主路）
  double_a: [[0,300],[250,300],[250,90],[720,90],[720,300],[960,300]],
  double_b: [[0,200],[400,200],[400,420],[680,420],[680,120],[960,120]],
  // 第3章 圈地环形
  ring_a:   [[0,100],[860,100],[860,500],[100,500],[100,250],[700,250],[700,420],[960,420]],
  ring_b:   [[0,520],[520,520],[520,80],[120,80],[120,320],[840,320],[840,200],[960,200]],
  // 第4章 路口四入（主路）
  cross_a:  [[0,90],[180,90],[180,510],[520,510],[520,200],[760,200],[760,420],[960,420]],
  cross_b:  [[0,300],[320,300],[320,80],[640,80],[640,520],[960,520]],
  // 第5章 沙漏收窄
  hour_a:   [[0,150],[380,150],[380,300],[200,300],[200,450],[760,450],[760,250],[960,250]],
  hour_b:   [[0,80],[240,80],[240,380],[720,380],[720,120],[480,120],[480,300],[960,300]]
};

const CHAPTERS = [
  { name:'第1章·黄巾起义', bg:'plain',   paths:['single_a','single_b'], reward:'解锁关羽' },
  { name:'第2章·群雄割据', bg:'forest',  paths:['double_a','double_b'], reward:'解锁张飞' },
  { name:'第3章·官渡之战', bg:'river',   paths:['ring_a','ring_b'],     reward:'解锁赵云' },
  { name:'第4章·赤壁之战', bg:'volcano', paths:['cross_a','cross_b'],   reward:'解锁黄忠' },
  { name:'第5章·三国归晋', bg:'snow',    paths:['hour_a','hour_b'],     reward:'解锁诸葛亮+吕布' }
];

const BG_IMG = {
  menu:'assets/img/backgrounds/menu_bg.webp',
  plain:'assets/img/backgrounds/bg_plain.webp',
  forest:'assets/img/backgrounds/bg_forest.webp',
  river:'assets/img/backgrounds/bg_river.webp',
  snow:'assets/img/backgrounds/bg_snow.webp',
  volcano:'assets/img/backgrounds/bg_volcano.webp',
  boss:'assets/img/backgrounds/bg_boss.webp'
};

// 每 10 关的章节 Boss
const CHAPTER_BOSS = { 10:'zhangliang', 20:'lvbu_boss', 30:'yanliang', 40:'zhouyu', 50:'simayi_boss' };

// 按章节解锁的兵种群
function enemyPool(lvl) {
  const pool = ['huangjin'];
  if (lvl >= 3)  pool.push('cavalry');
  if (lvl >= 6)  pool.push('shield', 'archer');
  if (lvl >= 9)  pool.push('ram');
  if (lvl >= 12) pool.push('catapult');
  if (lvl >= 16) pool.push('assassin');
  if (lvl >= 22) pool.push('elite');
  if (lvl >= 33) pool.push('healer', 'fireship');
  if (lvl >= 42) pool.push('elephant', 'sorcerer');
  return pool;
}

// 难度曲线：血量倍数（平滑阶梯，避免章间断崖；后段略抬提供终局张力）
function hpMult(lvl) {
  if (lvl <= 10) return 1.0;
  if (lvl <= 20) return 1.2;
  if (lvl <= 30) return 1.45;
  if (lvl <= 35) return 1.62;
  if (lvl <= 40) return 1.9;
  if (lvl <= 45) return 2.4;
  return 2.85;
}

// 兵种按战场角色分类（编队设计用）
const ROLE = {
  fodder:  ['huangjin', 'archer'],                 // 炮灰/炮灰输出
  fast:    ['cavalry', 'assassin'],                // 快速奇袭
  tank:    ['shield', 'ram', 'elephant'],          // 重装前锋
  ranged:  ['catapult', 'fireship'],               // 远程/火攻
  elite:   ['elite'],                              // 精英
  support: ['healer', 'sorcerer']                  // 辅助(治疗/召唤)
};

// 每章的「主力兵种谱」——决定该章出场的兵种池（有主题，不是大杂烩）
// vanguard前锋 / core中军 / flank奇袭 / support辅助（按章节逐步解锁）
const CHAPTER_ARMY = [
  // 第1章 黄巾起义：黄巾为主 + 少量骑兵/盾兵，教学关
  { vanguard:['huangjin'], core:['huangjin','archer'], flank:['cavalry'], support:[] },
  // 第2章 群雄割据：加入盾兵/弓兵/冲车，正面推进
  { vanguard:['shield','huangjin'], core:['archer','cavalry'], flank:['ram'], support:[] },
  // 第3章 官渡之战：投石车远程 + 刺客奇袭 + 精英
  { vanguard:['shield','ram'], core:['catapult','archer'], flank:['assassin','cavalry'], support:['elite'] },
  // 第4章 赤壁之战：火船/投石车火攻 + 治疗兵续航
  { vanguard:['ram','shield'], core:['fireship','catapult'], flank:['assassin','elite'], support:['healer'] },
  // 第5章 三国归晋：战象/妖术师/精英全明星，多兵种协同
  { vanguard:['elephant','ram'], core:['elite','fireship'], flank:['assassin','cavalry'], support:['sorcerer','healer'] }
];

// 从候选中取一个该关已解锁的兵种（未解锁则回退到黄巾）
function pickAvail(cands, pool, fallback) {
  const ok = cands.filter(t => pool.includes(t));
  if (!ok.length) return fallback || pool[0];
  return ok[Math.floor(Math.random() * ok.length)];
}

function makeLevel(lvl) {
  const chapIdx = Math.min(4, Math.floor((lvl - 1) / 10));
  const chap = CHAPTERS[chapIdx];
  const pathKey = chap.paths[lvl % 2];         // 章内两种地形交替
  const isBoss = (lvl % 10 === 0);
  const diff = hpMult(lvl);

  // 波次数随关卡推进
  const waveCount = Math.min(5 + Math.floor(lvl / 4), 10);
  const pool = enemyPool(lvl);
  const army = CHAPTER_ARMY[chapIdx];
  const waves = [];

  // 每波怪数按难度段递增（平滑，避免第5章数量+血量双跳变叠加成断崖）
  const baseCount = lvl <= 10 ? 5 + lvl : (lvl <= 20 ? 20 : (lvl <= 30 ? 38 : (lvl <= 40 ? 58 : 72)));

  for (let w = 0; w < waveCount; w++) {
    const count = Math.min(baseCount + w * 3, 150);
    const phase = w / Math.max(1, waveCount - 1);   // 0=开局 → 1=末波
    const comp = [];
    const push = (type, n, interval = 0.8) => { if (n > 0) comp.push({ type, count: Math.max(1, Math.round(n)), interval }); };

    // —— 编队设计：先锋肉盾 → 中军输出 → 侧翼奇袭 → 精锐/辅助压阵 ——
    // 先锋（每波都有，扛线）：开局多为炮灰，后期换重装
    const vanType = pickAvail(phase < 0.4 ? army.vanguard.concat(ROLE.fodder) : army.vanguard, pool, 'huangjin');
    push(vanType, count * 0.26, 0.7);
    // 中军（主力输出）
    push(pickAvail(army.core, pool, 'archer'), count * 0.30, 0.85);
    // 侧翼奇袭（中后段才出，快速包抄）
    if (phase > 0.25) push(pickAvail(army.flank, pool, 'cavalry'), count * 0.16, 0.5);
    // 精锐/辅助压阵（末几波点缀，抬高潮）
    if (phase > 0.5 && army.support.length) {
      push(pickAvail(army.support, pool, null), Math.max(1, count * 0.05), 1.2);
    }
    // 每 5 波加一个精英带头（中期起）
    if ((w + 1) % 5 === 0 && lvl >= 20) push('elite', 1, 1);

    waves.push(comp);
  }

  // Boss 关：末波加入 Boss
  if (isBoss) {
    const bossType = CHAPTER_BOSS[lvl];
    const bossWave = [{ type: bossType, count: 1, interval: 1 }];
    if (lvl === 30) bossWave.push({ type: 'wenchou', count: 1, interval: 2 }); // 双 Boss
    if (lvl === 50) {  // 终极关三路围攻感：Boss + 大量精英
      bossWave.push({ type: 'elite', count: 4, interval: 2 }, { type: 'sorcerer', count: 3, interval: 3 });
    }
    waves.push(bossWave);
  }

  return {
    level: lvl,
    name: chap.name + ' · 第' + lvl + '关',
    chapter: chap.name,
    chapterReward: chap.reward,
    bg: (lvl === 50) ? 'boss' : chap.bg,
    path: PATHS[pathKey].map(p => ({ x: p[0], y: p[1] })),
    waves, diff,
    startGold: 280 + lvl * 10,
    startLives: 20,
    boss: isBoss
  };
}

const LEVELS = [];
for (let i = 1; i <= 50; i++) LEVELS.push(makeLevel(i));
