#!/usr/bin/env python3
"""生成 24 个新武将立绘（增量，已存在跳过）。风格与现有 12 将一致：暗底、全身、居中。"""
import os, sys, json, time, urllib.request

API = "https://api.minimaxi.com/v1/image_generation"
KEY = "sk-cp-g2B6sEzavQ5nKqPszn6aqBE9ictkmXkWGYvYU6DjWYL9CxGzwkNSy3hwqrgjBlM54TL5nMPB13-W88kEb76-IavaQHysXVtNN-zogFFcANoiew-aXMYkl9Y"
ROOT = os.path.join(os.path.dirname(__file__), "..", "assets", "img")
STYLE = "ancient Chinese Three Kingdoms era, hand-painted epic game art portrait, rich colors, high detail, full body heroic general, centered, solid dark background"

def gen(out_rel, prompt):
    out = os.path.join(ROOT, out_rel)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    if os.path.exists(out) and os.path.getsize(out) > 1000:
        print("skip", out_rel, flush=True); return True
    body = {"model":"image-01","prompt":prompt,"aspect_ratio":"1:1","response_format":"url","n":1,"prompt_optimizer":True}
    req = urllib.request.Request(API, data=json.dumps(body).encode(),
        headers={"Content-Type":"application/json","Authorization":"Bearer "+KEY})
    for a in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as r: d = json.load(r)
            urls = d.get("data",{}).get("image_urls",[])
            if urls:
                with urllib.request.urlopen(urls[0], timeout=120) as ir: open(out,"wb").write(ir.read())
                print("ok  ", out_rel, flush=True); return True
            print("fail", out_rel, d.get("base_resp"), flush=True); return False
        except Exception as e:
            print("retry", out_rel, repr(e), flush=True); time.sleep(4)
    return False

JOBS = [
    # 魏
    ("heroes/xuchu.png",       f"{STYLE}, massive bare-chested warrior Xu Chu the Tiger Fool, huge muscles, giant blade, fierce Wei dynasty strongman"),
    ("heroes/xiahoudun.png",   f"{STYLE}, one-eyed general Xiahou Dun with eyepatch, stern loyal commander, dark iron armor, long spear"),
    ("heroes/zhangliao.png",   f"{STYLE}, heroic general Zhang Liao of Wei, gleaming armor, charging cavalry pose, long halberd, commanding presence"),
    ("heroes/xiahouyuan.png",  f"{STYLE}, swift cavalry general Xiahou Yuan, bow and arrow on horseback, light scout armor, dynamic speed"),
    ("heroes/caoren.png",      f"{STYLE}, stalwart defender general Cao Ren, heavy shield and sword, fortified armor, unyielding stance"),
    ("heroes/guojia.png",      f"{STYLE}, brilliant young strategist Guo Jia, scholar robes, confident smirk, mystical purple aura, feather fan"),
    ("heroes/xunyu.png",       f"{STYLE}, refined advisor Xun Yu, elegant minister robes, calm wise expression, teal mystical energy"),
    # 蜀
    ("heroes/weiyan.png",      f"{STYLE}, fierce warrior Wei Yan of Shu, curved blade, bold ambitious expression, crimson armor"),
    ("heroes/jiangwei.png",    f"{STYLE}, young general Jiang Wei of Shu, scholar-warrior, spear and strategy scroll, determined gaze, teal armor"),
    ("heroes/huangyueying.png",f"{STYLE}, clever inventor Huang Yueying, brilliant female engineer with wooden mechanical devices, warm clever eyes, ornate robes"),
    # 吴
    ("heroes/taishici.png",    f"{STYLE}, valiant warrior Taishi Ci of Wu, dual spears, fierce battle-hardened fighter, teal armor"),
    ("heroes/lingtong.png",    f"{STYLE}, loyal young general Ling Tong of Wu, sword and shield, determined defender, jade armor"),
    ("heroes/ganning.png",     f"{STYLE}, bold pirate-turned-general Gan Ning, bells and tattoos, curved saber, daring raider, Wu colors"),
    ("heroes/sunshangxiang.png",f"{STYLE}, warrior princess Sun Shangxiang, female archer with bow, fierce noble beauty, red and teal armor"),
    ("heroes/dingfeng.png",    f"{STYLE}, veteran general Ding Feng of Wu, weathered old warrior with short blade, snow-camo cloak, resolute"),
    ("heroes/lvmeng.png",      f"{STYLE}, disciplined general Lu Meng of Wu, white-robed scholar-general, calm strategic mind, sword at hip"),
    ("heroes/luxun.png",       f"{STYLE}, brilliant young commander Lu Xun of Wu, scholar robes, fire magic, calm burning determination, orange flames"),
    ("heroes/zhugejin.png",    f"{STYLE}, wise minister Zhuge Jin of Wu, long face, composed advisor robes, steady presence"),
    # 群
    ("heroes/huaxiong.png",    f"{STYLE}, towering brutal warrior Hua Xiong, massive blade, intimidating warlord general, dark red armor"),
    ("heroes/yanliang_h.png",  f"{STYLE}, mighty general Yan Liang of Hebei, fierce charger with long spear, ornate bronze armor"),
    ("heroes/wenchou_h.png",   f"{STYLE}, valiant general Wen Chou of Hebei, powerful spear warrior, battle fury, dark steel armor"),
    ("heroes/jiling.png",      f"{STYLE}, stern general Ji Ling with three-pronged blade, disciplined soldier, grey armor"),
    ("heroes/gaoshun.png",     f"{STYLE}, elite commander Gao Shun of the Formation-Breaker camp, disciplined heavy infantry, silver armor"),
    ("heroes/zuoci.png",       f"{STYLE}, mystical immortal sage Zuo Ci, taoist robes, otherworldly magic, floating talismans, ethereal purple mist"),
]

if __name__ == "__main__":
    ok = fail = 0
    for rel, prompt in JOBS:
        if gen(rel, prompt): ok += 1
        else: fail += 1
        time.sleep(1)
    print(f"DONE ok={ok} fail={fail}", flush=True)
