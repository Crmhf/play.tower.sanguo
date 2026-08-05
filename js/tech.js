// 科技树：通关得科技点，3 选 1 永久强化（存 localStorage）
const TECH_TREE = [
  // 进攻
  { id:'atk_speed',  cat:'进攻', name:'全军攻速 +10%',     apply:m=>m.attackSpeed+=0.10 },
  { id:'atk_dmg',    cat:'进攻', name:'单体伤害 +15%',     apply:m=>m.damage+=0.15 },
  { id:'pierce',     cat:'进攻', name:'穿透 +1',           apply:m=>m.pierce+=1 },
  { id:'crit',       cat:'进攻', name:'暴击率 +5%',        apply:m=>m.crit+=0.05 },
  { id:'range',      cat:'进攻', name:'全军射程 +12%',     apply:m=>m.range+=0.12 },
  // 防御
  { id:'hp',         cat:'防御', name:'城防血量 +15%',     apply:m=>m.livesMult+=0.15 },
  { id:'regen',      cat:'防御', name:'城防每波回复 +2',   apply:m=>m.regen+=2 },
  { id:'revive',     cat:'防御', name:'复活币 +1',         apply:m=>m.revive+=1 },
  // 经济
  { id:'gold',       cat:'经济', name:'杀怪金币 +20%',     apply:m=>m.goldMult+=0.20 },
  { id:'startgold',  cat:'经济', name:'起始金币 +100',     apply:m=>m.startGold+=100 },
  { id:'interest',   cat:'经济', name:'每波利息 +5',       apply:m=>m.interest+=5 },
  // 统帅
  { id:'cap1',       cat:'统帅', name:'上阵位 +1',         apply:m=>m.capBonus+=1 },
  { id:'cap2',       cat:'统帅', name:'上阵位 +2',         apply:m=>m.capBonus+=2 }
];

const Tech = {
  KEY: 'sg_tech',
  // 已选科技 id 列表
  owned() { try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch(e){ return []; } },
  points() { return parseInt(localStorage.getItem('sg_tech_points') || '0'); },

  // 汇总所有已选科技加成
  mods() {
    const m = { attackSpeed:0, damage:0, pierce:0, crit:0, range:0,
                livesMult:0, regen:0, revive:0, goldMult:0, startGold:0, interest:0, capBonus:0 };
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
    if (this.points() <= 0) return false;            // 需有可用科技点
    const owned = this.owned();
    if (!owned.includes(id)) owned.push(id);
    localStorage.setItem(this.KEY, JSON.stringify(owned));
    localStorage.setItem('sg_tech_points', String(this.points() - 1));  // 扣点
    return true;
  },

  addPoint() {
    localStorage.setItem('sg_tech_points', String(this.points() + 1));
  },

  // 每关科技点只首通给一次（防重复刷关农场）
  grantForLevel(level) {
    const key = 'sg_tech_cleared';
    let cleared = [];
    try { cleared = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){}
    if (cleared.includes(level)) return false;
    cleared.push(level);
    localStorage.setItem(key, JSON.stringify(cleared));
    this.addPoint();
    return true;
  }
};
