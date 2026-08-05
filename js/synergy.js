// 势力羁绊系统：不同势力武将同场时产生「加成 / 中和 / 削弱」
// 规则分两类：
//  1) 阵营羁绊（同势力人数触发）：2 人小成、3 人大成、4 人鼎盛（含一个负面极盛）
//  2) 组合羁绊（指定武将同场触发）：有增益、有无效果、也有内耗削弱
// 结算顺序：先算阵营计数，再算组合；mods 为全场通用加成，debuff 为全场通用削弱。
const Synergy = {

  // ---------- 阵营羁绊（同势力在场人数，去重按「不同武将」计）----------
  // 返回 { mods, debuff, lines:[{text,kind}] }  kind: buff|nerf
  factionBonus(count) {
    const m = { damage:0, attackSpeed:0, range:0, splash:0, crit:0, slow:0, pierce:0 };
    const d = { damage:0, attackSpeed:0, range:0 };
    const lines = [];
    if (count >= 4)      { m.damage += 0.30; m.attackSpeed += 0.12; lines.push({ text:'四雄鼎盛 · 伤害+30% 攻速+12%', kind:'buff' }); }
    else if (count >= 3) { m.damage += 0.18; m.attackSpeed += 0.08; lines.push({ text:'三杰大成 · 伤害+18% 攻速+8%', kind:'buff' }); }
    else if (count >= 2) { m.damage += 0.10; lines.push({ text:'双璧小成 · 伤害+10%', kind:'buff' }); }
    return { mods: m, debuff: d, lines };
  },

  // ---------- 组合羁绊（指定武将同时在场才触发）----------
  // need: 需要的武将 id 列表（全部在场才生效）
  // kind: 'buff' 增益 | 'nerf' 削弱 | 'none' 无效果（仅叙事）
  // mods/debuff: 全场数值修正；text: 图鉴/HUD 展示文案
  combos: [
    // —— 增益组合 ——
    { need:['guanyu','zhangfei'], kind:'buff',
      mods:{ damage:0.12 }, text:'桃园结义 · 关羽+张飞：伤害+12%' },
    { need:['guanyu','zhangfei','zhaoyun'], kind:'buff',
      mods:{ damage:0.18, attackSpeed:0.10 }, text:'五虎上将 · 关张赵：伤害+18% 攻速+10%' },
    { need:['zhugeliang','pangtong'], kind:'buff',
      mods:{ splash:0.25 }, text:'卧龙凤雏 · 诸葛亮+庞统：溅射+25%' },
    { need:['zhaoyun','machao'], kind:'buff',
      mods:{ attackSpeed:0.15 }, text:'西凉铁骑 · 赵云+马超：攻速+15%' },
    { need:['huangzhong','machao'], kind:'buff',
      mods:{ range:0.15 }, text:'神射连营 · 黄忠+马超：射程+15%' },
    { need:['dianwei','zhoutai'], kind:'buff',
      mods:{ damage:0.10, range:0.08 }, text:'忠勇死士 · 典韦+周泰：伤害+10% 射程+8%' },
    { need:['simayi','zhugeliang'], kind:'buff',
      mods:{ attackSpeed:0.12, range:0.10 }, text:'龙争虎斗 · 司马懿+诸葛亮：攻速+12% 射程+10%' },
    { need:['lvbu','diaochan'], kind:'buff',
      mods:{ crit:0.15, damage:0.10 }, text:'美人计 · 吕布+貂蝉：暴击+15% 伤害+10%' },

    // —— 削弱组合（内耗）——
    { need:['lvbu','guanyu'], kind:'nerf',
      debuff:{ damage:0.12 }, text:'三英战吕布 · 吕布遇关羽：互不相让 伤害-12%' },
    { need:['lvbu','zhangfei'], kind:'nerf',
      debuff:{ damage:0.10 }, text:'宿敌相逢 · 吕布+张飞：怒火攻心 伤害-10%' },
    { need:['zhugeliang','simayi','pangtong'], kind:'nerf',
      debuff:{ damage:0.15 }, text:'三谋相忌 · 诸葛+司马+庞统：互相掣肘 伤害-15%' },
    { need:['machao','dianwei'], kind:'nerf',
      debuff:{ attackSpeed:0.12 }, text:'渭水恶战 · 马超+典韦：各为其主 攻速-12%' },
    { need:['lvbu','dianwei','zhoutai'], kind:'nerf',
      debuff:{ damage:0.18 }, text:'群英伐吕 · 吕布遇典韦周泰：寡不敌众 伤害-18%' },

    // —— 中和组合（同场不增不减，仅叙事）——
    { need:['zhaoyun','diaochan'], kind:'none',
      text:'英雄美人 · 赵云+貂蝉：各展所长（无羁绊）' },
    { need:['huangzhong','zhoutai'], kind:'none',
      text:'老将相惜 · 黄忠+周泰：井水不犯河水（无羁绊）' }
  ],

  // ---------- 汇总当前在场武将的全部羁绊 ----------
  // fielded: 在场武将 id 数组（可重复，去重后判定）
  compute(fielded) {
    const ids = [...new Set(fielded)];
    // 阵营计数（去重后的不同武将数）
    const cnt = { wei:0, shu:0, wu:0, qun:0 };
    ids.forEach(id => { const f = HEROES[id] && HEROES[id].faction; if (f) cnt[f]++; });

    const mods   = { damage:0, attackSpeed:0, range:0, splash:0, crit:0, slow:0, pierce:0 };
    const debuff = { damage:0, attackSpeed:0, range:0 };
    const active = [];   // 已触发的羁绊文案（HUD/图鉴展示）

    // 1) 阵营羁绊：取每个势力自身人数触发
    Object.keys(cnt).forEach(f => {
      const r = this.factionBonus(cnt[f]);
      if (r.lines.length) {
        for (const k in r.mods) mods[k] += r.mods[k];
        r.lines.forEach(L => active.push({ faction:f, ...L }));
      }
    });

    // 2) 组合羁绊
    this.combos.forEach(c => {
      if (c.need.every(id => ids.includes(id))) {
        if (c.mods)   for (const k in c.mods)   mods[k]   += c.mods[k];
        if (c.debuff) for (const k in c.debuff) debuff[k] += c.debuff[k];
        active.push({ text:c.text, kind:c.kind });
      }
    });

    return { mods, debuff, active, count: cnt };
  }
};
