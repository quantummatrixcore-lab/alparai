#!/usr/bin/env python3
"""Identify keys that need professional translation for DE/FR/RU."""
import json
import sys
from pathlib import Path

MSGS = Path("D:/Alparai/messages")

def load(name):
    with open(MSGS / name, "r", encoding="utf-8") as f:
        return json.load(f)

def flatten(obj, prefix=""):
    out = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            key = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                out.update(flatten(v, key))
            else:
                out[key] = v
    return out

en = flatten(load("en.json"))
de = flatten(load("de.json"))
fr = flatten(load("fr.json"))
ru = flatten(load("ru.json"))

# Homepage-critical namespaces
HOME_NS = ("hero", "feed", "moderation", "footer", "nav", "common", "app")

def missing_for_lang(target, lang_code):
    miss = []
    for ns in HOME_NS:
        for k in en.keys():
            if not k.startswith(ns + "."):
                continue
            if k not in target:
                miss.append((k, en[k], "<MISSING_KEY>"))
            elif target[k] == en[k]:
                miss.append((k, en[k], lang_code))
    return miss

de_miss = missing_for_lang(de, "DE")
fr_miss = missing_for_lang(fr, "FR")
ru_miss = missing_for_lang(ru, "RU")

# Save lists
out = Path("D:/Alparai/.agents")
out.mkdir(exist_ok=True)

for name, data in [("de_missing", de_miss), ("fr_missing", fr_miss), ("ru_missing", ru_miss)]:
    with open(out / f"homepage_{name}.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"{name}: {len(data)} keys")

# Also write a single combined file for review
combined = {
    "de": de_miss,
    "fr": fr_miss,
    "ru": ru_miss,
}
with open(out / "homepage_all_missing.json", "w", encoding="utf-8") as f:
    json.dump(combined, f, indent=2, ensure_ascii=False)
