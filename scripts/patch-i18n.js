const fs = require("fs");

const dePatch = {
  badge: {
    severity: {
      low: "Niedrig",
      medium: "Mittel",
      high: "Hoch",
      critical: "Kritisch",
    },
    status: {
      pending_review: "Ausstehende Überprüfung",
      published: "Veröffentlicht",
      rejected: "Abgelehnt",
      archived: "Archiviert",
      takedown: "Entfernt",
    },
  },
  takedown: {
    reasons: {
      defamation: "Verleumdung / Rufmord",
      copyright: "Urheberrechtsverletzung",
      privacy: "Offenlegung personenbezogener Daten",
      factual_error: "Faktischer Fehler",
      legal_court_order: "Gerichtsbeschluss",
      other: "Sonstiges (in Details erläutern)",
    },
  },
};

const frPatch = {
  badge: {
    severity: {
      low: "Faible",
      medium: "Moyen",
      high: "Élevé",
      critical: "Critique",
    },
    status: {
      pending_review: "En attente d'examen",
      published: "Publié",
      rejected: "Rejeté",
      archived: "Archivé",
      takedown: "Retiré",
    },
  },
  takedown: {
    reasons: {
      defamation: "Diffamation",
      copyright: "Violation des droits d'auteur",
      privacy: "Divulgation de données personnelles",
      factual_error: "Erreur factuelle",
      legal_court_order: "Ordonnance du tribunal",
      other: "Autre (expliquer en détail)",
    },
  },
};

const ruPatch = {
  badge: {
    severity: {
      low: "Низкий",
      medium: "Средний",
      high: "Высокий",
      critical: "Критический",
    },
    status: {
      pending_review: "Ожидает проверки",
      published: "Опубликовано",
      rejected: "Отклонено",
      archived: "В архиве",
      takedown: "Удалено",
    },
  },
  takedown: {
    reasons: {
      defamation: "Клевета",
      copyright: "Нарушение авторских прав",
      privacy: "Раскрытие личных данных",
      factual_error: "Фактическая ошибка",
      legal_court_order: "Постановление суда",
      other: "Другое (укажите в подробностях)",
    },
  },
};

const langs = [
  { file: "messages/de.json", patch: dePatch },
  { file: "messages/fr.json", patch: frPatch },
  { file: "messages/ru.json", patch: ruPatch },
];

for (const lang of langs) {
  let content = JSON.parse(fs.readFileSync(lang.file, "utf8"));
  content.badge = { ...content.badge, ...lang.patch.badge };
  content.takedown = { ...content.takedown, ...lang.patch.takedown };
  fs.writeFileSync(lang.file, JSON.stringify(content, null, 2) + "\n");
}
console.log("Patched badge and takedown in DE, FR, RU");
