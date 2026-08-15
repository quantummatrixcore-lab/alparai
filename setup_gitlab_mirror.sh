#!/bin/bash
# setup_gitlab_mirror.sh
if [ -z "$GITLAB_URL" ] || [ -z "$GITLAB_TOKEN" ] || [ -z "$GITLAB_USER" ]; then
    echo "[-] Hata: GITLAB_URL, GITLAB_USER ve GITLAB_TOKEN eksik."
    exit 1
fi

REPO_DIR="D:/01_SaaS_Products/Alparai"
cd "$REPO_DIR" || exit 1

if git remote get-url gitlab-mirror >/dev/null 2>&1; then
    echo "[*] GitLab mirror mevcut. Güncelleniyor..."
    git remote set-url gitlab-mirror "https://${GITLAB_USER}:${GITLAB_TOKEN}@${GITLAB_URL}"
else
    echo "[*] GitLab mirror remote ekleniyor..."
    git remote add --mirror=push gitlab-mirror "https://${GITLAB_USER}:${GITLAB_TOKEN}@${GITLAB_URL}"
fi

echo "[*] Mirroring işlemi başlatılıyor..."
git push gitlab-mirror --all
git push gitlab-mirror --tags

echo "[+] GitLab Mirroring başarıyla ayarlandı ve senkronize edildi."
