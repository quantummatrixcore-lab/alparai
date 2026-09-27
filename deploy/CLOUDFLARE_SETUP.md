# Cloudflare Pages Kurulum Rehberi

## 1. Gerekli GitHub Secrets
GitHub repository'sindeki `Settings > Secrets and variables > Actions` sayfasına gidin ve aşağıdaki değişkenleri ekleyin:
- `CLOUDFLARE_API_TOKEN`: Cloudflare panosundan (My Profile > API Tokens) "Edit Cloudflare Workers" yetkisi ile oluşturulmuş API anahtarı.
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare Dashboard sağ alt köşesinde veya URL içerisinde bulunan Account ID değeri.

## 2. CI/CD Deploy Süreci
- `wrangler.toml` ve `.github/workflows/deploy.yml` konfigürasyonları otomatik deploy için yapılandırılmıştır.
- Kodlar `master` veya `main` branch'ine push edildiğinde GitHub Actions çalışır ve Cloudflare Pages'a otomatik deploy gerçekleştirilir.

## 3. Custom Domain Bağlama (alparai.com)
1. Cloudflare Dashboard'a giriş yapın.
2. Sol menüden "Workers & Pages" sekmesini açın ve **alparai** projenizi seçin.
3. Proje detaylarında **Custom Domains** bölümüne tıklayın.
4. "Set up a custom domain" butonuna basarak `alparai.com` alan adınızı girin.
5. Gerekli DNS CNAME kayıtları Cloudflare tarafından otomatik olarak yapılandırılacaktır. Devam ederek işlemi onaylayın.
