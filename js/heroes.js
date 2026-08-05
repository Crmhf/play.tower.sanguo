// 8 大主力武将：定位 / 塔类型 / 主动技能 / 被动
// tower 字段决定该武将属于哪类防御塔
const HEROES = {
  guanyu: {
    id:'guanyu', name:'关羽', title:'武圣', tower:'melee',
    img:'assets/img/heroes/guanyu.png', color:'#7ee08a',
    desc:'义薄云天，青龙偃月，高伤暴击。',
    passive:{ text:'攻击塔伤害 +15%', damage:0.15 },
    skill:{ name:'武圣斩', cd:14, sfx:'attack_sword', type:'execute', mult:3,
            desc:'对当前最强敌人造成 3 倍伤害。', color:0x6fe07a,
            effectImg:'assets/img/effects/skill_blade.png' }
  },
  zhangfei: {
    id:'zhangfei', name:'张飞', title:'万人敌', tower:'melee',
    img:'assets/img/heroes/zhangfei.png', color:'#e0a05a',
    desc:'当阳桥头一声吼，溅射群攻。',
    passive:{ text:'溅射范围 +20%', splash:0.20 },
    skill:{ name:'咆哮', cd:16, sfx:'skill_cast', type:'roar', knock:60, fear:1.5,
            desc:'推退周围敌人并恐惧 1.5 秒。', color:0xe0a05a,
            effectImg:'assets/img/effects/skill_storm.png' }
  },
  zhaoyun: {
    id:'zhaoyun', name:'赵云', title:'龙胆', tower:'range',
    img:'assets/img/heroes/zhaoyun.png', color:'#7fd4ff',
    desc:'常山赵子龙，七进七出，突进速攻。',
    passive:{ text:'全军攻速 +10%', attackSpeed:0.10 },
    skill:{ name:'龙胆', cd:18, sfx:'skill_cast', type:'dragon', damage:280,
            desc:'化作银龙贯穿全屏，直线巨额伤害。', color:0x7fd4ff,
            effectImg:'assets/img/effects/skill_storm.png' }
  },
  huangzhong: {
    id:'huangzhong', name:'黄忠', title:'老当益壮', tower:'range',
    img:'assets/img/heroes/huangzhong.png', color:'#ffd27f',
    desc:'百步穿杨，远程狙击，穿透高攻。',
    passive:{ text:'远程塔射程 +15%', range:0.15 },
    skill:{ name:'百步穿杨', cd:15, sfx:'attack_sword', type:'snipe',
            desc:'必杀当前血量最高的一个敌人。', color:0xffd27f,
            effectImg:'assets/img/effects/skill_thunder.png' }
  },
  zhugeliang: {
    id:'zhugeliang', name:'诸葛亮', title:'卧龙', tower:'magic',
    img:'assets/img/heroes/zhugeliang.png', color:'#c9a7ff',
    desc:'神机妙算，呼风唤雨，全场 AOE。',
    passive:{ text:'技能冷却 -20%', cooldown:0.20 },
    skill:{ name:'观星', cd:24, sfx:'skill_thunder', type:'starfall', damage:200,
            desc:'天降星火，清屏一波全场伤害。', color:0xb98cff,
            effectImg:'assets/img/effects/skill_fire.png' }
  },
  simayi: {
    id:'simayi', name:'司马懿', title:'冢虎', tower:'magic',
    img:'assets/img/heroes/simayi.png', color:'#a06ad0',
    desc:'深谋远虑，中毒叠加，持续侵蚀。',
    passive:{ text:'塔攻击附带中毒', poison:true },
    skill:{ name:'噬魂', cd:20, sfx:'skill_cast', type:'soul', damage:120, dot:6,
            desc:'吸取敌人攻击并叠加中毒持续掉血。', color:0xa06ad0,
            effectImg:'assets/img/effects/skill_thunder.png' }
  },
  diaochan: {
    id:'diaochan', name:'貂蝉', title:'闭月', tower:'support',
    img:'assets/img/heroes/diaochan.png', color:'#ff9ecf',
    desc:'倾国倾城，魅惑减速，辅助控制。',
    passive:{ text:'减速效果 +20%', slow:0.20 },
    skill:{ name:'离间', cd:18, sfx:'skill_cast', type:'charm', duration:2,
            desc:'魅惑敌人自相残杀 2 秒。', color:0xff9ecf,
            effectImg:'assets/img/effects/skill_blade.png' }
  },
  lvbu: {
    id:'lvbu', name:'吕布', title:'无双', tower:'summon',
    img:'assets/img/heroes/lvbu.png', color:'#ff6b6b',
    desc:'人中吕布，方天画戟，召唤分身。',
    passive:{ text:'暴击率 +25%', crit:0.25 },
    skill:{ name:'方天乱舞', cd:26, sfx:'skill_ultimate', type:'smash', damage:520,
            desc:'方天画戟落地一击，毁灭性范围伤害。', color:0xff5b5b,
            effectImg:'assets/img/effects/skill_thunder.png' }
  }
};
const HERO_KEYS = Object.keys(HEROES);
