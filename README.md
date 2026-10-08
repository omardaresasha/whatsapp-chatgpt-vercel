# WhatsApp + ChatGPT — Vercel

## الملفات
- `api/webhook.js` — Webhook الخاص بواتساب.
- `package.json`

## متغيرات Vercel
أضف هذه القيم في Project → Settings → Environment Variables:

- `VERIFY_TOKEN` = نفس الكلمة التي تضعها في Meta Webhooks.
- `WHATSAPP_TOKEN` = WhatsApp Cloud API access token.
- `PHONE_NUMBER_ID` = رقم تعريف رقم واتساب من Meta.
- `OPENAI_API_KEY` = مفتاح OpenAI API.
- `OPENAI_MODEL` = نموذج API مدعوم بحسابك، ويمكن تركه `gpt-5.6` إذا كان متاحاً لك.
- `META_GRAPH_VERSION` = إصدار Meta Graph API المستخدم في حسابك، ويمكن تركه `v23.0` إذا كان مقبولاً.

## Webhook في Meta
Callback URL:
`https://YOUR-DOMAIN.vercel.app/api/webhook`

Verify Token:
نفس قيمة `VERIFY_TOKEN`.

بعد النشر، اضغط Verify and Save في Meta.

## ملاحظة
اشتراك ChatGPT لا يعني أن OpenAI API مجاني؛ استخدام API قد يحتاج رصيد/فوترة منفصلة.
