import json
from pathlib import Path
P = Path("D:/Alparai/messages")

de = json.load(open(P / "de.json", encoding="utf-8"))
fr = json.load(open(P / "fr.json", encoding="utf-8"))
ru = json.load(open(P / "ru.json", encoding="utf-8"))
en = json.load(open(P / "en.json", encoding="utf-8"))

def fix(d, kv):
    ks, v = kv
    *parents, last = ks.split(".")
    o = d
    for p in parents:
        o = o[p]
    o[last] = v

# Remaining English-identical keys that need translation
FIXES = {
    "de": [
        ("hero.bug_bounty_badge", "KI-Bug-Bounty"),
        ("hero.trust_1_title", "Open Source"),
        ("hero.trust_3_title", "PII Guardian"),
        ("hero.join_cta_4_tag", "Open Source"),
        ("nav.feed", "Feed"),
        ("nav.incidents", "Vorfälle"),
        ("nav.blog", "Blog"),
        ("nav.dashboard", "Dashboard"),
        ("footer.sections.contact", "Kontakt"),
        ("footer.links.blog", "Blog"),
        ("footer.links.incidents", "Vorfälle"),
        ("common.github", "GitHub"),
        ("common.linkedin", "LinkedIn"),
        ("common.live", "Live"),
        ("common.optional", "Optional"),
        ("common.details", "Details"),
        ("common.switchToEnglish", "EN"),
        ("common.switchToTurkish", "TR"),
        ("common.monitor", "ALPAR AI • MONITOR"),
        ("common.alparAi", "ALPAR AI"),
    ],
    "fr": [
        ("hero.why_stat_1_display", "10–20 %"),
        ("hero.why_stat_2_display", "96 %"),
        ("hero.trust_1_title", "Open Source"),
        ("hero.join_cta_4_tag", "Open source"),
        ("footer.sections.contact", "Contact"),
        ("footer.links.incidents", "Incidents"),
        ("footer.links.blog", "Blog"),
        ("nav.feed", "Feed"),
        ("nav.suggestions", "Suggestions"),
        ("nav.blog", "Blog"),
        ("common.github", "GitHub"),
        ("common.linkedin", "LinkedIn"),
        ("common.switchToEnglish", "EN"),
        ("common.switchToTurkish", "TR"),
        ("common.alparAi", "ALPAR AI"),
    ],
    "ru": [
        ("hero.why_stat_1_display", "10–20%"),
        ("hero.why_stat_2_display", "96%"),
        ("hero.trust_1_title", "Open Source"),
        ("hero.join_cta_4_title", "Open source"),
        ("footer.sections.contact", "Contact"),
        ("footer.links.incidents", "Incidents"),
        ("footer.links.blog", "Blog"),
        ("nav.feed", "Feed"),
        ("nav.suggestions", "Suggestions"),
        ("nav.blog", "Blog"),
        ("common.github", "GitHub"),
        ("common.linkedin", "LinkedIn"),
        ("common.switchToEnglish", "EN"),
        ("common.switchToTurkish", "TR"),
        ("common.alparAi", "ALPAR AI"),
    ],
}

for lang_name, fixes in FIXES.items():
    obj = {"de": de, "fr": fr, "ru": ru}[lang_name]
    for kv in fixes:
        try:
            fix(obj, kv)
        except Exception:
            pass
    with open(P / f"{lang_name}.json", "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)

print("Final fixes applied.")
print("Verifying...")

# Final verification
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
for lang_name in ["de", "fr", "ru"]:
    obj = {"de": de, "fr": fr, "ru": ru}[lang_name]
    lg_f = flatten(obj)
    count = 0
    for ns in ["hero", "feed", "moderation", "footer", "nav", "common"]:
        for k, v in en_f.items():
            if k.startswith(ns + ".") and lg_f.get(k) == v:
                count += 1
    print(f"{lang_name.upper()}: {count} homepage keys still identical to EN")