#!/usr/bin/env python3
"""生成 4 个新武将头像（增量，已存在跳过）。"""
import os, sys, json, time, urllib.request

API = "https://api.minimaxi.com/v1/image_generation"
KEY = "sk-cp-g2B6sEzavQ5nKqPszn6aqBE9ictkmXkWGYvYU6DjWYL9CxGzwkNSy3hwqrgjBlM54TL5nMPB13-W88kEb76-IavaQHysXVtNN-zogFFcANoiew-aXMYkl9Y"
ROOT = os.path.join(os.path.dirname(__file__), "..", "assets", "img")
STYLE = "ancient Chinese Three Kingdoms era, hand-painted epic game art, rich colors, high detail"

def gen(out_rel, prompt):
    out = os.path.join(ROOT, out_rel)
    os.makedirs(os.path.dirname(out), exist_ok=True)
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
    ("heroes/machao.png",   f"{STYLE}, heroic cavalry general Ma Chao of Xiliang, silver spear and white-plumed helmet, riding momentum, ornate silver armor, full body, centered, solid dark background"),
    ("heroes/dianwei.png",  f"{STYLE}, massive bodyguard warrior Dian Wei, dual heavy iron halberds, fierce loyal guardian, bulging muscles, dark bronze armor, full body, centered, solid dark background"),
    ("heroes/pangtong.png", f"{STYLE}, brilliant strategist Pang Tong the Fledgling Phoenix, scholar robe with feather fan, mystical green fire, clever eyes, full body, centered, solid dark background"),
    ("heroes/zhoutai.png",  f"{STYLE}, battle-scarred loyal general Zhou Tai of Wu, sword and shield, many battle scars, unyielding defender, teal armor, full body, centered, solid dark background"),
]

if __name__ == "__main__":
    ok = fail = 0
    for rel, prompt in JOBS:
        if gen(rel, prompt): ok += 1
        else: fail += 1
        time.sleep(1)
    print(f"DONE ok={ok} fail={fail}")
