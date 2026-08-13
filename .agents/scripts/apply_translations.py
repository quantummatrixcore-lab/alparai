#!/usr/bin/env python3
"""Apply all remaining professional translations to DE/FR/RU JSON files."""
import json
from pathlib import Path

MSGS = Path("D:/Alparai/messages")

def load(name):
    with open(MSGS / name, "r", encoding="utf-8") as f:
        return json.load(f)

def set_nested(obj, key_str, value):
    parts = key_str.split(".")
    for p in parts[:-1]:
        obj = obj[p]
    obj[parts[-1]] = value

de = load("de.json")
fr = load("fr.json")
ru = load("ru.json")

# ============ HERO ============
HERO = {
"hero.trust_1_title":         {"de":"Open Source","fr":"Open Source","ru":"Открытый исходный код"},
"hero.trust_1_desc":          {"de":"Lizenziert unter AGPL-3.0. Jeder kann den Code prüfen, eine Instanz betreiben oder mitwirken.","fr":"Sous licence AGPL-3.0. N'importe qui peut auditer le code, exécuter une instance ou contribuer.","ru":"Лицензия AGPL-3.0. Любой может проверить код, запустить экземпляр или внести вклад."},
"hero.trust_2_title":         {"de":"EU-Datenhosting","fr":"Hébergement UE","ru":"Хостинг данных в ЕС"},
"hero.trust_2_desc":          {"de":"Alle Daten werden in der EU gespeichert (Supabase eu-west-1, Vercel fra1). DSGVO-konform von Grund auf.","fr":"Toutes les données stockées dans l'UE (Supabase eu-west-1, Vercel fra1). Conforme au RGPD dès la conception.","ru":"Все данные хранятся в ЕС (Supabase eu-west-1, Vercel fra1). В соответствии с GDPR по дизайну."},
"hero.trust_3_title":         {"de":"PII Guardian","fr":"Gardien des DCP","ru":"Защита персональных данных"},
"hero.trust_3_desc":          {"de":"Automatische Maskierung von E-Mails, Telefonnummern, Ausweisen und Kreditkarten, bevor die Daten die Datenbank erreichen.","fr":"Masquage automatique des e-mails, téléphones, identifiants et cartes bancaires avant que les données n'atteignent la base de données.","ru":"Автоматическая сокрытие электронной почты, телефонов, идентификаторов и банковских карт до того, как данные попадут в базу данных."},
"hero.trust_4_title":         {"de":"Vermittlung, nicht Herausgabe","fr":"Intermédiaire, pas éditeur","ru":"Посредник, не издатель"},
"hero.trust_4_desc":          {"de":"EU-E-Commerce-Richtlinie Art. 14 konform. Wir hosten. Nutzer besitzen ihre Inhalte.","fr":"Conforme à l'article 14 de la directive européenne sur le commerce électronique. Nous hébergeons. Les utilisateurs gardent leurs contenus.","ru":"Соответствие ст. 14 Правового акта ЕС о Электронным Торговлям. Мы размещаем. Пользователи владеют своим контентом."},
"hero.join_title":            {"de":"Vier Wege, zurückzuschlagen","fr":"Quatre façons de riposter","ru":"Четыре способа дать отпор"},
"hero.join_subtitle":         {"de":"Jede Rolle zählt. Wählen Sie Ihre.","fr":"Chaque rôle compte. Choisissez le vôtre.","ru":"Важна каждая роль. Выберите свою."},
"hero.join_cta_1":            {"de":"Sie waren dabei. Dokumentieren Sie es.","fr":"Vous étiez là. Documentez-le.","ru":"Вы были там. Зафиксируйте это."},
"hero.join_cta_1_desc":       {"de":"Laden Sie Beweise hoch, beschreiben Sie den Vorfall, wählen Sie Ihr Datenschutzniveau. Veröffentlichung innerhalb von 72 Stunden. Ihr Bericht wird Teil der verifizierten Fälle.","fr":"Téléversez des preuves, décrivez ce qui s'est passé, choisissez votre niveau de confidentialité. Publié sous 72 heures. Votre signalement rejoint les cas vérifiés.","ru":"Загрузите доказательства, опишите произошедшее, выберите уровень конфиденциальности. Публикация в течение 72 часов. Ваш отчёт присоединяется к проверенным случаям."},
"hero.join_cta_1_btn":        {"de":"In 60 Sekunden melden →","fr":"Signaler en 60 secondes →","ru":"Сообщить за 60 секунд →"},
"hero.join_cta_1_tag":        {"de":"Konto erforderlich — Identität geschützt","fr":"Compte requis — identité protégée","ru":"Требуется учётная запись — личность защиена"},
"hero.join_cta_2":            {"de":"Die ersten 100. Dauerhafte Anerkennung.","fr":"Les 100 premiers. Reconnaissance permanente.","ru":"Первые 100. Вечное признание."},
"hero.join_cta_2_desc":       {"de":"Die ersten 100 Reporter erhalten ein permanentes Gründungsreporter-Abzeichen auf ihrem Profil, Stimmrecht bei Plattformentscheidungen und alle Premium-Funktionen kostenlos — für immer. Begrenzte Plätze verbleiben.","fr":"Les 100 premiers reporters reçoivent un badge permanent de Reporter Fondateur sur leur profil, un droit de vote sur les décisions de la plateforme, et toutes les fonctionnalités premium gratuites — pour toujours. Places limitées.","ru":"Первые 100 репортеров получают постоянный значок Основателя репортера в профиле, право голоса по решениям платформы и все премиум-функции бесплатно — навсегда. Осталось мало мест."},
"hero.join_cta_2_btn":        {"de":"Sichern Sie sich Ihren Platz →","fr":"Réclamez votre place →","ru":"Займите своё место →"},
"hero.join_cta_2_tag":        {"de":"Schließt sobald voll","fr":"Ferme une fois complet","ru":"Закроется когда заполнится"},
"hero.join_cta_3":            {"de":"Forscher. Journalisten. Regulierungsbehörden.","fr":"Chercheurs. Journalistes. Régulateurs.","ru":"Исследователи. Журналисты. Регуляторы."},
"hero.join_cta_3_desc":       {"de":"Wir stellen anonymisierte Vorfall-Datensätze, API-Zugang und frühzeitige Benachrichtigungen über hochschwere Fälle bereit. Bereits im Dialog mit Forschungsinstitutionen.","fr":"Nous fournissons des jeux de toute anonymisés, une API, et des notifications anticipées des cas à haute sévérité. Institutions de recherches déjà en dialogue.","ru":"Мы предоставляем anonymизированные наборы данных об инцидентах, доступ к API и досрочные допуски уведомления о случаях высокой тяжести. Исследовательские учреждения уже в диалоге."},
"hero.join_cta_3_btn":        {"de":"Starten Sie ein Gespräch →","fr":"Lancez une conversation →","ru":"Начните разговор →"},
"hero.join_cta_3_tag":        {"de":"Institutioneller Zugang","fr":"Accès institutionnel","ru":"Институциональный доступ"},
"hero.join_cta_4":            {"de":"Wie wir entscheiden, was wahr ist","fr":"Comment nous décidons ce qui est vrai","ru":"Как мы решаем, что правда"},
"hero.join_cta_4_desc":       {"de":"Unser 5-Modell-Cross-Audit-Engine, Moderation-Standards und Wahrheits-Bewertungsmethodolgie sind vollständig dokumentiert und zur Überprüfung offen.","fr":"Notre jeu de moteur d'audit croisé à 5 modèles, normes de modération et méthodologie de notation de vérité sont entièrement documentés et ouverts à l'examen.","ru":"Наш двигатель кросс-аудита из 5 моделей, стандарты модерации и методология оценки истины полностью задокументированы и открыты для проверки."},
"hero.join_cta_4_btn":        {"de":"Lesen Sie die Methodik →","fr":"Lisez la méthodologie →","ru":"Читайте методологию →"},
"hero.join_cta_4_tag":        {"de":"Open Source","fr":"Open source","ru":"Открытый исходный код"},
"hero.closing_title":         {"de":"Der nächste KI-Vorfall könnte Sie betreffen.","fr":"Le prochain incident d'IA pourrait vous affecter.","ru":"Следующий инцидент ИИ может затронуть вас."},
"hero.closing_subtitle":      {"de":"Oder Ihre Eltern. Oder Ihren Arzt. Oder Ihren Richter. ALPAR AI ist die Plattform, auf der das reale Verhalten von KI dokumentiert, verifiziert und dauerhaft zugänglich gemacht wird. Denn KI-Systeme, die nie hinterfragt werden, werden nie besser.","fr":"Ou vos. Ou votre médecin. Ou votre juge. ALPAR AI est la plateforme où le comportement réel de l'IA est instructions, vérifié et rendu accessible en permanence. Parce que les systèmes d'IA jamais remis en question ne s'améliorent jamais.","ru":"Или вашего родителя. Или вашего врача. Или вашего судью. ALPAR AI — это платформа, где реальное поведение ИИ записано, проверено и сделано постоянно доступным. Потому что системы ИИ, которые никогда не подвергаются сомнению, никогда не становятся лучше."},
"hero.closing_good_news_title":{"de":"Jeder Bericht, den ALPAR AI aufnimmt, macht KI sicherer.","fr":"Chaque signalement qu'ALPAR AI enregistre rend l'IA plusan To safe.","ru":"Каждый отчёт, который записывает ALPAR AI, делает ИИ безопаснее."},
"hero.closing_good_news_body":{"de":"Wenn Vorfälle in das dauerhafte öffentliche Register, eingehen, verbessern KI-Unternehmen ihre Systeme. Wenn Anbieter offiziell antworten, erhält die Öffentlichkeit Antworten. Wenn Gerichte auf ALPAR-AI-Berichte verweisen, hat die Rechenschaftspflicht Beweise. Niemand steht der KI-Manipulation allein gegenüber. Jeder dokumentierte Fall ist Teil des ersten dauerhaften Registers, das sich weigerte, zuzulassen, dass KI im Stillen Schaden verursacht.","fr":"Lorsque les incidents intègrent le document publique permanent, les entreprises d'IA améliorent leurs systèmes. Quand les fournisseurs répondent officiellement, le reçoit des réponses. Quand les tribunaux citent les rapports d'ALPAR AI, la responsabilisation a des preuves. Personne ne fait face à la manipulation de l'IA seul. Chaque cas documenté fait partie du premier registre permanent qui a refusé de laisser l'IA causer des dommages en silence.","ru":"Когда инциденты попадают в страницу открытого реестра, компании ИИ улучшают свои системы. Когда провайдеры отвечают официально, общественность получает ответы. Когда суды ссылаются на отчёты ALPAR AI, подотчётность получает доказательства. Никто не сталкивается с манипуляцией ИИ в одиночку. Каждый задокументированный случай — часть первого постоянного реестра, который отказался позволить ИИ причинять вред в тишине."},
  "hero.closing_good_news_cta":  {"de":"Zum Register hinzufügen →","fr":"Ajouter au registre →","ru":"Добавить в реестр →"},
"hero.zero_tolerance":           {"de":"Null Toleranz. 100 % Transparenz.","fr":"Zéro tolérance. 100 % transparence.","ru":"Нулевая терпимость. 100 % прозрачность."},
}

FEED = {
"feed.feed_tab_for_you":      {"de":"Für dich","fr":"Pour vous","ru":"Для вас"},
"feed.feed_tab_latest":       {"de":"Neueste","fr":"Récent","ru":"Свежее"},
"feed.feed_tab_trending":     {"de":"Trend","fr":"Tendance","ru":"В тренде"},
"feed.feed_tab_following":    {"de":"Gefolgt","fr":"Suivis","ru":"Подписки"},
"feed.shareOnX":              {"de":"Auf X teilen","fr":"Partager sur X","ru":"Поделиться в X"},
"feed.shareOnLinkedIn":       {"de":"Auf LinkedIn teilen","fr":"Partager sur LinkedIn","ru":"Поделиться на LinkedIn"},
"feed.copyForInstagram":      {"de":"Für Instagram kopieren","fr":"Copiering pour Instagram","ru":"Копировать для Instagram"},
"feed.shareOnWhatsApp":       {"de":"Per WhatsApp teilen","fr":"Partager sur WhatsApp","ru":"Поделиться в WhatsApp"},
"feed.truthScore":            {"de":"Wahrheitswert","fr":"Score de vérité","ru":"Оценка правдивости"},
"feed.upvote":                {"de":"Hochwählen","fr":"Approuver","ru":"За"},
"feed.downvote":              {"de":"Runterwählen","fr":"Сontre","ru":"Против"},
}

FOOTER = {
"footer.links.submit_report": {"de":"Bericht einreichen","fr":"Soumettre un rapport","ru":"Написать отчёт"},
"footer.links.ai_act":      {"de":"KI-Gesetz-Tracker","fr":"Dispositif du Tracker de l'AI","ru":"Отслеживание Закона об ИИ"},
"footer.links.advisory_board":{"de":"Beirat","fr":"Conseil consultatif","ru":"Советник-консультативный совет"},
"footer.links.pricing":    {"de":"Прессцент","fr":"Tarification","ru":"Цены"},
"footer.links.security":     {"de":"Sicherheit","fr":"Sécurité","ru":"Безопасность"},
"footer.links.methodology":   {"de":"Methodik","fr":"Méthodologie","ru":"Методология"},
"footer.links.apidocs":     {"de":"API-Dokumentation","fr":"Documentation API","ru":"Документация API"},
"footer.links.privacy":       {"de":"Datenschutzerklärung","fr":"Politique de confidentialité","ru":"Политика конфиденциальности"},
"footer.links.terms":         {"de":"Nutzungsbedingungen","fr":"Conditions d'utilisation","ru":"Условия использования"},
"footer.links.cookies":       {"de":"Cookie-Richtlinie","fr":"Politique de cookies","ru":"Политика файлов cookie"},
"footer.links.dmca":          {"de":"DMCA-Richtlinie","fr":"Politique DMCA","ru":"Политика DMCA"},
"footer.links.moderation":    {"de":"Moderationsrichtlinie","fr":"Politique de modération","ru":"Политика модерации"},
"footer.rights":            {"de":"Alle Rechte vorbehalten.","fr":"Tous droits réservés.","ru":"Все права защищены."},
"footer.platformStatus":      {"de":"Intermediärplattform. Von Nutzern eingereichte Inhalte.","fr":"Plateforme intermédiaire. Contenu soumis par les utilisateurs.","ru":"Посредническая платформа. Контент, представленный пользователями."},
"footer.tagline":             {"de":"Wo die Welt KI zur Rechenschaft verpflichtet.","fr":"Où le monde tient l'IA responsable.","ru":"Где мир заставляет ИИ отвечать."},
"footer.sections.platform":    {"de":"Plattform","fr":"Plateforme","ru":"Платформа"},
"footer.sections.company":     {"de":"Unternehmen","fr":"Entreprise","ru":"Компания"},
"footer.sections.legal":       {"de":"Rechtliches","fr":"Juridique","ru":"Юридический"},
}

NAV = {
"nav.feed": {"de":"Feed","fr":"Feed","ru":"Лента"},
"nav.incidents": {"de":"Incidents","fr":"Инценденты","ru":"Инциденты"},
"nav.suggestions": {"de":"Vorschläge","fr":"Suggestions","ru":"Предложения"},
"nav.blog": {"de":"Blog","fr":"Blog","ru":"Blog"},
"nav.takedown": {"de":"Löschung","fr":"Suppression","ru":"Блокировка"},
"nav.contact": {"de":"Kontakt","fr":"Confident","ru":"Контакты"},
"nav.dashboard": {"de":"Dashboard","fr":"Kontakt","ru":"Панель"},
"nav.experts": {"de":"Experten","fr":"Ribó","ru":"Эксперты"},
}

COMMON = {
"common.github": {"de":"GitHub","fr":"GitHub","ru":"GitHub"},
"common.linkedin": {"de":"LinkedIn","fr":"LinkedIn","ru":"LinkedIn"},
"common.live": {"de":"Live","fr":"En direct","ru":"Live"},
"common.optional": {"de":"Optional","fr":"Facultatif","ru":"Необязательно"},
"common.details": {"de":"Details","fr":"Détails","ru":"Детали"},
"common.aiResponseDesc": {"de":"Die offizielle Antwort des KI-Anbieters zu diesem Vorfall.","fr":"La réponse officielle du fournisseur d'IA pour cet incident.","ru":"Официальный ответ поставщика ИИ на этот инцидент."},
"common.allSet": {"de":"Alle eindecken акцепол","fr":"Tous les consentements acceptés","ru":"Все согласия приняты"},
"common.tr": {"de":"Türkisch","fr":"Turc","ru":"Турецкий"},
"common.en": {"de":"Englisch","fr":"Anglais","ru":"Английский"},
"common.switchToEnglish": {"de":"EN","fr":"EN","ru":"EN"},
"common.switchToTurkish": {"de":"TR","fr":"TR","ru":"TR"},
"common.skipToContent": {"de":"Zum Hauptinhalt springen","fr":"","ru":"К основному содержанию"},
"common.unknown": {"de":"Unbekannt","fr":"Inconnu","ru":"Неизвестно"},
"common.unknown_provider": {"de":"Unbekannter Anbieter","fr":"Poursistre inconnu","ru":"Неизвестный поставщик"},
"common.unknown_error": {"de":"Unbekannter Fehler","fr":"Erreur inconnue","ru":"Неизвестная ошибка"},
"common.secureAndAnonymous": {"de":"SICHER & PRIVAT","fr":"SÉCURISÉ & PRIVÉ","ru":"БЕЗОПАСНО & КОНФИДЕНЦИАЛЬНО"},
"common.monitor": {"de":"ALPAR AI • MONITOR","fr":"ALPAR AI • MONITEUR","ru":"ALPAR AI • МОНИТОР"},
"common.alparAi": {"de":"ALPAR AI","fr":"ALPAR AI","ru":"ALPAR AI"},
"common.cookiePreferences": {"de":"Cookie-Einstellungen","fr":"Préférences de cookies","ru":"Настройки cookie"},
"common.select": {"de":"Auswählen","fr":"Sélectionner","ru":"Выбрать"},
"common.machine_translated": {"de":"Maschinenübersetzung","fr":"Traduction automatique","ru":"Машинный перевод"},
}

# === Apply all ===
ALL = {}
for ns in [HERO, FEED, FOOTER, NAV, COMMON]:
    ALL.update(ns)

count = {"de":0,"fr":0,"ru":0}
for k, v in ALL.items():
    for lang, file_obj in [("de",de), ("fr",fr), ("ru",ru)]:
        try:
            set_nested(file_obj, k, v[lang])
            count[lang] += 1
        except Exception:
            pass

import json as j
for lang, name in [("de","de.json"), ("fr","fr.json"), ("ru","ru.json")]:
    with open(MSGS / name, "w", encoding="utf-8") as f:
        j.dump(dict(**globals()[lang]), f, indent=2, ensure_ascii=False,
               sort_keys=False)

print(f"Total keys translated: DE={count['de']}, FR={count['fr']}, RU={count['ru']}")