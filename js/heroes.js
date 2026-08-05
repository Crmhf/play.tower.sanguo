// 武将定义：专属主动技能 + 被动光环
const HEROES = {
  zhaoyun: {
    id: 'zhaoyun', name: '赵云', title: '龙胆',
    img: 'assets/img/heroes/zhaoyun.png',
    desc: '常山赵子龙，七进七出，忠勇无双。',
    color: '#7fd4ff',
    passive: { text: '全军攻速 +10%', attackSpeed: 0.10 },
    skill: {
      name: '七进七出', cd: 18, sfx: 'skill_cast',
      desc: '化作银龙贯穿全屏路径，直线巨额伤害并击退。',
      type: 'dragon', damage: 260, color: 0x7fd4ff,
      effectImg: 'assets/img/effects/skill_storm.png'
    }
  },
  guanyu: {
    id: 'guanyu', name: '关羽', title: '武圣',
    img: 'assets/img/heroes/guanyu.png',
    desc: '义薄云天，青龙偃月，威震华夏。',
    color: '#7ee08a',
    passive: { text: '攻击塔伤害 +15%', damage: 0.15 },
    skill: {
      name: '青龙偃月', cd: 22, sfx: 'attack_sword',
      desc: '召唤青龙刀气横扫半场，大范围斩击并眩晕。',
      type: 'blade', damage: 340, stun: 2.0, color: 0x6fe07a,
      effectImg: 'assets/img/effects/skill_blade.png'
    }
  },
  zhugeliang: {
    id: 'zhugeliang', name: '诸葛亮', title: '卧龙',
    img: 'assets/img/heroes/zhugeliang.png',
    desc: '鞠躬尽瘁，神机妙算，呼风唤雨。',
    color: '#c9a7ff',
    passive: { text: '技能冷却 -20%', cooldown: 0.20 },
    skill: {
      name: '东风火计', cd: 20, sfx: 'skill_fire',
      desc: '呼东风唤天火，持续灼烧区域敌人并减速。',
      type: 'fire', damage: 90, burn: 4, slow: 0.5, color: 0xff9040,
      effectImg: 'assets/img/effects/skill_fire.png'
    }
  },
  lvbu: {
    id: 'lvbu', name: '吕布', title: '无双',
    img: 'assets/img/heroes/lvbu.png',
    desc: '人中吕布，马中赤兔，天下无双。',
    color: '#ff6b6b',
    passive: { text: '暴击率 +25%', crit: 0.25 },
    skill: {
      name: '天下无双', cd: 26, sfx: 'skill_ultimate',
      desc: '方天画戟落地一击，对最密集敌群毁灭性伤害。',
      type: 'smash', damage: 520, color: 0xff5b5b,
      effectImg: 'assets/img/effects/skill_thunder.png'
    }
  }
};
