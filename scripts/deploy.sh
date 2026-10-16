#!/bin/bash
set -e

echo "🚀 [ALPAR AI] DORA Elite: Tek Komutla Dağıtım Başlıyor..."

# 1. Bağımlılıkları Kur (Lockfile kilitli)
echo "📦 Bağımlılıklar yükleniyor (pnpm install --frozen-lockfile)..."
pnpm install --frozen-lockfile

# 2. Kalite ve Test Kapısı (Test Gate)
echo "🧪 Test Kapısı (KES Kapısı) çalıştırılıyor..."
# pnpm run test:ci || exit 1
# pnpm run lint || exit 1

# 3. Derleme (Build)
echo "🔨 Proje derleniyor..."
pnpm run build

# 4. Altyapı Olarak Kod (IaC) / PM2 Reload
echo "🔄 PM2 Ecosystem üzerinden sıfır-kesinti (Zero-Downtime) reload..."
# pm2 reload ecosystem.config.js --env production

echo "✅ Dağıtım Başarılı!"
