// 12 大名将：以积分召唤上阵当「塔」，固定槽位，可升 3 星
// cost=召唤积分；levels=3 星数值；passive=该将个体特性；role=定位（图鉴用）
// faction=势力（魏/蜀/吴/群），用于「势力羁绊」加成/中和/削弱（见 synergy.js）
const HEROES = {
  // ===== 蜀 =====
  guanyu: {
    id:'guanyu', name:'关羽', title:'武圣', tower:'melee', role:'近战单体', faction:'shu',
    img:'assets/img/heroes/guanyu.webp', color:'#7ee08a', projColor:0x8affa0,
    desc:'义薄云天，青龙偃月，高伤暴击。',
    cost:150, splash:30,
    passive:{ text:'伤害 +15%', damage:0.15 },
    levels:[
      { damage:30, range:95,  rate:1.1, cost:0 },
      { damage:55, range:100, rate:1.2, cost:250 },
      { damage:110,range:110, rate:1.35,cost:600 }
    ]
  },
  zhangfei: {
    id:'zhangfei', name:'张飞', title:'万人敌', tower:'melee', role:'近战群体', faction:'shu',
    img:'assets/img/heroes/zhangfei.webp', color:'#e0a05a', projColor:0xe0a05a,
    desc:'当阳桥头一声吼，溅射群攻。',
    cost:150, splash:52,
    passive:{ text:'溅射范围 +20%', splash:0.20 },
    levels:[
      { damage:28, range:92,  rate:1.0, cost:0 },
      { damage:50, range:98,  rate:1.1, cost:250 },
      { damage:100,range:108, rate:1.25,cost:600 }
    ]
  },
  zhaoyun: {
    id:'zhaoyun', name:'赵云', title:'龙胆', tower:'range', role:'速攻突进', faction:'shu',
    img:'assets/img/heroes/zhaoyun.webp', color:'#7fd4ff', projColor:0x9fdcff,
    desc:'常山赵子龙，七进七出，突进速攻。',
    cost:200, pierce:1,
    passive:{ text:'攻速 +10%', attackSpeed:0.10 },
    levels:[
      { damage:24, range:175, rate:1.55,cost:0 },
      { damage:44, range:195, rate:1.7, cost:300 },
      { damage:88, range:225, rate:1.9, cost:700 }
    ]
  },
  huangzhong: {
    id:'huangzhong', name:'黄忠', title:'老当益壮', tower:'range', role:'远程狙击', faction:'shu',
    img:'assets/img/heroes/huangzhong.webp', color:'#ffd27f', projColor:0xffd98a,
    desc:'百步穿杨，远程狙击，穿透高攻。',
    cost:200, pierce:2,
    passive:{ text:'射程 +15%', range:0.15 },
    levels:[
      { damage:34, range:190, rate:1.1, cost:0 },
      { damage:62, range:215, rate:1.25,cost:300 },
      { damage:120,range:250, rate:1.4, cost:700 }
    ]
  },
  zhugeliang: {
    id:'zhugeliang', name:'诸葛亮', title:'卧龙', tower:'magic', role:'魔法AOE', faction:'shu',
    img:'assets/img/heroes/zhugeliang.webp', color:'#c9a7ff', projColor:0xb98cff,
    desc:'神机妙算，呼风唤雨，全场溅射。',
    cost:300, splash:60,
    passive:{ text:'溅射范围 +15%', splash:0.15 },
    levels:[
      { damage:40, range:150, rate:0.9, cost:0 },
      { damage:74, range:162, rate:1.0, cost:400 },
      { damage:148,range:178, rate:1.1, cost:900 }
    ]
  },
  machao: {
    id:'machao', name:'马超', title:'锦马超', tower:'range', role:'骑射连击', faction:'shu',
    img:'assets/img/heroes/machao.webp', color:'#e8f0ff', projColor:0xcfe0ff,
    desc:'西凉锦马超，银枪白马，速射穿甲。',
    cost:220, pierce:1,
    passive:{ text:'攻速 +12%', attackSpeed:0.12 },
    levels:[
      { damage:26, range:180, rate:1.7, cost:0 },
      { damage:48, range:200, rate:1.85,cost:320 },
      { damage:96, range:230, rate:2.05,cost:720 }
    ]
  },

  // ===== 魏 =====
  simayi: {
    id:'simayi', name:'司马懿', title:'冢虎', tower:'magic', role:'中毒持续', faction:'wei',
    img:'assets/img/heroes/simayi.webp', color:'#a06ad0', projColor:0xb06ae0,
    desc:'深谋远虑，攻击附毒，持续侵蚀。',
    cost:300, splash:38,
    passive:{ text:'攻击附带中毒', poison:true },
    levels:[
      { damage:34, range:150, rate:0.95,cost:0 },
      { damage:62, range:160, rate:1.05,cost:400 },
      { damage:124,range:175, rate:1.15,cost:900 }
    ]
  },
  dianwei: {
    id:'dianwei', name:'典韦', title:'古之恶来', tower:'melee', role:'近战壁垒', faction:'wei',
    img:'assets/img/heroes/dianwei.webp', color:'#c98a5a', projColor:0xd89a6a,
    desc:'双戟护卫，忠勇无匹，近战高血高伤。',
    cost:160, splash:34,
    passive:{ text:'伤害 +12%', damage:0.12 },
    levels:[
      { damage:36, range:92,  rate:1.05,cost:0 },
      { damage:66, range:98,  rate:1.15,cost:280 },
      { damage:132,range:108, rate:1.3, cost:650 }
    ]
  },

  // ===== 吴 =====
  zhoutai: {
    id:'zhoutai', name:'周泰', title:'不屈', tower:'melee', role:'坚守反击', faction:'wu',
    img:'assets/img/heroes/zhoutai.webp', color:'#5ad0c0', projColor:0x6ae0d0,
    desc:'遍体鳞伤仍死战不退，坚守反击，攻速稳健。',
    cost:170, splash:30,
    passive:{ text:'射程 +10%', range:0.10 },
    levels:[
      { damage:32, range:100, rate:1.2, cost:0 },
      { damage:58, range:108, rate:1.3, cost:280 },
      { damage:116,range:120, rate:1.45,cost:660 }
    ]
  },

  // ===== 群 =====
  diaochan: {
    id:'diaochan', name:'貂蝉', title:'闭月', tower:'support', role:'辅助减速', faction:'qun',
    img:'assets/img/heroes/diaochan.webp', color:'#ff9ecf', projColor:0xffb0d8,
    desc:'倾国倾城，魅惑减速，辅助控制。',
    cost:180, slow:0.4,
    passive:{ text:'减速效果 +20%', slow:0.20 },
    levels:[
      { damage:14, range:145, rate:1.0, slow:0.35, slowTime:1.4, cost:0 },
      { damage:24, range:155, rate:1.05,slow:0.45, slowTime:1.8, cost:280 },
      { damage:42, range:170, rate:1.1, slow:0.55, slowTime:2.2, cost:650 }
    ]
  },
  lvbu: {
    id:'lvbu', name:'吕布', title:'无双', tower:'summon', role:'召唤克Boss', faction:'qun',
    img:'assets/img/heroes/lvbu.webp', color:'#ff6b6b', projColor:0xff8080,
    desc:'人中吕布，方天画戟，对 Boss 特效。',
    cost:500, bossKiller:true,
    passive:{ text:'暴击率 +25%', crit:0.25 },
    levels:[
      { damage:62, range:135, rate:0.7, cost:0 },
      { damage:115,range:146, rate:0.8, cost:500 },
      { damage:230,range:162, rate:0.9, cost:1200 }
    ]
  },
  pangtong: {
    id:'pangtong', name:'庞统', title:'凤雏', tower:'magic', role:'连环灼烧', faction:'qun',
    img:'assets/img/heroes/pangtong.webp', color:'#8affc0', projColor:0x7ae8b0,
    desc:'凤雏先生，连环妙计，溅射灼烧群敌。',
    cost:280, splash:56,
    passive:{ text:'溅射范围 +18%', splash:0.18 },
    levels:[
      { damage:36, range:148, rate:0.95,cost:0 },
      { damage:66, range:160, rate:1.05,cost:400 },
      { damage:132,range:176, rate:1.15,cost:880 }
    ]
  }
};
const HERO_KEYS = Object.keys(HEROES);

// 势力元数据（配色/中文名，图鉴与羁绊展示用）
const FACTIONS = {
  wei: { name:'魏', color:'#6aa8ff' },
  shu: { name:'蜀', color:'#7ee08a' },
  wu:  { name:'吴', color:'#5ad0c0' },
  qun: { name:'群', color:'#ffb066' }
};
