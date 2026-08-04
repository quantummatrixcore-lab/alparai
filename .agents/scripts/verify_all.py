import json
from pathlib import Path
P = Path("D:/Alparai/messages")

en = json.load(open(P / "en.json", encoding="utf-8"))
de = json.load(open(P / "de.json", encoding="utf-8"))
fr = json.load(open(P / "fr.json", encoding="utf-8"))
ru = json.load(open(P / "ru.json", encoding="utf-8"))
tr = json.load(open(P / "tr.json", encoding="utf-8"))

def flatten(d, prefix=""):
    out = {}
    for k, v in d.items():
        key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            out.update(flatten(v, key))
        else:
            out[key] = v
    return out

en_f = flatten(en)
tr_f = flatten(tr)
de_f = flatten(de)
fr_f = flatten(fr)
ru_f = flatten(ru)

HOME_NS = ("hero", "feed", "moderation", "footer", "nav", "common", "app")
ALL_HOME_KEYS = sorted(k for k in en_f if any(k.startswith(ns + ".") for ns in HOME_NS))

print(f"Total homepage keys: {len(ALL_HOME_KEYS)}")
print()

for lang_code, name, data in [
    ("TR", "Türkçe", tr_f),
    ("DE", "Deutsch", de_f),
    ("FR", "Français", fr_f),
    ("RU", "Русский", ru_f),
]:
    identical = 0
    missing = 0
    different = 0
    identical_keys = []
    for k in ALL_HOME_KEYS:
        if k not in data:
            missing += 1
        elif data[k] == en_f[k]:
            identical += 1
            identical_keys.append(k)
        else:
            different += 1
    
    print(f"=== {name} ({lang_code}) ===")
    print(f"  Missing keys: {missing}")
    print(f"  Same-as-English: {identical}/{len(ALL_HOME_KEYS)} ({100*identical//len(ALL_HOME_KEYS)}%)")
    print(f"  Properly translated (different from EN): {different}")
    if identical_keys:
        print(f"  Keys still identical to EN:")
        for k in identical_keys:
            print(f"    {k} = \"{en_f[k]}\"")
    print()

# Also show domain breakdown
print("=== Domain breakdown (hero/feed/moderation/footer/nav/common/app) ===")
for ns in HOME_NS:
    ns_keys = sorted(k for k in ALL_HOME_KEYS if k.startswith(ns + "."))
    for lang_code, name, data in [
        ("DE", "Deutsch", de_f),
        ("FR", "Français", fr_f),
        ("RU", "Русский", ru_f),
    ]:
        idents = sum(1 for k in ns_keys if k in data and data[k] == en_f[k])
        pct = 100 * idents // len(ns_keys) if ns_keys else 0
        bar = "█" * (pct // 5) + "░" * (20 - pct // 5)
        print(f"  [{name:>10}] {ns:15} {bar} {idents}/{len(ns_keys)} ({pct}%) EN-identical")
