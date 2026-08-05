// 5 类防御塔（与武将对应）× 3 星
// 1★基础 → 2★解锁技能强化 → 3★数值翻倍
const TOWERS = {
  melee: {   // 近战塔：关羽/张飞，克步兵/盾兵
    id:'melee', name:'近战塔', img:'assets/img/towers/arrow.png',
    color:'#7ee08a', projColor:0x8affa0, cost:150, splash:30,
    desc:'近战高伤，克步兵盾兵。',
    levels:[
      { damage:30, range:95,  rate:1.1, cost:0 },
      { damage:55, range:100, rate:1.2, cost:250 },
      { damage:110,range:110, rate:1.35,cost:600 }
    ]
  },
  range: {   // 远程塔：黄忠/赵云，克弓兵/投石车
    id:'range', name:'远程塔', img:'assets/img/towers/mage.png',
    color:'#7fd4ff', projColor:0x9fdcff, cost:200, pierce:1,
    desc:'远程穿透，射程远。',
    levels:[
      { damage:26, range:180, rate:1.3, cost:0 },
      { damage:48, range:200, rate:1.45,cost:300 },
      { damage:95, range:230, rate:1.6, cost:700 }
    ]
  },
  magic: {   // 魔法塔：诸葛亮/司马懿，全场AOE
    id:'magic', name:'魔法塔', img:'assets/img/towers/cannon.png',
    color:'#c9a7ff', projColor:0xb98cff, cost:300, splash:55,
    desc:'法术溅射，全场 AOE。',
    levels:[
      { damage:38, range:150, rate:0.9, cost:0 },
      { damage:70, range:160, rate:1.0, cost:400 },
      { damage:140,range:175, rate:1.1, cost:900 }
    ]
  },
  support: { // 辅助塔：貂蝉，减速/控制
    id:'support', name:'辅助塔', img:'assets/img/towers/frost.png',
    color:'#ff9ecf', projColor:0xffb0d8, cost:180, slow:0.4,
    desc:'魅惑减速，为友军争取输出。',
    levels:[
      { damage:12, range:140, rate:1.0, slow:0.35, slowTime:1.4, cost:0 },
      { damage:20, range:150, rate:1.05,slow:0.45, slowTime:1.8, cost:280 },
      { damage:36, range:165, rate:1.1, slow:0.55, slowTime:2.2, cost:650 }
    ]
  },
  summon: {  // 召唤塔：吕布，克Boss
    id:'summon', name:'召唤塔', img:'assets/img/towers/cannon.png',
    color:'#ff6b6b', projColor:0xff8080, cost:500, bossKiller:true,
    desc:'召唤分身，对 Boss 特效。',
    levels:[
      { damage:60, range:130, rate:0.7, cost:0 },
      { damage:110,range:140, rate:0.8, cost:500 },
      { damage:220,range:155, rate:0.9, cost:1200 }
    ]
  }
};
const TOWER_KEYS = Object.keys(TOWERS);
