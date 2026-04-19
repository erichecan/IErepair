#!/usr/bin/env python3
"""
闪修侠 (shanxiuxia.com) 爬取脚本

用法：
  python3 scripts/scrape-shanxiuxia.py

输出：
  scripts/scraped-sxx/brands.json          — 品牌列表（含图片 URL）
  scripts/scraped-sxx/models.json          — 所有型号（含图片 URL）
  scripts/scraped-sxx/repair_items.json    — 所有维修项目（含价格）
  scripts/scraped-sxx/products.json        — 整合后可导入的产品数据
  scripts/scraped-sxx/images/brands/       — 品牌 logo
  scripts/scraped-sxx/images/models/       — 手机型号图片
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.request
import urllib.parse
from pathlib import Path
from typing import Optional

# ── 配置 ──────────────────────────────────────────────────────────────────
BASE_URL = "https://www.shanxiuxia.com"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Referer": "https://www.shanxiuxia.com/",
}

SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR / "scraped-sxx"
IMG_DIR    = OUTPUT_DIR / "images"
BRAND_IMG  = IMG_DIR / "brands"
MODEL_IMG  = IMG_DIR / "models"

# 延迟（秒），避免被封
DELAY = 0.5


# ── 工具函数 ──────────────────────────────────────────────────────────────

def ensure_dirs():
    for d in [OUTPUT_DIR, IMG_DIR, BRAND_IMG, MODEL_IMG]:
        d.mkdir(parents=True, exist_ok=True)


def fetch_html(url: str, retries: int = 3) -> str | None:
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=15) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except Exception as e:
            print(f"  [warn] {url} 第{i+1}次失败: {e}")
            if i < retries - 1:
                time.sleep(2)
    return None


def download_image(img_url: str, dest_dir: Path, filename: str) -> str | None:
    """下载图片到 dest_dir/filename，返回本地相对路径，失败返回 None"""
    if not img_url:
        return None
    # 获取扩展名
    parsed = urllib.parse.urlparse(img_url)
    ext = Path(parsed.path).suffix or ".png"
    local_path = dest_dir / f"{filename}{ext}"

    if local_path.exists():
        return str(local_path.relative_to(OUTPUT_DIR))

    try:
        req = urllib.request.Request(img_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
        local_path.write_bytes(data)
        return str(local_path.relative_to(OUTPUT_DIR))
    except Exception as e:
        print(f"  [warn] 图片下载失败 {img_url}: {e}")
        return None


def slugify(text: str) -> str:
    """转 ASCII slug，去除特殊字符"""
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")[:60]


# ── 解析函数 ──────────────────────────────────────────────────────────────

def parse_msg_data(html: str) -> dict:
    """从页面 JS 中提取 var msgData = {...}"""
    m = re.search(r"msgData[=\s]*(\{[^<]{100,})", html, re.DOTALL)
    if m:
        # 找到最外层 JSON 对象的结束位置
        raw = m.group(1)
        depth = 0
        end = 0
        for i, ch in enumerate(raw):
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
        if end:
            try:
                return json.loads(raw[:end])
            except json.JSONDecodeError as e:
                print(f"  [warn] msgData JSON 解析失败: {e}")
    return {}


def parse_brands(html: str) -> list[dict]:
    """从首页解析品牌列表"""
    data = parse_msg_data(html)
    brands = data.get("brandArr", [])
    result = []
    for b in brands:
        result.append({
            "id": b.get("id"),
            "name": b.get("name"),
            "logo_url": b.get("url") or b.get("wap_url"),
            "category_id": b.get("category_id"),
            "sort": b.get("sort"),
        })
    return result


def parse_models_from_brand_page(html: str) -> list[dict]:
    """从品牌页解析型号列表（从 HTML li 元素）"""
    models = []
    # 匹配 <li class="phone-li"><a class="li-a" href="/phone/1/id/1589"><img src="..." alt="...">
    pattern = re.compile(
        r'<li class="phone-li">\s*<a class="li-a" href="(/phone/(\d+)/id/(\d+))">'
        r'\s*<img src="([^"]+)" alt="([^"]+)"',
        re.DOTALL,
    )
    for m in pattern.finditer(html):
        models.append({
            "url_path": m.group(1),
            "brand_id": m.group(2),
            "model_id": m.group(3),
            "img_url": m.group(4),
            "name": m.group(5),
        })
    return models


def parse_repair_items(html: str, brand_id: str, model_id: str) -> dict:
    """
    从型号详情页解析维修项目
    返回：{
      "model_name": "...",
      "model_img_url": "...",
      "fault_types": ["电池/充电问题", ...],
      "repair_items": [
        {
          "fault_type": "电池/充电问题",
          "item_name": "原装电池",
          "price": 769.0,
          "original_price": 0.0,
          "pmid": "22829",
          "malid": "465"
        },
        ...
      ]
    }
    """
    result = {
        "brand_id": brand_id,
        "model_id": model_id,
        "model_name": "",
        "model_img_url": "",
        "fault_types": [],
        "repair_items": [],
    }

    # 型号名称
    title_m = re.search(r'id="phoneName">([^<]+)</span>', html)
    if title_m:
        result["model_name"] = title_m.group(1).strip()

    # 型号图片
    img_m = re.search(
        r'<div class="img-wrap" id="phoneImg"><img src="([^"]+)" alt="([^"]+)"', html
    )
    if img_m:
        result["model_img_url"] = img_m.group(1)

    # 故障类型（一级分类）
    fault_types = re.findall(r'<li class="mal-li ul-li">([^<]+)<span>', html)
    result["fault_types"] = [ft.strip() for ft in fault_types]

    # 维修方案（二级维修项）
    # <li class="mal-li mal-sub-li ul-li" data-pmal="电池/充电问题" data-pmid="22829" data-malid="465">
    #   <div class="mal-name">原装电池</div>
    #   <div class="mal-money"><p class="ac-money">¥769.00</p><p>¥0.00</p></div>
    # </li>
    item_pattern = re.compile(
        r'<li class="mal-li mal-sub-li ul-li"[^>]*'
        r'data-pmal="([^"]*)"[^>]*'
        r'data-pmid="([^"]*)"[^>]*'
        r'data-malid="([^"]*)"[^>]*>'
        r'\s*<div class="mal-name">([^<]+)</div>'
        r'\s*<div class="mal-money">'
        r'\s*<p class="ac-money">¥([\d.]+)</p>'
        r'\s*<p>¥([\d.]+)</p>',
        re.DOTALL,
    )
    for m in item_pattern.finditer(html):
        result["repair_items"].append({
            "fault_type": m.group(1).strip(),
            "item_name": m.group(4).strip(),
            "price": float(m.group(5)),
            "original_price": float(m.group(6)),
            "pmid": m.group(2),
            "malid": m.group(3),
        })

    return result


# ── 主流程 ────────────────────────────────────────────────────────────────

def main():
    ensure_dirs()

    # ── Step 1: 获取品牌列表 ─────────────────────────────────────────────
    print("\n[1/4] 获取品牌列表...")
    html = fetch_html(f"{BASE_URL}/phone/")
    if not html:
        print("首页获取失败，退出")
        sys.exit(1)

    brands = parse_brands(html)
    print(f"  → 发现 {len(brands)} 个品牌")

    # 同时从 HTML 中抓一遍品牌（补全 msgData 可能遗漏的）
    extra_brand_pattern = re.compile(
        r'<li class="brand-li[^"]*" data-id="(\d+)">\s*'
        r'<a href="(/phone/(\d+))"[^>]*>\s*'
        r'<img src="([^"]+)" alt="([^"]+)"',
    )
    brand_ids_seen = {b["id"] for b in brands}
    for m in extra_brand_pattern.finditer(html):
        if m.group(1) not in brand_ids_seen:
            brands.append({
                "id": m.group(1),
                "name": m.group(5),
                "logo_url": m.group(4),
                "category_id": None,
                "sort": None,
            })
            brand_ids_seen.add(m.group(1))

    # 下载品牌 logo
    print("  → 下载品牌 logo...")
    for b in brands:
        if b.get("logo_url"):
            slug = slugify(b["name"])
            local = download_image(b["logo_url"], BRAND_IMG, f"brand-{b['id']}-{slug}")
            b["logo_local"] = local
        time.sleep(0.1)

    (OUTPUT_DIR / "brands.json").write_text(
        json.dumps(brands, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"  → 已保存 brands.json ({len(brands)} 条)")

    # ── Step 2: 获取每个品牌的型号列表 ──────────────────────────────────
    print(f"\n[2/4] 获取 {len(brands)} 个品牌的型号列表...")

    all_models = []
    brand_map = {b["id"]: b["name"] for b in brands}

    for i, brand in enumerate(brands):
        brand_id = brand["id"]
        brand_name = brand["name"]
        print(f"  [{i+1}/{len(brands)}] {brand_name} (id={brand_id})...", end=" ")

        brand_html = fetch_html(f"{BASE_URL}/phone/{brand_id}")
        if not brand_html:
            print("失败")
            continue

        models = parse_models_from_brand_page(brand_html)
        for m in models:
            m["brand_name"] = brand_name
        all_models.extend(models)
        print(f"{len(models)} 个型号")
        time.sleep(DELAY)

    (OUTPUT_DIR / "models.json").write_text(
        json.dumps(all_models, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\n  → 合计 {len(all_models)} 个型号，已保存 models.json")

    # ── Step 3: 获取每个型号的维修项目 ───────────────────────────────────
    print(f"\n[3/4] 获取 {len(all_models)} 个型号的维修项目...")

    all_repair_data = []
    cache_dir = OUTPUT_DIR / "cache"
    cache_dir.mkdir(exist_ok=True)

    for i, model in enumerate(all_models):
        model_id  = model["model_id"]
        brand_id  = model["brand_id"]
        model_name = model["name"]
        cache_file = cache_dir / f"{brand_id}-{model_id}.json"

        if cache_file.exists():
            repair = json.loads(cache_file.read_text(encoding="utf-8"))
            print(f"  [{i+1}/{len(all_models)}] {model_name} — 缓存 ({len(repair.get('repair_items', []))} 项)")
        else:
            print(f"  [{i+1}/{len(all_models)}] {model_name}...", end=" ", flush=True)
            url = f"{BASE_URL}/phone/{brand_id}/id/{model_id}"
            detail_html = fetch_html(url)
            if not detail_html:
                print("失败")
                continue

            repair = parse_repair_items(detail_html, brand_id, model_id)
            repair["brand_name"] = model.get("brand_name", "")
            cache_file.write_text(json.dumps(repair, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"{len(repair['repair_items'])} 个维修项")
            time.sleep(DELAY)

        all_repair_data.append(repair)

    (OUTPUT_DIR / "repair_items.json").write_text(
        json.dumps(all_repair_data, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    total_items = sum(len(r.get("repair_items", [])) for r in all_repair_data)
    print(f"\n  → 合计 {total_items} 个维修项，已保存 repair_items.json")

    # ── Step 4: 下载型号图片 + 整合为 products.json ───────────────────────
    print(f"\n[4/4] 下载型号图片并整合 products.json...")

    products = []
    model_img_map = {}

    # 先用 models.json 里的 img_url 下载（更快，避免重复请求详情页）
    for model in all_models:
        model_id = model["model_id"]
        slug = slugify(model["name"])
        local = model_img_map.get(model_id)
        if not local and model.get("img_url"):
            local = download_image(model["img_url"], MODEL_IMG, f"model-{model_id}-{slug}")
            model_img_map[model_id] = local
        time.sleep(0.05)

    for repair in all_repair_data:
        model_id   = repair["model_id"]
        model_name = repair.get("model_name") or ""
        brand_name = repair.get("brand_name") or ""
        model_img  = model_img_map.get(model_id) or download_image(
            repair.get("model_img_url", ""), MODEL_IMG,
            f"model-{model_id}-{slugify(model_name)}"
        )

        for item in repair.get("repair_items", []):
            products.append({
                "brand_id":       repair["brand_id"],
                "brand_name":     brand_name,
                "model_id":       model_id,
                "model_name":     model_name,
                "model_img_url":  repair.get("model_img_url"),
                "model_img_local": model_img,
                "fault_type":     item["fault_type"],
                "item_name":      item["item_name"],
                "price":          item["price"],
                "original_price": item["original_price"],
                "pmid":           item["pmid"],
                "malid":          item["malid"],
            })

    (OUTPUT_DIR / "products.json").write_text(
        json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # ── 完成 ──────────────────────────────────────────────────────────────
    print("\n" + "="*60)
    print("爬取完成！")
    print(f"  品牌数：{len(brands)}")
    print(f"  型号数：{len(all_models)}")
    print(f"  维修项数：{total_items}")
    print(f"  产品条目：{len(products)}")
    print(f"  输出目录：{OUTPUT_DIR}")
    print("="*60)


if __name__ == "__main__":
    main()
