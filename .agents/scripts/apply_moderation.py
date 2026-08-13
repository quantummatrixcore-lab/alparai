import json
from pathlib import Path
MSGS = Path("D:/Alparai/messages")

with open(MSGS / "de.json", encoding="utf-8") as f: de = json.load(f)
with open(MSGS / "fr.json", encoding="utf-8") as f: fr = json.load(f)
with open(MSGS / "ru.json", encoding="utf-8") as f: ru = json.load(f)

def setv(obj, k, v):
    parts = k.split(".")
    for p in parts[:-1]:
        obj = obj[p]
    obj[parts[-1]] = v

MOD = {
    "moderation.title": {
        "de": "Inhaltsmoderationsrichtlinie — ALPAR AI",
        "fr": "Politique de modération du contenu — ALPAR AI",
        "ru": "Политика модерации контента — ALPAR AI"
    },
    "moderation.description": {
        "de": "Regeln und Leitlinien für das Einreichen und Moderieren von Vorfallsmeldungen auf ALPAR AI.",
        "fr": "Règles et directives pour la soumission et la modération des signalements d'incidents sur ALPAR AI.",
        "ru": "Правила и руководства по подаче и модерации отчётов об инцидентах на ALPAR AI."
    },
    "moderation.badge": {
        "de": "PLATTFORMREGELN",
        "fr": "RÈGLES DE LA PLATEFORME",
        "ru": "ПРАВИЛА ПЛАТФОРМЫ"
    },
    "moderation.headline": {
        "de": "Richtlinien zur Inhaltsmoderation",
        "fr": "Directives de modération du contenu",
        "ru": "Руководящие принципы модерации контента"
    },
    "moderation.subtitle": {
        "de": "Wir dokumentieren reale KI-Fehler mit maximaler Wahrhaftigkeit, Transparenz und Fairness. Diese Richtlinien erklären, wie Inhalte überprüft und moderiert werden.",
        "fr": "Nous documentons les défaillances réelles de l'IA avec un maximum de véracité, de transparence et d'équité. Ces directives expliquent comment le contenu est vérifié et modéré.",
        "ru": "Мы документируем реальные сбои ИИ с максимальной правдивостью, прозрачностью и справедливостью. Эти правила объясняют, как контент проверяется и модерируется."
    },
    "moderation.rules_title": {
        "de": "Kernregeln der Moderation",
        "fr": "Règles fondamentales de modération",
        "ru": "Основные правила модерации"
    },
    "moderation.rules_subtitle": {
        "de": "Jede Einreichung wird anhand dieser grundlegenden Community-Standards überprüft.",
        "fr": "Chaque soumission est examinée selon ces normes communautaires fondamentales.",
        "ru": "Каждая подача проверяется на соответствие этим базовым стандартам сообщества."
    },
    "moderation.rule_1_title": {
        "de": "1. Faktenbasierte Nachweise erforderlich",
        "fr": "1. Des preuves factuelles sont exigées",
        "ru": "1. Требуются фактические доказательства"
    },
    "moderation.rule_1_desc": {
        "de": "Alle gemeldeten KI-Vorfälle müssen durch konkrete Beweise belegt sein: Screenshots, JSON-Protokolle oder archivierte URL-Links, die den Fehler dokumentieren. Behauptungen ohne Nachweis werden nicht veröffentlicht.",
        "fr": "Tous les incidents d'IA signalés doivent être accompagnés de preuves concrètes : captures d'écran, journaux JSON ou liens web archivés démontrant la défaillance. Les allégations sans preuve ne seront pas publiées.",
        "ru": "Все заявленные инциденты ИИ должны сопровождаться конкретными доказательствами: скриншотами, JSON-логами или архивными URL-ссылками, демонстрирующими сбой. Утверждения без доказательств не будут опубликованы."
    },
    "moderation.rule_2_title": {
        "de": "2. Keine personenbezogenen Daten",
        "fr": "2. Pas de données personnelles",
        "ru": "2. Запрет персональных данных"
    },
    "moderation.rule_2_desc": {
        "de": "Berichte dürfen keine Benutzernamen, unverschlüsselte E-Mail-Adressen, IP-Adressen oder Telefonnummern enthalten. Unser PII Guardian maskiert diese Daten automatisch, aber Nutzer müssen sich bemühen, diese nicht einzureichen.",
        "fr": "Les rapports ne doivent pas contenir de noms d'utilisateur, d'adresses e-mail brutes, d'adresses IP ou de numéros de téléphone. Notre Protecteur de données masque automatiquement ces données, mais les utilisateurs doivent faire un effort raisonnable pour éviter de les soumettre.",
        "ru": "Отчёты не должны содержать имена пользователей, незашифрованные адреса электронной почты, IP-адреса или номера телефонов. Наш PII Guardian автоматически маскирует эти данные, но пользователи должны приложить разумные усилия, чтобы их не отправлять."
    },
    "moderation.rule_3_title": {
        "de": "3. Fokus auf Systemausfälle",
        "fr": "3. Se concentrer sur les défaillances du système",
        "ru": "3. Сосредоточьтесь на системных сбоях"
    },
    "moderation.rule_3_desc": {
        "de": "Vorfälle müssen Systemausfälle, Halluzinationen, Verzerrungen, Sicherheitsverletzungen oder unerwartetes Verhalten von KI-Modellen darstellen. Allgemeine Meinungsverschiedenheiten mit KI-Standpunkten stellen keine Systemausfälle dar.",
        "fr": "Les incidents doivent représenter des défaillances du système, des hallucinations, des biais, des violations de sécurité ou un comportement inattendu des modèles d'IA. Les simples divergences d'opinion avec les points de vue de l'IA ne constituent pas des défaillances du système.",
        "ru": "Инциденты должны отражать системные сбои, галлюцинации, предвзятость, нарушения безопасности или неожиданное поведение моделей ИИ. Общие разногласия с точками зрения ИИ не являются системными сбоями."
    },
    "moderation.rule_4_title": {
        "de": "4. Keine Hassrede oder Belästigung",
        "fr": "4. Pas de discours haineux ou de harcèlement",
        "ru": "4. Никаких разжиганий ненависти и преследований"
    },
    "moderation.rule_4_desc": {
        "de": "Wir tolerieren keine beleidigende Sprache, Verleumdung, gezielte Belästigung oder diskriminierende Äußerungen. Inhalte, die gegen diese Regel verstoßen, werden sofort gelöscht.",
        "fr": "Nous ne tolérons pas le langage abusif, la diffamation, le harcèlement ciblé ou les remarques discriminatoires. Le contenu violant cette règle sera supprimé immédiatement.",
        "ru": "Мы не терпим оскорбительную лексику, клевету, целенаправленные преследования или дискриминационные высказывания. Контент, нарушающий это правило, будет немедленно удалён."
    },
    "moderation.dispute_title": {
        "de": "Widerspruchsverfahren für Anbieter",
        "fr": "Procédure de contestation par les fournisseurs",
        "ru": "Процедура оспаривания для поставщиков"
    },
    "moderation.dispute_desc": {
        "de": "KI-Entwickler und -Anbieter haben das Recht, jeden Vorfallbericht anzufechten, den sie für betrügerisch, ungenau oder bereits gelöst halten. Anbieter können sich im Anbieterportal anmelden, eine offizielle Antwort einreichen oder eine Moderationsprüfung durch unser Team beantragen. Anfechtungen werden innerhalb von 48 Stunden geprüft.",
        "fr": "Les développeurs et fournisseurs d'IA ont le droit de contester tout rapport d'incident qu'ils jugent frauduleux, inexact ou déjà résolu. Les fournisseurs peuvent se connecter au Portail Fournisseur. Une réponse officielle peut être soumise, ou une révision de modération être demandée. Les contestations sont examinées dans les 48 heures.",
        "ru": "Разработчики и поставщики ИИ имеют право оспаривать любой отчёт об инциденте, который они считают мошенническим, неточным или уже урегулированным. Поставщики могут войти в Портал поставщика, отправить официальный ответ или запросить проверку модерации у нашей команды. Оспаривания рассматриваются в течение 48 часов."
    },
}

for k, v in MOD.items():
    for lang, obj in [("de", de), ("fr", fr), ("ru", ru)]:
        try:
            setv(obj, k, v[lang])
        except Exception:
            pass

with open(MSGS / "de.json", "w", encoding="utf-8") as f:
    json.dump(de, f, indent=2, ensure_ascii=False)
with open(MSGS / "fr.json", "w", encoding="utf-8") as f:
    json.dump(fr, f, indent=2, ensure_ascii=False)
with open(MSGS / "ru.json", "w", encoding="utf-8") as f:
    json.dump(ru, f, indent=2, ensure_ascii=False)

print("Moderation translations applied to all 3 languages.")
print("Now checking remaining untranslated keys...")

# Find remaining English-only keys
en = json.load(open(MSGS / "en.json", encoding="utf-8"))

def flatten(obj, prefix=""):
    out = {}
    for k, v in obj.items():
        key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            out.update(flatten(v, key))
        else:
            out[key] = v
    return out

en_f = flatten(en)
de_f = flatten(de)
fr_f = flatten(fr)
ru_f = flatten(fr)

HOME_NS = ("hero", "feed", "moderation", "footer", "nav", "common", "app")
remaining = {"de": [], "fr": [], "ru": []}
for ns in HOME_NS:
    for k, v in en_f.items():
        if not k.startswith(ns + "."):
            continue
        if de_f.get(k) == v:
            remaining["de"].append(k)
        if fr_f.get(k) == v:
            remaining["fr"].append(k)
        if ru_f.get(k) == v:
            remaining["ru"].append(k)

for lang, keys in remaining.items():
    print(f"{lang}: {len(keys)} untranslated keys remaining")
    if keys and len(keys) < 20:
        for k in keys:
            print(f"  {k}: {en_f[k]}")