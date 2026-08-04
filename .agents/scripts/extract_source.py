#!/usr/bin/env python3
"""Extract full EN source text for each key in homepage-critical namespaces."""
import json
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
tr = flatten(load("tr.json"))
de = flatten(load("de.json"))
fr = flatten(load("fr.json"))
ru = flatten(load("ru.json"))

HOME_NS = ("hero", "feed", "moderation", "footer", "nav", "common", "app")

lines = []
for k in en.keys():
    if not any(k.startswith(ns + ".") for ns in HOME_NS):
        continue
    tr_v = tr.get(k, "<MISSING>")
    de_v = de.get(k, "<MISSING>")
    fr_v = fr.get(k, "<MISSING>")
    ru_v = ru.get(k, "<MISSING>")
    is_eng_de = de_v == en[k]
    is_eng_fr = fr_v == en[k]
    is_eng_ru = ru_v == en[k]
    if is_eng_de or is_eng_fr or is_eng_ru:
        flags = []
        if is_eng_de: flags.append("DE")
        if is_eng_fr: flags.append("FR")
        if is_eng_ru: flags.append("RU")
        lines.append(f"[{','.join(flags)}] {k}")
        lines.append(f"  EN: {en[k]}")
        lines.append(f"  TR: {tr_v}")
        lines.append("")

out = Path("D:/Alparai/.agents/homepage_source_text.txt")
with open(out, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"Wrote {out}")
print(f"Lines: {len(lines)}")
