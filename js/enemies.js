// 12 兵种 + 章节 Boss
// 特殊行为标记：heal(治疗) stealth(隐身) summon(召唤) charge(冲撞) burn(烧地) slow_aura(减速)
const ENEMIES = {
  // 基础 5 种（第1章）
  huangjin: { id:'huangjin', name:'黄巾兵', img:'assets/img/enemies/huangjin.png',
              hp:45,  speed:46, armor:0,  reward:6,  size:28, color:0xd8c84a },
  shield:   { id:'shield',   name:'盾兵', img:'assets/img/enemies/shield.png',
              hp:170, speed:30, armor:8,  reward:14, size:34, color:0x8a93a8 },
  archer:   { id:'archer',   name:'弓兵', img:'assets/img/enemies/archer.png',
              hp:50,  speed:50, armor:0,  reward:9,  size:28, color:0x6aa84f },
  cavalry:  { id:'cavalry',  name:'骑兵', img:'assets/img/enemies/cavalry.png',
              hp:55,  speed:82, armor:0,  reward:10, size:32, color:0xd08a3a },
  ram:      { id:'ram',      name:'冲车', img:'assets/img/enemies/ram.png',
              hp:300, speed:22, armor:12, reward:20, size:44, color:0x8a6b3a },

  // 进阶 4 种（第2-3章）
  catapult: { id:'catapult', name:'投石车', img:'assets/img/enemies/catapult.png',
              hp:220, speed:24, armor:6,  reward:22, size:46, color:0x9a7a4a, splash:true },
  elite:    { id:'elite',    name:'精英武将', img:'assets/img/enemies/elite.png',
              hp:600, speed:38, armor:10, reward:40, size:44, color:0xc04a4a },
  assassin: { id:'assassin', name:'刺客', img:'assets/img/enemies/assassin.png',
              hp:60,  speed:110,armor:0,  reward:16, size:28, color:0x9a5bd0, stealth:true },
  healer:   { id:'healer',   name:'治疗兵', img:'assets/img/enemies/healer.png',
              hp:90,  speed:44, armor:0,  reward:24, size:30, color:0x4ad88a, heal:8 },

  // 终极 3 种（第4-5章）
  fireship: { id:'fireship', name:'火船', img:'assets/img/enemies/fireship.png',
              hp:260, speed:40, armor:4,  reward:26, size:42, color:0xff7030, burn:true },
  elephant: { id:'elephant', name:'战象', img:'assets/img/enemies/elephant.png',
              hp:900, speed:20, armor:16, reward:50, size:60, color:0x9a9a9a, slow_aura:true },
  sorcerer: { id:'sorcerer', name:'妖术师', img:'assets/img/enemies/sorcerer.png',
              hp:320, speed:34, armor:6,  reward:44, size:36, color:0xa04ad8, summon:'huangjin', heal:6 },

  // 章节 Boss
  zhangliang: { id:'zhangliang', name:'张梁', img:'assets/img/boss/zhangliang.png', boss:true,
              hp:3000, speed:28, armor:8,  reward:250, size:62, color:0xd8c84a, summon:'huangjin' },
  lvbu_boss:  { id:'lvbu_boss', name:'吕布', img:'assets/img/boss/huaxiong.png', boss:true,
              hp:6000, speed:34, armor:12, reward:450, size:66, color:0xff5b5b, charge:true },
  yanliang:   { id:'yanliang',  name:'颜良', img:'assets/img/boss/yanliang.png', boss:true,
              hp:5500, speed:30, armor:12, reward:400, size:64, color:0xc06a3a },
  wenchou:    { id:'wenchou',   name:'文丑', img:'assets/img/boss/huaxiong.png', boss:true,
              hp:5500, speed:30, armor:12, reward:400, size:64, color:0x3a6ac0 },
  zhouyu:     { id:'zhouyu',    name:'周瑜', img:'assets/img/boss/zhouyu.png', boss:true,
              hp:9000, speed:28, armor:14, reward:600, size:68, color:0xff7040, burn:true },
  simayi_boss:{ id:'simayi_boss', name:'司马懿', img:'assets/img/boss/simayi_boss.png', boss:true,
              hp:20000,speed:22, armor:20, reward:2000,size:84, color:0xa04ad8, summon:'sorcerer', regen:30 }
};
