const fs = require("fs");
const path = require("path");

const enPath = path.join(__dirname, "messages", "en.json");
const trPath = path.join(__dirname, "messages", "tr.json");

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const tr = JSON.parse(fs.readFileSync(trPath, "utf8"));

if (!en.admin.appeals) {
  en.admin.appeals = {
    title: "Takedown Appeals",
    description: "Review and moderate takedown appeals submitted by users.",
    status_pending: "Pending",
    status_approved: "Approved",
    status_rejected: "Rejected",
    approve: "Approve",
    reject: "Reject",
    resolution_notes: "Resolution Notes",
    appellant: "Appellant",
    reason: "Reason",
    evidence: "Evidence",
    no_appeals: "No appeals found.",
    submit: "Submit",
    cancel: "Cancel",
    confirm_approve: "Are you sure you want to approve this appeal?",
    confirm_reject: "Are you sure you want to reject this appeal?",
  };
}

if (!tr.admin.appeals) {
  tr.admin.appeals = {
    title: "Kaldırma İtirazları",
    description: "Kullanıcılar tarafından gönderilen kaldırma itirazlarını inceleyin ve yönetin.",
    status_pending: "Bekliyor",
    status_approved: "Onaylandı",
    status_rejected: "Reddedildi",
    approve: "Onayla",
    reject: "Reddet",
    resolution_notes: "Çözüm Notları",
    appellant: "İtiraz Eden",
    reason: "Sebep",
    evidence: "Kanıt",
    no_appeals: "İtiraz bulunamadı.",
    submit: "Gönder",
    cancel: "İptal",
    confirm_approve: "Bu itirazı onaylamak istediğinize emin misiniz?",
    confirm_reject: "Bu itirazı reddetmek istediğinize emin misiniz?",
  };
}

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(trPath, JSON.stringify(tr, null, 2));
console.log("Translations updated.");
