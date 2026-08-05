#!/usr/bin/env python3
"""通过 MiniMax image-01 生成游戏图片素材。"""
import os, sys, json, time, urllib.request

API = "https://api.minimaxi.com/v1/image_generation"
KEY = "sk-cp-g2B6sEzavQ5nKqPszn6aqBE9ictkmXkWGYvYU6DjWYL9CxGzwkNSy3hwqrgjBlM54TL5nMPB13-W88kEb76-IavaQHysXVtNN-zogFFcANoiew-aXMYkl9Y"
ROOT = os.path.join(os.path.dirname(__file__), "..", "assets", "img")

def gen(out_rel, prompt, aspect="1:1", subject=None):
    out = os.path.join(ROOT, out_rel)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    if os.path.exists(out) and os.path.getsize(out) > 1000:
        print(f"skip {out_rel}"); return True
    body = {"model": "image-01", "prompt": prompt,
            "aspect_ratio": aspect, "response_format": "url", "n": 1,
            "prompt_optimizer": True}
    if subject:
        body["subject_reference"] = [{"type": "character", "image_file": subject}]
    req = urllib.request.Request(API, data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + KEY})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                d = json.load(r)
            urls = d.get("data", {}).get("image_urls", [])
            if urls:
                with urllib.request.urlopen(urls[0], timeout=120) as ir:
                    open(out, "wb").write(ir.read())
                print(f"ok   {out_rel}"); return True
            print(f"fail {out_rel}: {d.get('base_resp')}"); return False
        except Exception as e:
            print(f"retry({attempt}) {out_rel}: {e}"); time.sleep(4)
    return False

STYLE = "ancient Chinese Three Kingdoms era, hand-painted epic game art, rich colors, high detail"

JOBS = [
    # ---- 背景（横版 16:9）----
    ("backgrounds/menu_bg.jpg",   f"epic panoramic {STYLE}, vast battlefield at dusk, war banners, burning torches, distant mountains and fortress, dramatic clouds, no text", "16:9"),
    ("backgrounds/bg_plain.jpg",  f"{STYLE}, open central plains battlefield, dusty road winding to a fortress gate, green fields, clear day, tower defense map background, top-down slight angle, no text", "16:9"),
    ("backgrounds/bg_forest.jpg", f"{STYLE}, dense bamboo and pine forest path, mist, ambush terrain, tower defense map background, no text", "16:9"),
    ("backgrounds/bg_river.jpg",  f"{STYLE}, great river crossing, Red Cliffs, warships with sails, water and fire, tower defense map background, no text", "16:9"),
    ("backgrounds/bg_snow.jpg",   f"{STYLE}, frozen northern pass, snow-covered walls and watchtowers, cold blue light, tower defense map background, no text", "16:9"),
    ("backgrounds/bg_volcano.jpg",f"{STYLE}, fiery volcanic war zone, lava rivers, dark fortress, embers in air, tower defense map background, no text", "16:9"),
    ("backgrounds/bg_boss.jpg",   f"{STYLE}, dark demonic imperial throne battlefield, ominous red sky, lightning, final boss arena, no text", "16:9"),
    # ---- 主角（立绘 1:1，纯色背景便于抠图）----
    ("heroes/zhaoyun.png",   f"{STYLE}, heroic general Zhao Yun in silver-white armor holding a long spear, full body game character, centered, solid dark background", "1:1"),
    ("heroes/guanyu.png",    f"{STYLE}, general Guan Yu, long beard, green robe, holding Green Dragon Crescent Blade, full body, centered, solid dark background", "1:1"),
    ("heroes/zhugeliang.png",f"{STYLE}, strategist Zhuge Liang, white scholar robe, feather fan, mystical aura, full body, centered, solid dark background", "1:1"),
    ("heroes/lvbu.png",      f"{STYLE}, mighty warrior Lu Bu, ornate red-gold armor, halberd, fierce, full body, centered, solid dark background", "1:1"),
    # ---- 防御塔 ----
    ("towers/arrow.png",   f"{STYLE}, wooden watchtower with crossbow, game tower icon, centered, solid dark background", "1:1"),
    ("towers/mage.png",    f"{STYLE}, mystical taoist tower with glowing runes and orb, game tower icon, centered, solid dark background", "1:1"),
    ("towers/cannon.png",  f"{STYLE}, ancient chinese fire-lance cannon tower, bronze, game tower icon, centered, solid dark background", "1:1"),
    ("towers/frost.png",   f"{STYLE}, ice crystal tower, blue frost magic, game tower icon, centered, solid dark background", "1:1"),
    # ---- 敌人 ----
    ("enemies/soldier.png", f"{STYLE}, enemy foot soldier with spear and shield, small game unit, solid dark background", "1:1"),
    ("enemies/cavalry.png", f"{STYLE}, enemy light cavalry rider on horse, small game unit, solid dark background", "1:1"),
    ("enemies/shield.png",  f"{STYLE}, heavily armored enemy shield-bearer, small game unit, solid dark background", "1:1"),
    ("enemies/assassin.png",f"{STYLE}, fast enemy assassin in dark cloth, dual daggers, small game unit, solid dark background", "1:1"),
    # ---- Boss ----
    ("boss/dongzhuo.png",  f"{STYLE}, tyrant warlord boss Dong Zhuo, massive fat dark armor, terrifying, menacing, solid dark background", "1:1"),
    ("boss/huaxiong.png",  f"{STYLE}, giant brute boss Hua Xiong, huge axe, muscular, solid dark background", "1:1"),
    ("boss/demon.png",     f"{STYLE}, final demon emperor boss, dark fire, horns, colossal, apocalyptic, solid dark background", "1:1"),
    # ---- 技能特效 ----
    ("effects/skill_storm.png", f"glowing energy tornado slash effect, cyan and white, game vfx sprite, black background", "1:1"),
    ("effects/skill_fire.png",  f"exploding fire phoenix effect, orange and red, game vfx sprite, black background", "1:1"),
    ("effects/skill_thunder.png",f"lightning strike dragon effect, blue electric, game vfx sprite, black background", "1:1"),
    ("effects/skill_blade.png", f"giant crescent blade energy wave, green and gold, game vfx sprite, black background", "1:1"),
    # ---- UI ----
    ("ui/icon_coin.png",  f"{STYLE}, gold ingot coin game icon, solid dark background", "1:1"),
    ("ui/icon_heart.png", f"{STYLE}, jade heart life game icon, solid dark background", "1:1"),
]

if __name__ == "__main__":
    only = sys.argv[1] if len(sys.argv) > 1 else None
    done = fail = 0
    for rel, prompt, aspect in JOBS:
        if only and only not in rel:
            continue
        if gen(rel, prompt, aspect):
            done += 1
        else:
            fail += 1
        time.sleep(1)
    print(f"DONE ok={done} fail={fail}")
