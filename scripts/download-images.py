#!/usr/bin/env python3
"""
下载 e-tech.ie 全站图片脚本
- 模型封面图（158张）：/api/images/model/...
- 分类图标（36张）：/api/images/category/...
"""

import json
import os
import time
import urllib.request
import urllib.error
from pathlib import Path

BASE_URL = "https://e-tech.ie/api"
SCRAPED_DIR = Path(__file__).parent / "scraped"
IMAGES_DIR = SCRAPED_DIR / "images"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.e-tech.ie/",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
}


def download_image(image_path: str, save_dir: Path) -> bool:
    """
    image_path: e.g. "images/model/20260203-xxx.jpg"
    save_dir: directory to save into
    """
    url = f"{BASE_URL}/{image_path}"
    filename = os.path.basename(image_path)
    save_path = save_dir / filename

    if save_path.exists():
        print(f"  [SKIP] {filename} (已存在)")
        return True

    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as resp:
            content_type = resp.headers.get("Content-Type", "")
            if "image" not in content_type:
                print(f"  [WARN] {filename} - 非图片响应: {content_type}")
                return False
            data = resp.read()
            save_path.write_bytes(data)
            print(f"  [OK]   {filename} ({len(data)//1024}KB)")
            return True
    except urllib.error.HTTPError as e:
        print(f"  [ERR]  {filename} - HTTP {e.code}")
        return False
    except Exception as e:
        print(f"  [ERR]  {filename} - {e}")
        return False


def load_json(path: Path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def main():
    # 创建目录
    model_dir = IMAGES_DIR / "model"
    category_dir = IMAGES_DIR / "category"
    model_dir.mkdir(parents=True, exist_ok=True)
    category_dir.mkdir(parents=True, exist_ok=True)

    ok = fail = skip = 0

    # ── 1. 模型封面图 ──────────────────────────────────────────
    print("\n=== 下载模型封面图 ===")
    models = load_json(SCRAPED_DIR / "models.json")
    covers = list({m["cover"] for m in models if m.get("cover")})
    print(f"共 {len(covers)} 张模型图")

    for cover in covers:
        result = download_image(cover, model_dir)
        if result:
            ok += 1
        else:
            fail += 1
        time.sleep(0.15)

    # ── 2. 分类图标 ────────────────────────────────────────────
    print("\n=== 下载分类图标 ===")
    categories = load_json(SCRAPED_DIR / "categories.json")
    pictures = list({c["picture"] for c in categories if c.get("picture")})
    print(f"共 {len(pictures)} 张分类图")

    for pic in pictures:
        result = download_image(pic, category_dir)
        if result:
            ok += 1
        else:
            fail += 1
        time.sleep(0.15)

    # ── 汇总 ───────────────────────────────────────────────────
    print(f"\n{'='*40}")
    print(f"完成！成功: {ok}  失败: {fail}")
    print(f"图片保存位置: {IMAGES_DIR}")

    # 输出目录统计
    for subdir in [model_dir, category_dir]:
        files = list(subdir.iterdir())
        total_kb = sum(f.stat().st_size for f in files) // 1024
        print(f"  {subdir.name}/: {len(files)} 个文件，{total_kb}KB")


if __name__ == "__main__":
    main()
