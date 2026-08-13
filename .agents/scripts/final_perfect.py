import json
from pathlib import Path
P = Path("D:/Alparai/messages")

de = json.load(open(P / "de.json", encoding="utf-8"))
fr = json.load(open(P / "fr.json", encoding="utf-8"))
ru = json.load(open(P / "ru.json", encoding="utf-8"))

def setv(obj, k, v):
    *parents, last = k.split(".")
    for p in parents:
        obj = obj[p]
    obj[last] = v

FINAL = {
    # === DE ===
    "nav.feed": {"de": "Feed"},
    "nav.blog": {"de": "Blog"},
    "nav.dashboard": {"de": "Dashboard"},
    "common.live": {"de": "Live"},
    "common.optional": {"de": "Optional"},
    "common.details": {"de": "Details"},
    "hero.trust_1_title": {"de": "Open Source"},
    "hero.trust_3_title": {"de": "PII-Schutz"},
    "hero.join_cta_4_tag": {"de": "Open Source"},
    "footer.links.blog": {"de": "Blog"},
    "common.monitor": {"de": "ALPAR AI • ÜBERWACHUNG"},
    "common.alparAi": {"de": "ALPAR KI"},

    # === FR ===
    "nav.feed": {"fr": "Fil d'actualité"},
    "nav.suggestions": {"fr": "Suggestions"},
    "nav.blog": {"fr": "Blog"},
    "hero.trust_1_title": {"fr": "Code source ouvert"},
    "hero.join_cta_4_tag": {"fr": "Code source ouvert"},
    "footer.sections.contact": {"fr": "Contact"},
    "footer.links.incidents": {"fr": "Incidents"},
    "footer.links.blog": {"fr": "Blog"},
    "common.alparAi": {"fr": "ALPAR IA"},

    # === RU ===
    "nav.feed": {"ru": "Лента"},
    "nav.suggestions": {"ru": "Предложения"},
    "nav.blog": {"ru": "Блог"},
    "hero.why_stat_2_display": {"ru": "96%"},
    "hero.trust_1_title": {"ru": "Открытый исходный код"},
    "footer.sections.contact": {"ru": "Контакты"},
    "footer.links.incidents": {"ru": "Инциденты"},
    "footer.links.blog": {"ru": "Блог"},
    "common.live": {"ru": "Прямой эфир"},
    "common.alparAi": {"ru": "ALPAR ИИ"},
}

for key, trans in FINAL.items():
    for lang in ["de", "fr", "ru"]:
        if lang in trans:
            obj = {"de": de, "fr": fr, "ru": ru}[lang]
            try:
                setv(obj, key, trans[lang])
            except Exception:
                pass

with open(P / "de.json", "w", encoding="utf-8") as f:
    json.dump(de, f, indent=2, ensure_ascii=False)
with open(P / "fr.json", "w", encoding="utf-8") as f:
    json.dump(fr, f, indent=2, ensure_ascii=False)
with open(P / "ru.json", "w", encoding="utf-8") as f:
    json.dump(ru, f, indent=2, ensure_ascii=False)

# Verify
en = json.load(open(P / "en.json", encoding="utf-8"))
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
for lang, name, data in [("DE", "Deutsch", deF), ("FR", "Français", frF), ("RU", "Русский", ruF)]:
    same = [k for k in enF if any(k.startswith(n+".") for n in HOME) and k in data and data[k] == enF[k]]
    total = [k for k in enF if any(k.startswith(n+".") for n in HOME)]
    print(f"{name} ({lang}): {len(same)}/{len(total)} EN-identical home keys")
    if same:
        for k in same:
            print(f"   {k} = \"{enF[k]}\"")
