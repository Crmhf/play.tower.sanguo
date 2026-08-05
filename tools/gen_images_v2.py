#!/usr/bin/env python3
"""为《三国烽火》新增武将/兵种/Boss 生成图片（增量，已存在跳过）。"""
import os, sys, json, time, urllib.request

API = "https://api.minimaxi.com/v1/image_generation"
KEY = "sk-cp-g2B6sEzavQ5nKqPszn6aqBE9ictkmXkWGYvYU6DjWYL9CxGzwkNSy3hwqrgjBlM54TL5nMPB13-W88kEb76-IavaQHysXVtNN-zogFFcANoiew-aXMYkl9Y"
ROOT = os.path.join(os.path.dirname(__file__), "..", "assets", "img")
STYLE = "ancient Chinese Three Kingdoms era, hand-painted epic game art, rich colors, high detail"

def gen(out_rel, prompt):
    out = os.path.join(ROOT, out_rel)
    os.path.join(os.path.dirname(out), exist_ok=True) if False else os.makedirs(os.path.dirname(out), exist_ok=True)
    if os.path.exists(out) and os.path.getsize(out) > 1000:
        print("skip", out_rel); return True
    body = {"model":"image-01","prompt":prompt,"aspect_ratio":"1:1","response_format":"url","n":1,"prompt_optimizer":True}
    req = urllib.request.Request(API, data=json.dumps(body).encode(),
        headers={"Content-Type":"application/json","Authorization":"Bearer "+KEY})
    for a in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as r: d = json.load(r)
            urls = d.get("data",{}).get("image_urls",[])
            if urls:
                with urllib.request.urlopen(urls[0], timeout=120) as ir: open(out,"wb").write(ir.read())
                print("ok  ", out_rel); return True
            print("fail", out_rel, d.get("base_resp")); return False
        except Exception as e:
            print("retry", out_rel, e); time.sleep(4)
    return False

JOBS = [
    # 新增主力武将
    ("heroes/zhangfei.png",  f"{STYLE}, fierce general Zhang Fei, black beard, dark armor, holding serpent spear, roaring, full body, centered, solid dark background"),
    ("heroes/huangzhong.png",f"{STYLE}, veteran archer general Huang Zhong, white beard, drawing a great longbow, focused, full body, centered, solid dark background"),
    ("heroes/simayi.png",    f"{STYLE}, sinister strategist Sima Yi, dark purple robe, shadowy aura, calculating eyes, full body, centered, solid dark background"),
    ("heroes/diaochan.png",  f"{STYLE}, beautiful dancer Diao Chan, flowing pink and violet dress, elegant charm, full body, centered, solid dark background"),
    # 新增兵种
    ("enemies/huangjin.png", f"{STYLE}, Yellow Turban rebel soldier with yellow headscarf and cloth armor, small game unit, solid dark background"),
    ("enemies/archer.png",   f"{STYLE}, enemy crossbow archer aiming, small game unit, solid dark background"),
    ("enemies/ram.png",      f"{STYLE}, wooden battering ram siege engine on wheels, small game unit, solid dark background"),
    ("enemies/catapult.png", f"{STYLE}, stone throwing catapult siege weapon, small game unit, solid dark background"),
    ("enemies/healer.png",   f"{STYLE}, robed enemy healer shaman with glowing green staff, small game unit, solid dark background"),
    ("enemies/fireship.png", f"{STYLE}, burning fire ship with flames, small game unit, solid dark background"),
    ("enemies/elephant.png", f"{STYLE}, armored war elephant with tower, huge, small game unit, solid dark background"),
    ("enemies/sorcerer.png", f"{STYLE}, dark sorcerer summoning spirits, purple magic, small game unit, solid dark background"),
    ("enemies/elite.png",    f"{STYLE}, elite enemy champion warrior with ornate armor and great sword, small game unit, solid dark background"),
    # 章节 Boss
    ("boss/zhangliang.png",  f"{STYLE}, Yellow Turban leader Zhang Liang, yellow robes, wild magic, menacing, solid dark background"),
    ("boss/yanliang.png",    f"{STYLE}, twin warlord general Yan Liang, heavy halberd, brutal, solid dark background"),
    ("boss/zhouyu.png",      f"{STYLE}, handsome strategist Zhou Yu, red and gold armor, fire magic, commanding, solid dark background"),
    ("boss/simayi_boss.png", f"{STYLE}, ultimate dark overlord Sima Yi demon form, shadow wings, purple lightning, terrifying, solid dark background"),
]

if __name__ == "__main__":
    ok = fail = 0
    for rel, prompt in JOBS:
        if gen(rel, prompt): ok += 1
        else: fail += 1
        time.sleep(1)
    print(f"DONE ok={ok} fail={fail}")
