#!/usr/bin/env python3
"""压缩游戏图片：sprite 缩到 128px webp，背景 jpg 重压 q72。原地覆盖式输出 webp，保留文件名主体。"""
import os, glob
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "assets", "img")

def to_webp(path, max_px, quality):
    img = Image.open(path).convert("RGBA") if path.endswith(".png") else Image.open(path).convert("RGB")
    w, h = img.size
    if max(w, h) > max_px:
        r = max_px / max(w, h)
        img = img.resize((max(1, round(w*r)), max(1, round(h*r))), Image.LANCZOS)
    out = os.path.splitext(path)[0] + ".webp"
    img.save(out, "WEBP", quality=quality, method=6)
    return out, os.path.getsize(path), os.path.getsize(out)

def main():
    total_before = total_after = 0
    # sprite：heroes/enemies/boss → 128px webp（保留透明）
    for d in ["heroes", "enemies", "boss"]:
        for f in sorted(glob.glob(os.path.join(ROOT, d, "*.png"))):
            out, b, a = to_webp(f, 128, 82)
            total_before += b; total_after += a
            print(f"{os.path.relpath(out, ROOT)}  {b//1024}KB -> {a//1024}KB")
    # 背景：jpg → webp 960px q72
    for f in sorted(glob.glob(os.path.join(ROOT, "backgrounds", "*.jpg"))):
        out, b, a = to_webp(f, 960, 72)
        total_before += b; total_after += a
        print(f"{os.path.relpath(out, ROOT)}  {b//1024}KB -> {a//1024}KB")
    print(f"\n合计  {total_before//1024}KB -> {total_after//1024}KB  (省 {100*(1-total_after/total_before):.0f}%)")

if __name__ == "__main__":
    main()
