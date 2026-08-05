// 36 大名将：每势力 9 将（魏/蜀/吴/群），按 3 类兵种各 3 将
// 选势力后本局只能用该势力武将当「塔」，固定槽位，可升 3 星
// cost=召唤金币；levels=3 星数值；passive=该将个体特性；role=定位（图鉴用）
// faction=势力（魏/蜀/吴/群）；archetype=兵种（str近战力量 / agi敏捷·可近可远 / mag远程法术）
// 数值基准（1星，未含科技/羁绊）：
//   近战力量 str：高单发、近射程、中攻速、小溅射   单体性价比 ~20/百金
//   敏捷 agi：   中伤害、远射程、高攻速、穿透      单体性价比 ~17/百金
//   远程法术 mag：高伤害、中射程、低攻速、大溅射/特效 群体性价比
const HEROES = {
  // ==================== 魏 ====================
  dianwei: {
    id:'dianwei', name:'典韦', title:'古之恶来', role:'近战力量', faction:'wei', archetype:'str',
    img:'assets/img/heroes/dianwei.webp', color:'#c98a5a', projColor:0xd89a6a,
    desc:'双戟护卫，忠勇无匹，近战高伤。', cost:160, splash:60,
    passive:{ text:'伤害 +12%', damage:0.12 },
    levels:[ { damage:36, range:92,  rate:1.05,cost:0 }, { damage:66, range:98, rate:1.15,cost:190 }, { damage:132,range:108,rate:1.3, cost:450 } ]
  },
  xuchu: {
    id:'xuchu', name:'许褚', title:'虎痴', role:'近战力量', faction:'wei', archetype:'str',
    img:'assets/img/heroes/xuchu.webp', color:'#d0a06a', projColor:0xe0b07a,
    desc:'裸衣斗马超，力大无穷的猛士。', cost:170, splash:64,
    passive:{ text:'溅射范围 +18%', splash:0.18 },
    levels:[ { damage:34, range:90,  rate:1.0, cost:0 }, { damage:62, range:96, rate:1.1, cost:190 }, { damage:124,range:106,rate:1.25,cost:460 } ]
  },
  xiahoudun: {
    id:'xiahoudun', name:'夏侯惇', title:'独眼罗刹', role:'近战力量', faction:'wei', archetype:'str',
    img:'assets/img/heroes/xiahoudun.webp', color:'#b0855a', projColor:0xc0956a,
    desc:'拔矢啖睛，刚烈无前的先锋。', cost:150, splash:56,
    passive:{ text:'射程 +12%', range:0.12 },
    levels:[ { damage:32, range:96,  rate:1.08,cost:0 }, { damage:58, range:102,rate:1.18,cost:170 }, { damage:116,range:112,rate:1.32,cost:420 } ]
  },
  zhangliao: {
    id:'zhangliao', name:'张辽', title:'威震逍遥津', role:'敏捷', faction:'wei', archetype:'agi',
    img:'assets/img/heroes/zhangliao.webp', color:'#7fb0e0', projColor:0x9fc8f0,
    desc:'八百破十万，奇袭突进的名将。', cost:210, pierce:1,
    passive:{ text:'攻速 +12%', attackSpeed:0.12 },
    levels:[ { damage:26, range:172, rate:1.6, cost:0 }, { damage:48, range:192,rate:1.75,cost:210 }, { damage:96, range:222,rate:1.95,cost:500 } ]
  },
  xiahouyuan: {
    id:'xiahouyuan', name:'夏侯渊', title:'虎步关右', role:'敏捷', faction:'wei', archetype:'agi',
    img:'assets/img/heroes/xiahouyuan.webp', color:'#8fb8d8', projColor:0xafd0e8,
    desc:'奔袭千里，神速突击的骑将。', cost:200, pierce:1,
    passive:{ text:'穿透 +1', pierce:1 },
    levels:[ { damage:24, range:178, rate:1.55,cost:0 }, { damage:44, range:198,rate:1.7, cost:200 }, { damage:88, range:228,rate:1.9, cost:490 } ]
  },
  caoren: {
    id:'caoren', name:'曹仁', title:'天人之将', role:'敏捷', faction:'wei', archetype:'agi',
    img:'assets/img/heroes/caoren.webp', color:'#6a98c0', projColor:0x8ab8d8,
    desc:'守樊城拒关羽，攻守兼备。', cost:190, pierce:1,
    passive:{ text:'伤害 +10%', damage:0.10 },
    levels:[ { damage:28, range:168, rate:1.5, cost:0 }, { damage:52, range:188,rate:1.65,cost:190 }, { damage:104,range:218,rate:1.85,cost:470 } ]
  },
  simayi: {
    id:'simayi', name:'司马懿', title:'冢虎', role:'远程法术', faction:'wei', archetype:'mag',
    img:'assets/img/heroes/simayi.webp', color:'#a06ad0', projColor:0xb06ae0,
    desc:'深谋远虑，攻击附毒，持续侵蚀。', cost:270, splash:80,
    passive:{ text:'攻击附带中毒', poison:true },
    levels:[ { damage:34, range:150, rate:0.95,cost:0 }, { damage:62, range:160,rate:1.05,cost:280 }, { damage:124,range:175,rate:1.15,cost:640 } ]
  },
  guojia: {
    id:'guojia', name:'郭嘉', title:'鬼才', role:'远程法术', faction:'wei', archetype:'mag',
    img:'assets/img/heroes/guojia.webp', color:'#b08ae0', projColor:0xc8a0f0,
    desc:'十胜十败，神机鬼谋，连环冲击。', cost:260, splash:88,
    passive:{ text:'溅射范围 +16%、命中灼烧', splash:0.16, burn:true },
    levels:[ { damage:38, range:152, rate:0.92,cost:0 }, { damage:70, range:162,rate:1.02,cost:280 }, { damage:140,range:178,rate:1.12,cost:640 } ]
  },
  xunyu: {
    id:'xunyu', name:'荀彧', title:'王佐之才', role:'远程法术', faction:'wei', archetype:'mag',
    img:'assets/img/heroes/xunyu.webp', color:'#9a7ac8', projColor:0xb89ae0,
    desc:'王佐之才，运筹帷幄，减速控场。', cost:250, slow:0.3,
    passive:{ text:'减速效果 +18%', slow:0.18 },
    levels:[ { damage:30, range:148, rate:0.9, slow:0.30, slowTime:1.4, cost:0 }, { damage:56, range:158,rate:1.0, slow:0.40, slowTime:1.7, cost:270 }, { damage:112,range:172,rate:1.1, slow:0.50, slowTime:2.0, cost:620 } ]
  },

  // ==================== 蜀 ====================
  guanyu: {
    id:'guanyu', name:'关羽', title:'武圣', role:'近战力量', faction:'shu', archetype:'str',
    img:'assets/img/heroes/guanyu.webp', color:'#7ee08a', projColor:0x8affa0,
    desc:'义薄云天，青龙偃月，高伤暴击。', cost:150, splash:30,
    passive:{ text:'伤害 +15%', damage:0.15 },
    levels:[ { damage:30, range:95,  rate:1.1, cost:0 }, { damage:55, range:100,rate:1.2, cost:170 }, { damage:110,range:110,rate:1.35,cost:420 } ]
  },
  zhangfei: {
    id:'zhangfei', name:'张飞', title:'万人敌', role:'近战力量', faction:'shu', archetype:'str',
    img:'assets/img/heroes/zhangfei.webp', color:'#e0a05a', projColor:0xe0a05a,
    desc:'当阳桥头一声吼，溅射群攻。', cost:150, splash:52,
    passive:{ text:'溅射范围 +20%', splash:0.20 },
    levels:[ { damage:28, range:92,  rate:1.0, cost:0 }, { damage:50, range:98, rate:1.1, cost:170 }, { damage:100,range:108,rate:1.25,cost:420 } ]
  },
  weiyan: {
    id:'weiyan', name:'魏延', title:'子午奇谋', role:'近战力量', faction:'shu', archetype:'str',
    img:'assets/img/heroes/weiyan.webp', color:'#d0905a', projColor:0xe0a868,
    desc:'子午谷奇谋，勇猛善战的悍将。', cost:160, splash:36,
    passive:{ text:'暴击率 +10%', crit:0.10 },
    levels:[ { damage:34, range:93,  rate:1.05,cost:0 }, { damage:62, range:99, rate:1.15,cost:180 }, { damage:124,range:109,rate:1.3, cost:440 } ]
  },
  zhaoyun: {
    id:'zhaoyun', name:'赵云', title:'龙胆', role:'敏捷', faction:'shu', archetype:'agi',
    img:'assets/img/heroes/zhaoyun.webp', color:'#7fd4ff', projColor:0x9fdcff,
    desc:'常山赵子龙，七进七出，突进速攻。', cost:200, pierce:1,
    passive:{ text:'攻速 +10%', attackSpeed:0.10 },
    levels:[ { damage:24, range:175, rate:1.55,cost:0 }, { damage:44, range:195,rate:1.7, cost:200 }, { damage:88, range:225,rate:1.9, cost:490 } ]
  },
  huangzhong: {
    id:'huangzhong', name:'黄忠', title:'老当益壮', role:'敏捷', faction:'shu', archetype:'agi',
    img:'assets/img/heroes/huangzhong.webp', color:'#ffd27f', projColor:0xffd98a,
    desc:'百步穿杨，远程狙击，穿透高攻。', cost:200, pierce:2,
    passive:{ text:'射程 +15%', range:0.15 },
    levels:[ { damage:34, range:190, rate:1.1, cost:0 }, { damage:62, range:215,rate:1.25,cost:200 }, { damage:120,range:250,rate:1.4, cost:490 } ]
  },
  machao: {
    id:'machao', name:'马超', title:'锦马超', role:'敏捷', faction:'shu', archetype:'agi',
    img:'assets/img/heroes/machao.webp', color:'#e8f0ff', projColor:0xcfe0ff,
    desc:'西凉锦马超，银枪白马，速射穿甲。', cost:220, pierce:1,
    passive:{ text:'攻速 +12%', attackSpeed:0.12 },
    levels:[ { damage:26, range:180, rate:1.7, cost:0 }, { damage:48, range:200,rate:1.85,cost:220 }, { damage:96, range:230,rate:2.05,cost:500 } ]
  },
  zhugeliang: {
    id:'zhugeliang', name:'诸葛亮', title:'卧龙', role:'远程法术', faction:'shu', archetype:'mag',
    img:'assets/img/heroes/zhugeliang.webp', color:'#c9a7ff', projColor:0xb98cff,
    desc:'神机妙算，呼风唤雨，全场溅射。', cost:300, splash:60,
    passive:{ text:'溅射范围 +15%', splash:0.15 },
    levels:[ { damage:40, range:150, rate:0.9, cost:0 }, { damage:74, range:162,rate:1.0, cost:280 }, { damage:148,range:178,rate:1.1, cost:640 } ]
  },
  jiangwei: {
    id:'jiangwei', name:'姜维', title:'幼麟', role:'远程法术', faction:'shu', archetype:'mag',
    img:'assets/img/heroes/jiangwei.webp', color:'#8ac8e8', projColor:0xa8d8f0,
    desc:'九伐中原，文武双全，连环溅射。', cost:290, splash:50,
    passive:{ text:'伤害 +12%', damage:0.12 },
    levels:[ { damage:38, range:152, rate:0.92,cost:0 }, { damage:70, range:162,rate:1.02,cost:280 }, { damage:140,range:176,rate:1.12,cost:630 } ]
  },
  huangyueying: {
    id:'huangyueying', name:'黄月英', title:'奇巧', role:'远程法术', faction:'shu', archetype:'mag',
    img:'assets/img/heroes/huangyueying.webp', color:'#e8c8a0', projColor:0xf0d8b0,
    desc:'木牛流马，奇巧机关，附毒侵蚀。', cost:280, splash:36,
    passive:{ text:'攻击附带中毒', poison:true },
    levels:[ { damage:32, range:148, rate:0.95,cost:0 }, { damage:60, range:158,rate:1.05,cost:270 }, { damage:120,range:172,rate:1.15,cost:620 } ]
  },

  // ==================== 吴 ====================
  zhoutai: {
    id:'zhoutai', name:'周泰', title:'不屈', role:'近战力量', faction:'wu', archetype:'str',
    img:'assets/img/heroes/zhoutai.webp', color:'#5ad0c0', projColor:0x6ae0d0,
    desc:'遍体鳞伤仍死战不退，坚守反击。', cost:170, splash:30,
    passive:{ text:'射程 +10%', range:0.10 },
    levels:[ { damage:32, range:100, rate:1.2, cost:0 }, { damage:58, range:108,rate:1.3, cost:190 }, { damage:116,range:120,rate:1.45,cost:460 } ]
  },
  taishici: {
    id:'taishici', name:'太史慈', title:'神亭酣战', role:'近战力量', faction:'wu', archetype:'str',
    img:'assets/img/heroes/taishici.webp', color:'#5ac8b8', projColor:0x6ad8c8,
    desc:'神亭岭酣战小霸王，骁勇善战。', cost:160, splash:34,
    passive:{ text:'伤害 +12%', damage:0.12 },
    levels:[ { damage:34, range:94,  rate:1.1, cost:0 }, { damage:62, range:100,rate:1.2, cost:180 }, { damage:124,range:110,rate:1.35,cost:440 } ]
  },
  lingtong: {
    id:'lingtong', name:'凌统', title:'国士之风', role:'近战力量', faction:'wu', archetype:'str',
    img:'assets/img/heroes/lingtong.webp', color:'#4ac0b0', projColor:0x5ad0c0,
    desc:'合肥死卫孙权，忠勇刚烈。', cost:150, splash:32,
    passive:{ text:'溅射范围 +16%、命中灼烧', splash:0.16, burn:true },
    levels:[ { damage:32, range:92,  rate:1.08,cost:0 }, { damage:58, range:98, rate:1.18,cost:170 }, { damage:116,range:108,rate:1.32,cost:420 } ]
  },
  ganning: {
    id:'ganning', name:'甘宁', title:'锦帆贼', role:'敏捷', faction:'wu', archetype:'agi',
    img:'assets/img/heroes/ganning.webp', color:'#5ad8e0', projColor:0x7ae8f0,
    desc:'百骑劫曹营，骁猛果决。', cost:210, pierce:1,
    passive:{ text:'攻速 +12%', attackSpeed:0.12 },
    levels:[ { damage:26, range:174, rate:1.62,cost:0 }, { damage:48, range:194,rate:1.78,cost:210 }, { damage:96, range:224,rate:1.98,cost:500 } ]
  },
  sunshangxiang: {
    id:'sunshangxiang', name:'孙尚香', title:'弓腰姬', role:'敏捷', faction:'wu', archetype:'agi',
    img:'assets/img/heroes/sunshangxiang.webp', color:'#e8a8c0', projColor:0xf0c0d0,
    desc:'弓腰姬，才捷刚猛，百步穿杨。', cost:200, pierce:2,
    passive:{ text:'穿透 +1', pierce:1 },
    levels:[ { damage:32, range:186, rate:1.15,cost:0 }, { damage:58, range:210,rate:1.28,cost:200 }, { damage:112,range:244,rate:1.42,cost:490 } ]
  },
  dingfeng: {
    id:'dingfeng', name:'丁奉', title:'雪中奋短兵', role:'敏捷', faction:'wu', archetype:'agi',
    img:'assets/img/heroes/dingfeng.webp', color:'#a8c8d8', projColor:0xc0d8e8,
    desc:'雪中奋短兵，老而弥坚。', cost:190, pierce:1,
    passive:{ text:'伤害 +10%', damage:0.10 },
    levels:[ { damage:28, range:170, rate:1.5, cost:0 }, { damage:52, range:190,rate:1.65,cost:190 }, { damage:104,range:220,rate:1.85,cost:470 } ]
  },
  lvmeng: {
    id:'lvmeng', name:'吕蒙', title:'白衣渡江', role:'远程法术', faction:'wu', archetype:'mag',
    img:'assets/img/heroes/lvmeng.webp', color:'#b8c8e8', projColor:0xd0e0f8,
    desc:'士别三日，刮目相看，克己控场。', cost:290, slow:0.3,
    passive:{ text:'减速效果 +18%', slow:0.18 },
    levels:[ { damage:34, range:150, rate:0.92,slow:0.30, slowTime:1.4, cost:0 }, { damage:62, range:160,rate:1.02,slow:0.40, slowTime:1.7, cost:280 }, { damage:124,range:174,rate:1.12,slow:0.50, slowTime:2.0, cost:630 } ]
  },
  luxun: {
    id:'luxun', name:'陆逊', title:'火烧连营', role:'远程法术', faction:'wu', archetype:'mag',
    img:'assets/img/heroes/luxun.webp', color:'#e8988a', projColor:0xf0b0a0,
    desc:'火烧连营七百里，溅射灼烧。', cost:300, splash:54,
    passive:{ text:'命中灼烧', burn:true },
    levels:[ { damage:38, range:152, rate:0.92,cost:0 }, { damage:70, range:162,rate:1.02,cost:280 }, { damage:140,range:176,rate:1.12,cost:640 } ]
  },
  zhugejin: {
    id:'zhugejin', name:'诸葛瑾', title:'东吴谋主', role:'远程法术', faction:'wu', archetype:'mag',
    img:'assets/img/heroes/zhugejin.webp', color:'#c8b8d8', projColor:0xe0d0e8,
    desc:'诸葛之瑾，沉稳谋断，连环冲击。', cost:280, splash:48,
    passive:{ text:'溅射范围 +16%、命中灼烧', splash:0.16, burn:true },
    levels:[ { damage:36, range:150, rate:0.9, cost:0 }, { damage:66, range:160,rate:1.0, cost:270 }, { damage:132,range:174,rate:1.1, cost:620 } ]
  },

  // ==================== 群 ====================
  lvbu: {
    id:'lvbu', name:'吕布', title:'无双', role:'近战力量', faction:'qun', archetype:'str',
    img:'assets/img/heroes/lvbu.webp', color:'#ff6b6b', projColor:0xff8080,
    desc:'人中吕布，方天画戟，对 Boss 特效。', cost:380, bossKiller:true,
    passive:{ text:'暴击率 +25%', crit:0.25 },
    levels:[ { damage:62, range:135, rate:0.7, cost:0 }, { damage:115,range:146, rate:0.8, cost:340 }, { damage:230,range:162, rate:0.9, cost:820 } ]
  },
  huaxiong: {
    id:'huaxiong', name:'华雄', title:'温酒斩', role:'近战力量', faction:'qun', archetype:'str',
    img:'assets/img/heroes/huaxiong.webp', color:'#e0705a', projColor:0xf08068,
    desc:'汜水关前威震诸侯的猛将。', cost:170, splash:52,
    passive:{ text:'伤害 +14%', damage:0.14 },
    levels:[ { damage:36, range:92,  rate:1.05,cost:0 }, { damage:66, range:98, rate:1.15,cost:190 }, { damage:132,range:108,rate:1.3, cost:460 } ]
  },
  yanliang_h: {
    id:'yanliang_h', name:'颜良', title:'河北雄杰', role:'近战力量', faction:'qun', archetype:'str',
    img:'assets/img/heroes/yanliang_h.webp', color:'#d08a5a', projColor:0xe09a68,
    desc:'河北名将，白马坡前勇冠三军。', cost:180, splash:36,
    passive:{ text:'溅射范围 +18%', splash:0.18 },
    levels:[ { damage:38, range:94,  rate:1.02,cost:0 }, { damage:70, range:100,rate:1.12,cost:200 }, { damage:140,range:110,rate:1.27,cost:480 } ]
  },
  wenchou_h: {
    id:'wenchou_h', name:'文丑', title:'河北名将', role:'敏捷', faction:'qun', archetype:'agi',
    img:'assets/img/heroes/wenchou_h.webp', color:'#7ab0d8', projColor:0x98c8e8,
    desc:'与颜良齐名的河北骁将。', cost:210, pierce:1,
    passive:{ text:'攻速 +12%', attackSpeed:0.12 },
    levels:[ { damage:27, range:172, rate:1.6, cost:0 }, { damage:50, range:192,rate:1.76,cost:210 }, { damage:100,range:222,rate:1.96,cost:500 } ]
  },
  jiling: {
    id:'jiling', name:'纪灵', title:'袁术上将', role:'敏捷', faction:'qun', archetype:'agi',
    img:'assets/img/heroes/jiling.webp', color:'#c8a868', projColor:0xd8b878,
    desc:'袁术麾下上将，使一口三尖刀。', cost:190, pierce:1,
    passive:{ text:'穿透 +1', pierce:1 },
    levels:[ { damage:26, range:168, rate:1.5, cost:0 }, { damage:48, range:188,rate:1.65,cost:190 }, { damage:96, range:218,rate:1.85,cost:470 } ]
  },
  gaoshun: {
    id:'gaoshun', name:'高顺', title:'陷阵营', role:'敏捷', faction:'qun', archetype:'agi',
    img:'assets/img/heroes/gaoshun.webp', color:'#9898b8', projColor:0xb0b0d0,
    desc:'陷阵营统领，攻无不克的精兵。', cost:200, pierce:1,
    passive:{ text:'伤害 +11%', damage:0.11 },
    levels:[ { damage:29, range:170, rate:1.52,cost:0 }, { damage:54, range:190,rate:1.68,cost:200 }, { damage:108,range:220,rate:1.88,cost:480 } ]
  },
  pangtong: {
    id:'pangtong', name:'庞统', title:'凤雏', role:'远程法术', faction:'qun', archetype:'mag',
    img:'assets/img/heroes/pangtong.webp', color:'#8affc0', projColor:0x7ae8b0,
    desc:'凤雏先生，连环妙计，溅射灼烧群敌。', cost:280, splash:56,
    passive:{ text:'溅射范围 +18%、命中灼烧', splash:0.18, burn:true },
    levels:[ { damage:36, range:148, rate:0.95,cost:0 }, { damage:66, range:160,rate:1.05,cost:280 }, { damage:132,range:176,rate:1.15,cost:600 } ]
  },
  diaochan: {
    id:'diaochan', name:'貂蝉', title:'闭月', role:'远程法术', faction:'qun', archetype:'mag',
    img:'assets/img/heroes/diaochan.webp', color:'#ff9ecf', projColor:0xffb0d8,
    desc:'倾国倾城，魅惑减速，辅助控制。', cost:180, slow:0.4,
    passive:{ text:'减速效果 +20%', slow:0.20 },
    levels:[ { damage:14, range:145, rate:1.0, slow:0.35, slowTime:1.4, cost:0 }, { damage:24, range:155,rate:1.05,slow:0.45, slowTime:1.8, cost:190 }, { damage:42, range:170,rate:1.1, slow:0.55, slowTime:2.2, cost:450 } ]
  },
  zuoci: {
    id:'zuoci', name:'左慈', title:'乌角先生', role:'远程法术', faction:'qun', archetype:'mag',
    img:'assets/img/heroes/zuoci.webp', color:'#a0c8e8', projColor:0xb8d8f0,
    desc:'神仙方术，变化莫测，附毒控场。', cost:290, splash:40,
    passive:{ text:'攻击附带中毒', poison:true },
    levels:[ { damage:34, range:150, rate:0.95,cost:0 }, { damage:62, range:160,rate:1.05,cost:280 }, { damage:124,range:174,rate:1.15,cost:630 } ]
  }
};
const HERO_KEYS = Object.keys(HEROES);

// 兵种（archetype）元数据：轮盘/图鉴分组展示
const ARCHETYPES = {
  str: { name:'近战力量', icon:'🗡️', desc:'高伤近身，溅射小' },
  agi: { name:'敏捷',     icon:'🏹', desc:'可近可远，速射穿透' },
  mag: { name:'远程法术', icon:'🔮', desc:'远程溅射，特效控场' }
};

// 势力元数据（配色/中文名，图鉴与羁绊展示用）
const FACTIONS = {
  wei: { name:'魏', color:'#6aa8ff' },
  shu: { name:'蜀', color:'#7ee08a' },
  wu:  { name:'吴', color:'#5ad0c0' },
  qun: { name:'群', color:'#ffb066' }
};

// 按势力取该势力的武将 key（可选按兵种过滤）
function heroesByFaction(faction) {
  return HERO_KEYS.filter(k => HEROES[k].faction === faction);
}
