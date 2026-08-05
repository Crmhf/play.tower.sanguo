// 敌人定义：hp/speed/armor/reward 会被关卡难度系数缩放
const ENEMIES = {
  soldier:  { id:'soldier',  name:'步兵', img:'assets/img/enemies/soldier.png',
              hp:60,  speed:42, armor:0,   reward:8,  size:30, color:0xc94f4f },
  cavalry:  { id:'cavalry',  name:'骑兵', img:'assets/img/enemies/cavalry.png',
              hp:48,  speed:78, armor:0,   reward:10, size:32, color:0xd08a3a },
  shield:   { id:'shield',   name:'盾兵', img:'assets/img/enemies/shield.png',
              hp:160, speed:30, armor:6,   reward:14, size:34, color:0x8a93a8 },
  assassin: { id:'assassin', name:'刺客', img:'assets/img/enemies/assassin.png',
              hp:36,  speed:105,armor:0,   reward:12, size:28, color:0x9a5bd0 },

  // Boss
  huaxiong: { id:'huaxiong', name:'华雄', img:'assets/img/boss/huaxiong.png', boss:true,
              hp:2600, speed:26, armor:8,  reward:200, size:60, color:0xd84a3a },
  dongzhuo: { id:'dongzhuo', name:'魔化董卓', img:'assets/img/boss/dongzhuo.png', boss:true,
              hp:7000, speed:22, armor:14, reward:500, size:70, color:0x7a3aa0 },
  demon:    { id:'demon',    name:'魔帝', img:'assets/img/boss/demon.png', boss:true,
              hp:16000,speed:20, armor:20, reward:1500,size:84, color:0xff2a4a }
};
