# Lemon Squeezy Setup

## API Key Alma Adımları
1. Lemon Squeezy Dashboard'a giriş yapın.
2. Settings > API bölümüne gidin.
3. Yeni bir API key oluşturun ve kopyalayın.
4. Projenizdeki `.env` dosyasına `LEMON_SQUEEZY_API_KEY` olarak ekleyin.

## Webhook URL
https://[domain]/api/webhooks/lemon-squeezy

## Events
- `order_created`
- `subscription_created`

## Test Komutu
```bash
curl -X POST https://[domain]/api/webhooks/lemon-squeezy \
  -H "Content-Type: application/json" \
  -H "x-signature: <signature>" \
  -d '{"meta": {"event_name": "order_created"}, "data": {"id": "123", "attributes": {"total": 9900, "user_email": "test@example.com"}}}'
```
