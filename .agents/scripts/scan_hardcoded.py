import re
from pathlib import Path
P = Path("D:/Alparai/src/components/marketing")
layoutP = Path("D:/Alparai/src/components/layout")
files = list(P.glob("*.tsx")) + list(layoutP.glob("*.tsx"))

SKIP_WORDS = {"import", "export", "function", "return", "const", "from", "type", "interface", "extends", "className", "default", "background", "static", "metadata", "Index", "Truth", "Score"}

for f in files:
    content = f.read_text(encoding="utf-8")
    lines = content.split("\n")
    for i, line in enumerate(lines, 1):
        s = line.strip()
        if "t(" in s or "useTranslations" in s:
            continue
        if "//" in s and s.find("//") < min(40, len(s)):
            continue
        m = re.search(r"""(?<![/\*\w])[A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?![\w])""", s)
        if m:
            txt = m.group().strip()
            w = txt.split()
            if len(w) < 3:
                continue
            skip = False
            for w2 in w:
                if w2.lower() in SKIP_WORDS:
                    skip = True; break
            if skip:
                continue
            if any(k in s.lower() for k in ["import ", "classname=", "from "]):
                continue
            print(f"{f.name}:{i}  EN_STRING: \"{txt}\"  [{s[:120]}]")