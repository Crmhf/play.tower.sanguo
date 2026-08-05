// 科技树：通关得科技点，3 选 1 永久强化（存 localStorage）
const TECH_TREE = [
  // 进攻
  { id:'atk_speed',  cat:'进攻', name:'全军攻速 +10%',     apply:m=>m.attackSpeed+=0.10 },
  { id:'atk_dmg',    cat:'进攻', name:'单体伤害 +15%',     apply:m=>m.damage+=0.15 },
  { id:'pierce',     cat:'进攻', name:'穿透 +1',           apply:m=>m.pierce+=1 },
  { id:'crit',       cat:'进攻', name:'暴击率 +5%',        apply:m=>m.crit+=0.05 },
  { id:'cdr',        cat:'进攻', name:'技能冷却 -15%',     apply:m=>m.cooldown+=0.15 },
  // 防御
  { id:'hp',         cat:'防御', name:'城防血量 +20%',     apply:m=>m.livesMult+=0.20 },
  { id:'regen',      cat:'防御', name:'城防每波回复 +5',   apply:m=>m.regen+=5 },
  { id:'revive',     cat:'防御', name:'复活币 +1',         apply:m=>m.revive+=1 },
  // 经济
  { id:'gold',       cat:'经济', name:'杀怪金币 +20%',     apply:m=>m.goldMult+=0.20 },
  { id:'startgold',  cat:'经济', name:'起始金币 +100',     apply:m=>m.startGold+=100 },
  { id:'interest',   cat:'经济', name:'每波利息 +5',       apply:m=>m.interest+=5 }
];

const Tech = {
  KEY: 'sg_tech',
  // 已选科技 id 列表
  owned() { try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch(e){ return []; } },
  points() { return parseInt(localStorage.getItem('sg_tech_points') || '0'); },

  // 汇总所有已选科技加成
  mods() {
    const m = { attackSpeed:0, damage:0, pierce:0, crit:0, cooldown:0,
                livesMult:0, regen:0, revive:0, goldMult:0, startGold:0, interest:0 };
    this.owned().forEach(id => {
      const t = TECH_TREE.find(x => x.id === id);
      if (t) t.apply(m);
    });
    return m;
  },

  // 随机给 3 个未拥有的科技供选择
  choices() {
    const owned = this.owned();
    const avail = TECH_TREE.filter(t => !owned.includes(t.id));
    // 洗牌取 3
    for (let i = avail.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [avail[i], avail[j]] = [avail[j], avail[i]];
    }
    return avail.slice(0, 3);
  },

  pick(id) {
    const owned = this.owned();
    if (!owned.includes(id)) owned.push(id);
    localStorage.setItem(this.KEY, JSON.stringify(owned));
  },

  addPoint() {
    localStorage.setItem('sg_tech_points', String(this.points() + 1));
  }
};
