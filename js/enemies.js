// 12 兵种 + 章节 Boss
// 特殊行为标记：heal(治疗) stealth(隐身) summon(召唤) charge(冲撞) burn(烧地) slow_aura(减速)
// score=击杀基础金币（实际金币 = score × 关卡难度系数）；ability=图鉴能力描述
const ENEMIES = {
  // 基础 5 种（第1章）
  huangjin: { id:'huangjin', name:'黄巾兵', img:'assets/img/enemies/huangjin.webp',
              hp:45,  speed:46, armor:0,  score:8,  size:28, color:0xd8c84a,
              ability:'最基础的杂兵，数量众多，血量低。' },
  shield:   { id:'shield',   name:'盾兵', img:'assets/img/enemies/shield.webp',
              hp:170, speed:30, armor:8,  score:18, size:34, color:0x8a93a8,
              ability:'高护甲高血量，移动缓慢，需高伤武将应对。' },
  archer:   { id:'archer',   name:'弓兵', img:'assets/img/enemies/archer.webp',
              hp:50,  speed:50, armor:0,  score:12, size:28, color:0x6aa84f,
              ability:'速度快但皮薄，适合用溅射或速攻清理。' },
  cavalry:  { id:'cavalry',  name:'骑兵', img:'assets/img/enemies/cavalry.webp',
              hp:55,  speed:82, armor:0,  score:14, size:32, color:0xd08a3a,
              ability:'移动极快，容易漏怪，需减速或远程拦截。' },
  ram:      { id:'ram',      name:'冲车', img:'assets/img/enemies/ram.webp',
              hp:300, speed:22, armor:8,  score:26, size:44, color:0x8a6b3a,
              ability:'极高血量与护甲的攻城器械，慢速推进。' },

  // 进阶 4 种（第2-3章）
  catapult: { id:'catapult', name:'投石车', img:'assets/img/enemies/catapult.webp',
              hp:220, speed:24, armor:6,  score:28, size:46, color:0x9a7a4a,
              ability:'血厚甲高的攻城武器，缓慢而坚硬。' },
  elite:    { id:'elite',    name:'精英武将', img:'assets/img/enemies/elite.webp',
              hp:600, speed:38, armor:10, score:50, size:44, color:0xc04a4a,
              ability:'BOSS 级单体精英，血厚攻高，优先集火。' },
  assassin: { id:'assassin', name:'刺客', img:'assets/img/enemies/assassin.webp',
              hp:60,  speed:110,armor:0,  score:22, size:28, color:0x9a5bd0, stealth:true,
              ability:'隐身状态直奔城内，速度极快，需高攻速拦截。' },
  healer:   { id:'healer',   name:'治疗兵', img:'assets/img/enemies/healer.webp',
              hp:90,  speed:44, armor:0,  score:30, size:30, color:0x4ad88a, heal:5,
              ability:'持续治疗周围友军，必须优先击杀。' },

  // 终极 3 种（第4-5章）
  fireship: { id:'fireship', name:'火船', img:'assets/img/enemies/fireship.webp',
              hp:260, speed:40, armor:4,  score:32, size:42, color:0xff7030,
              ability:'赤壁之战的先锋快船，机动突袭。' },
  elephant: { id:'elephant', name:'战象', img:'assets/img/enemies/elephant.webp',
              hp:900, speed:20, armor:10, score:60, size:60, color:0x9a9a9a,
              ability:'极高血量与护甲的南蛮巨兽，缓慢碾压。' },
  sorcerer: { id:'sorcerer', name:'妖术师', img:'assets/img/enemies/sorcerer.webp',
              hp:320, speed:34, armor:6,  score:55, size:36, color:0xa04ad8, summon:'huangjin', heal:4,
              ability:'周期召唤小怪并治疗友军，威胁极大。' },

  // 章节 Boss
  zhangliang: { id:'zhangliang', name:'张梁', img:'assets/img/boss/zhangliang.webp', boss:true,
              hp:3000, speed:28, armor:8,  score:300, size:62, color:0xd8c84a, summon:'huangjin',
              ability:'黄巾首领，周期召唤黄巾小兵助战。' },
  lvbu_boss:  { id:'lvbu_boss', name:'吕布', img:'assets/img/boss/huaxiong.webp', boss:true,
              hp:6000, speed:34, armor:12, score:550, size:66, color:0xff5b5b, charge:true,
              ability:'无双飞将，半血后冲撞加速，极难拦截。' },
  yanliang:   { id:'yanliang',  name:'颜良', img:'assets/img/boss/yanliang.webp', boss:true,
              hp:5500, speed:30, armor:12, score:500, size:64, color:0xc06a3a,
              ability:'袁绍名将，与文丑双 Boss 分进夹击。' },
  wenchou:    { id:'wenchou',   name:'文丑', img:'assets/img/boss/huaxiong.webp', boss:true,
              hp:5500, speed:30, armor:12, score:500, size:64, color:0x3a6ac0,
              ability:'袁绍名将，与颜良双 Boss 分进夹击。' },
  zhouyu:     { id:'zhouyu',    name:'周瑜', img:'assets/img/boss/zhouyu.webp', boss:true,
              hp:9000, speed:28, armor:14, score:750, size:68, color:0xff7040,
              ability:'大都督统率火攻大军，血厚需集火。' },
  simayi_boss:{ id:'simayi_boss', name:'司马懿', img:'assets/img/boss/simayi_boss.webp', boss:true,
              hp:15000,speed:22, armor:20, score:2500,size:84, color:0xa04ad8, summon:'sorcerer', regen:20,
              ability:'终极 Boss，持续召唤妖术师且自身回血。' }
};
