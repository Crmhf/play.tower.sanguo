// 8 大主力武将：以积分召唤上阵当「塔」，固定槽位，可升 3 星
// cost=召唤积分；levels=3 星数值；passive=该将个体特性；role=定位（图鉴用）
const HEROES = {
  guanyu: {
    id:'guanyu', name:'关羽', title:'武圣', tower:'melee', role:'近战单体',
    img:'assets/img/heroes/guanyu.png', color:'#7ee08a', projColor:0x8affa0,
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
    id:'zhangfei', name:'张飞', title:'万人敌', tower:'melee', role:'近战群体',
    img:'assets/img/heroes/zhangfei.png', color:'#e0a05a', projColor:0xe0a05a,
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
    id:'zhaoyun', name:'赵云', title:'龙胆', tower:'range', role:'速攻突进',
    img:'assets/img/heroes/zhaoyun.png', color:'#7fd4ff', projColor:0x9fdcff,
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
    id:'huangzhong', name:'黄忠', title:'老当益壮', tower:'range', role:'远程狙击',
    img:'assets/img/heroes/huangzhong.png', color:'#ffd27f', projColor:0xffd98a,
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
    id:'zhugeliang', name:'诸葛亮', title:'卧龙', tower:'magic', role:'魔法AOE',
    img:'assets/img/heroes/zhugeliang.png', color:'#c9a7ff', projColor:0xb98cff,
    desc:'神机妙算，呼风唤雨，全场溅射。',
    cost:300, splash:60,
    passive:{ text:'溅射范围 +15%', splash:0.15 },
    levels:[
      { damage:40, range:150, rate:0.9, cost:0 },
      { damage:74, range:162, rate:1.0, cost:400 },
      { damage:148,range:178, rate:1.1, cost:900 }
    ]
  },
  simayi: {
    id:'simayi', name:'司马懿', title:'冢虎', tower:'magic', role:'中毒持续',
    img:'assets/img/heroes/simayi.png', color:'#a06ad0', projColor:0xb06ae0,
    desc:'深谋远虑，攻击附毒，持续侵蚀。',
    cost:300, splash:38,
    passive:{ text:'攻击附带中毒', poison:true },
    levels:[
      { damage:34, range:150, rate:0.95,cost:0 },
      { damage:62, range:160, rate:1.05,cost:400 },
      { damage:124,range:175, rate:1.15,cost:900 }
    ]
  },
  diaochan: {
    id:'diaochan', name:'貂蝉', title:'闭月', tower:'support', role:'辅助减速',
    img:'assets/img/heroes/diaochan.png', color:'#ff9ecf', projColor:0xffb0d8,
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
    id:'lvbu', name:'吕布', title:'无双', tower:'summon', role:'召唤克Boss',
    img:'assets/img/heroes/lvbu.png', color:'#ff6b6b', projColor:0xff8080,
    desc:'人中吕布，方天画戟，对 Boss 特效。',
    cost:500, bossKiller:true,
    passive:{ text:'暴击率 +25%', crit:0.25 },
    levels:[
      { damage:62, range:135, rate:0.7, cost:0 },
      { damage:115,range:146, rate:0.8, cost:500 },
      { damage:230,range:162, rate:0.9, cost:1200 }
    ]
  }
};
const HERO_KEYS = Object.keys(HEROES);
