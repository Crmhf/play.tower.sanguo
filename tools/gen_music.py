#!/usr/bin/env python3
"""通过 MiniMax music-2.6 生成三国战斗纯音乐 BGM。"""
import os, sys, json, time, urllib.request, base64

API = "https://api.minimaxi.com/v1/music_generation"
KEY = "sk-cp-g2B6sEzavQ5nKqPszn6aqBE9ictkmXkWGYvYU6DjWYL9CxGzwkNSy3hwqrgjBlM54TL5nMPB13-W88kEb76-IavaQHysXVtNN-zogFFcANoiew-aXMYkl9Y"
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "audio", "bgm")
os.makedirs(OUT, exist_ok=True)

TRACKS = {
    "menu.mp3":  "Majestic ancient Chinese Three Kingdoms main theme, guzheng and erhu melody over deep war drums, heroic and epic, orchestral, instrumental only, no vocals",
    "battle.mp3":"Intense Three Kingdoms battle music, fast war drums taiko, aggressive guzheng and pipa, dramatic strings, martial arts fighting rhythm, high energy, instrumental only, no vocals",
    "boss.mp3":  "Dark apocalyptic final boss battle music, heavy pounding drums, ominous erhu and brass, epic choir-like tension but instrumental, fast and brutal, no vocals",
}

def gen(name, prompt):
    out = os.path.join(OUT, name)
    if os.path.exists(out) and os.path.getsize(out) > 50000:
        print("skip", name); return True
    body = {"model": "music-2.6", "prompt": prompt, "lyrics": "[inst]",
            "audio_setting": {"sample_rate": 44100, "bitrate": 256000, "format": "mp3"}}
    req = urllib.request.Request(API, data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + KEY})
    for a in range(3):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                d = json.load(r)
            audio = d.get("data", {}).get("audio")
            if audio:
                open(out, "wb").write(bytes.fromhex(audio))
                print("ok", name, len(audio)//2, "bytes"); return True
            print("fail", name, d.get("base_resp")); return False
        except Exception as e:
            print("retry", name, e); time.sleep(5)
    return False

if __name__ == "__main__":
    for n, p in TRACKS.items():
        gen(n, p); time.sleep(2)
    print("MUSIC DONE")
