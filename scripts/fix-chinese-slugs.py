#!/usr/bin/env python3
"""
Fix Chinese character device slugs in the repair_services table.
Generates proper ASCII slugs from brand + model names.
"""

import re
import psycopg2
import os

DATABASE_URL = "postgresql://neondb_owner:npg_U2NElnSK3CdD@ep-muddy-truth-agxbdjze-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

def make_ascii_slug(brand: str, model: str) -> str:
    """Generate ASCII-only slug from brand + model."""
    combined = f"{brand} {model}".lower()
    # Remove CJK characters (Chinese, Japanese, Korean)
    combined = re.sub(r'[\u4e00-\u9fff\u3400-\u4dbf\uff00-\uffef\u3000-\u303f]', ' ', combined)
    # Remove special chars
    combined = re.sub(r'[()（）+.、，。！？]', ' ', combined)
    # Collapse and replace non-alphanumeric with hyphen
    combined = re.sub(r'[^a-z0-9]+', '-', combined)
    # Remove leading/trailing hyphens
    combined = combined.strip('-')
    return combined

def main():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    # 1. Get all unique bad slugs
    cur.execute("""
        SELECT DISTINCT device_slug, device_brand, device_model
        FROM repair_services
        WHERE device_slug ~ '[^[:ascii:]]'
        ORDER BY device_brand, device_slug
    """)
    bad_rows = cur.fetchall()
    print(f"Found {len(bad_rows)} unique bad slugs to fix\n")

    # 2. Get all existing ASCII slugs to check for conflicts
    cur.execute("SELECT DISTINCT device_slug FROM repair_services WHERE device_slug !~ '[^[:ascii:]]'")
    existing_slugs = set(row[0] for row in cur.fetchall())

    # 3. Build slug mapping
    slug_map = {}  # old_slug -> new_slug
    used_new_slugs = set(existing_slugs)

    for old_slug, brand, model in bad_rows:
        new_slug = make_ascii_slug(brand, model)

        # Handle empty slug
        if not new_slug:
            new_slug = re.sub(r'[^a-z0-9]+', '-', brand.lower()).strip('-')

        # Handle conflicts with existing slugs (avoid taking over an existing device's slug)
        if new_slug in used_new_slugs and new_slug not in [v for v in slug_map.values()]:
            # Try appending counter
            base = new_slug
            counter = 2
            while f"{base}-{counter}" in used_new_slugs:
                counter += 1
            new_slug = f"{base}-{counter}"

        # If the new slug is already mapped (another Chinese slug maps to same ASCII)
        elif new_slug in slug_map.values():
            base = new_slug
            counter = 2
            while f"{base}-{counter}" in used_new_slugs or f"{base}-{counter}" in slug_map.values():
                counter += 1
            new_slug = f"{base}-{counter}"

        slug_map[old_slug] = new_slug
        used_new_slugs.add(new_slug)
        print(f"  {old_slug!r} ({brand} - {model}) → {new_slug!r}")

    print(f"\nTotal mappings: {len(slug_map)}")

    # 4. Apply the updates
    print("\nApplying updates...")
    update_count = 0
    for old_slug, new_slug in slug_map.items():
        cur.execute(
            "UPDATE repair_services SET device_slug = %s WHERE device_slug = %s",
            (new_slug, old_slug)
        )
        rows_updated = cur.rowcount
        update_count += rows_updated

    conn.commit()
    print(f"Updated {update_count} service rows across {len(slug_map)} device slugs")

    # 5. Verify no more bad slugs
    cur.execute("SELECT COUNT(DISTINCT device_slug) FROM repair_services WHERE device_slug ~ '[^[:ascii:]]'")
    remaining = cur.fetchone()[0]
    print(f"\nRemaining bad slugs: {remaining}")

    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
