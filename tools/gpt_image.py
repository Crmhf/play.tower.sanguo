#!/usr/bin/env python3
"""用 gpt-image-2 生成图片（OpenAI 兼容 /v1/images/generations，返回 b64_json）。
用法: python3 gpt_image.py <out.png> <prompt> [size]
"""
import os, sys, json, base64, urllib.request

API = "http://cf.douzimi.com:58728/v1/images/generations"
KEY = "sk-LevqgoSsx0T8uoARC17zTQjvkfJO9MFfv8X4Kk5R7Sd9RKxe"

def gen(out, prompt, size="1536x1024"):
    body = {"model":"gpt-image-2","prompt":prompt,"size":size,"n":1}
    req = urllib.request.Request(API, data=json.dumps(body).encode(),
        headers={"Content-Type":"application/json","Authorization":"Bearer "+KEY})
    with urllib.request.urlopen(req, timeout=300) as r:
        d = json.load(r)
    item = d["data"][0]
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    if item.get("b64_json"):
        open(out,"wb").write(base64.b64decode(item["b64_json"]))
    elif item.get("url"):
        with urllib.request.urlopen(item["url"], timeout=300) as ir:
            open(out,"wb").write(ir.read())
    else:
        raise RuntimeError("no image in response: " + json.dumps(d)[:300])
    print("ok", out, os.path.getsize(out)//1024, "KB")

if __name__ == "__main__":
    out, prompt = sys.argv[1], sys.argv[2]
    size = sys.argv[3] if len(sys.argv) > 3 else "1536x1024"
    gen(out, prompt, size)
