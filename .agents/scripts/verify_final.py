import json
from pathlib import Path

P = Path("D:/Alparai/messages")
en = json.load(open(P/"en.json", encoding="utf-8"))
de = json.load(open(P/"de.json", encoding="utf-8"))
fr = json.load(open(P/"fr.json", encoding="utf-8"))
ru = json.load(open(P/"ru.json", encoding="utf-8"))

def flat(d, p=""):
    r = {}
    for k, v in d.items():
        k2 = f"{p}.{k}" if p else k
        if isinstance(v, dict):
            r.update(flat(v, k2))
        else:
            r[k2] = v
    return r

enF = flat(en)
deF = flat(de)
frF = flat(fr)
ruF = flat(ru)

HOME = ("hero", "feed", "moderation", "footer", "nav", "common", "app")
total = [k for k in enF if any(k.startswith(n+".") for n in HOME)]
print(f"Total homepage keys: {len(total)}")

lines = []
for code, name, data in [("DE","Deutsch",deF),("FR","Francais",frF),("RU","Russkiy",ruF)]:
    same = sorted(k for k in total if k in data and data[k] == enF[k])
    lines.append(f"{code} ({name}): {len(same)}/{len(total)} EN-identical home keys")
    for k in same:
        v = enF[k]
        if all(ord(c) < 128 for c in v):
            lines.append(f"  {k} = \"{v}\"")
        else:
            lines.append(f"  {k} = <contains utf8>")
    lines.append("")

# Save to file
with open(P.parent / ".agents" / "final_verify.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print("Written to .agents/final_verify.txt")
print(lines[0])
