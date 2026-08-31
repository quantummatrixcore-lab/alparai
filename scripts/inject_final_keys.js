import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enPath = path.join(__dirname, '..', 'messages', 'en.json');
const trPath = path.join(__dirname, '..', 'messages', 'tr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const tr = JSON.parse(fs.readFileSync(trPath, 'utf8'));

const enAdditions = {
  "about": {
    "advisoryBoardTitle": "Advisory Board",
    "advisoryBoardSubtitle": "Independent experts guiding AlparAI's ethical AI accountability mission",
    "advisoryBoardEmpty": "Advisory board members will be announced soon",
    "advisoryBoardJoinCTA": "Join Advisory Board"
  },
  "suggestions": {
    "signInToSuggest": "Sign in to suggest",
    "newSuggestion": "New Suggestion",
    "shareIdea": "Share your idea",
    "meta_title": "Suggestions | AlparAI",
    "pageTitle": "Community Suggestions",
    "anon": "Anonymous",
    "back_to_suggestions": "Back to Suggestions",
    "by": "by"
  },
  "transparency": {
    "obligation_header": "Obligation",
    "status_header": "Status",
    "verified_header": "Verified",
    "empty_state_title": "No compliance records found",
    "empty_state_subtitle": "Compliance data will appear here"
  }
};

const trAdditions = {
  "about": {
    "advisoryBoardTitle": "Danışma Kurulu",
    "advisoryBoardSubtitle": "AlparAI'nın etik yapay zeka hesap verebilirlik misyonuna rehberlik eden bağımsız uzmanlar",
    "advisoryBoardEmpty": "Danışma kurulu üyeleri yakında duyurulacak",
    "advisoryBoardJoinCTA": "Danışma Kuruluna Katıl"
  },
  "suggestions": {
    "signInToSuggest": "Öneri sunmak için giriş yapın",
    "newSuggestion": "Yeni Öneri",
    "shareIdea": "Fikrinizi paylaşın",
    "meta_title": "Öneriler | AlparAI",
    "pageTitle": "Topluluk Önerileri",
    "anon": "Anonim",
    "back_to_suggestions": "Önerilere Dön",
    "by": "tarafından"
  },
  "transparency": {
    "obligation_header": "Yükümlülük",
    "status_header": "Durum",
    "verified_header": "Doğrulandı",
    "empty_state_title": "Uyum kaydı bulunamadı",
    "empty_state_subtitle": "Uyum verileri burada görünecek"
  }
};

function deepMergeWithTracking(target, source, prefix = '', addedKeys = []) {
  for (const key of Object.keys(source)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      deepMergeWithTracking(target[key], source[key], currentPath, addedKeys);
    } else {
      if (target[key] === undefined) {
        target[key] = source[key];
        addedKeys.push(currentPath);
      }
    }
  }
  return addedKeys;
}

const enAdded = [];
const trAdded = [];

deepMergeWithTracking(en, enAdditions, 'en', enAdded);
deepMergeWithTracking(tr, trAdditions, 'tr', trAdded);

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n', 'utf8');
fs.writeFileSync(trPath, JSON.stringify(tr, null, 2) + '\n', 'utf8');

console.log(JSON.stringify({
  enAdded,
  trAdded,
  totalAdded: enAdded.length + trAdded.length
}, null, 2));
