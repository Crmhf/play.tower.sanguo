#!/usr/bin/env python3
"""批量生成关卡背景（gpt-image-2），输出 png 后再统一转 webp。增量跳过已存在。"""
import os, sys, json, base64, time, urllib.request

API = "http://cf.douzimi.com:58728/v1/images/generations"
KEY = "sk-LevqgoSsx0T8uoARC17zTQjvkfJO9MFfv8X4Kk5R7Sd9RKxe"
ROOT = os.path.join(os.path.dirname(__file__), "..", "assets", "img", "backgrounds")

JOBS = {
  "menu_bg_v2":   "Epic ancient Chinese war panorama at dusk, vast battlefield with army banners and war drums, dramatic burning orange-red sky, distant mountains and a grand fortress, birds flying, hand-painted cinematic game key art, rich detail, no text, no close-up characters",
  "bg_plain_v2":  "Epic ancient Chinese battlefield at golden dawn, vast open plains with waving grass, distant misty mountains and a crumbling stone fortress gate, a winding dirt road, warm orange sky with dramatic clouds, hand-painted game art, rich detail, cinematic wide shot, no text",
  "bg_forest_v2": "Ancient Chinese forest battlefield, dense bamboo and pine forest with sunbeams piercing through, a hidden dirt path, morning mist, war banners among trees, lush green atmosphere, hand-painted game art, rich detail, cinematic, no text",
  "bg_river_v2":  "Ancient Chinese river battlefield, wide muddy river crossing the scene with a stone bridge, willow trees, reeds and war junks in distance, overcast sky with cold blue-grey tones, hand-painted game art, rich detail, cinematic wide shot, no text",
  "bg_volcano_v2":"Ancient Chinese volcanic battlefield, scorched dark earth with glowing lava cracks, embers and smoke rising, red-orange inferno sky, a burning fortress silhouette, hand-painted game art, dramatic and dangerous, rich detail, no text",
  "bg_snow_v2":   "Ancient Chinese snowy battlefield, frozen plains with falling snow, icy banners and a frost-covered fortress, cold blue-white tones, bleak overcast sky, distant dark mountains, hand-painted game art, rich detail, cinematic wide shot, no text",
  "bg_boss_v2":   "Ancient Chinese final war fortress at night, massive dark citadel with torches and siege fires, storm clouds and lightning, armies gathered below, ominous epic atmosphere, hand-painted game art, rich detail, cinematic, no text",
}

def gen(name, prompt):
    out = os.path.join(ROOT, name + ".png")
    os.makedirs(ROOT, exist_ok=True)
    if os.path.exists(out) and os.path.getsize(out) > 50000:
        print("skip", name, flush=True); return True
    body = {"model":"gpt-image-2","prompt":prompt,"size":"1536x1024","n":1}
    req = urllib.request.Request(API, data=json.dumps(body).encode(),
        headers={"Content-Type":"application/json","Authorization":"Bearer "+KEY})
    for a in range(3):
        try:
            with urllib.request.urlopen(req, timeout=300) as r: d = json.load(r)
            item = d["data"][0]
            if item.get("b64_json"):
                open(out,"wb").write(base64.b64decode(item["b64_json"]))
            else:
                with urllib.request.urlopen(item["url"], timeout=300) as ir: open(out,"wb").write(ir.read())
            print("ok  ", name, os.path.getsize(out)//1024, "KB", flush=True); return True
        except Exception as e:
            print("retry", name, repr(e), flush=True); time.sleep(5)
    return False

if __name__ == "__main__":
    ok = 0
    for name, prompt in JOBS.items():
        if gen(name, prompt): ok += 1
        time.sleep(1)
    print(f"DONE {ok}/{len(JOBS)}", flush=True)
