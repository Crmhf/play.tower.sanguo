// 防御塔定义：4 种塔 × 3 级
const TOWERS = {
  arrow: {
    id: 'arrow', name: '连弩塔', img: 'assets/img/towers/arrow.png',
    color: '#ffd27f', projColor: 0xffe08a, cost: 100,
    desc: '快速单体箭矢，射程远。',
    levels: [
      { damage: 22,  range: 150, rate: 1.4, cost: 0 },
      { damage: 40,  range: 165, rate: 1.6, cost: 80 },
      { damage: 70,  range: 185, rate: 1.9, cost: 160 }
    ]
  },
  mage: {
    id: 'mage', name: '符法塔', img: 'assets/img/towers/mage.png',
    color: '#c9a7ff', projColor: 0xb98cff, cost: 140, splash: 45,
    desc: '法术弹小范围溅射，克制成群敌人。',
    levels: [
      { damage: 34,  range: 135, rate: 0.9, cost: 0 },
      { damage: 60,  range: 145, rate: 1.0, cost: 120 },
      { damage: 105, range: 160, rate: 1.1, cost: 220 }
    ]
  },
  cannon: {
    id: 'cannon', name: '火炮塔', img: 'assets/img/towers/cannon.png',
    color: '#ff9a5b', projColor: 0xff7b3a, cost: 180, splash: 70,
    desc: '范围爆炸，高 AOE，对重甲有效。',
    levels: [
      { damage: 55,  range: 120, rate: 0.5, cost: 0 },
      { damage: 95,  range: 128, rate: 0.55, cost: 150 },
      { damage: 165, range: 140, rate: 0.6, cost: 280 }
    ]
  },
  frost: {
    id: 'frost', name: '寒冰塔', img: 'assets/img/towers/frost.png',
    color: '#8fd8ff', projColor: 0x9fe0ff, cost: 120, slow: 0.45,
    desc: '减速冰晶，为其他塔争取输出时间。',
    levels: [
      { damage: 12, range: 130, rate: 1.0, slow: 0.35, slowTime: 1.2, cost: 0 },
      { damage: 20, range: 140, rate: 1.0, slow: 0.45, slowTime: 1.6, cost: 100 },
      { damage: 32, range: 155, rate: 1.1, slow: 0.55, slowTime: 2.0, cost: 180 }
    ]
  }
};
const TOWER_KEYS = Object.keys(TOWERS);
