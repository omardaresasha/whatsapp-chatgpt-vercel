export default async function handler(req, res) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.6";
  const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v23.0";

  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }

    return res.status(403).send("Forbidden");
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const body = req.body;

    if (body?.object !== "whatsapp_business_account") {
      return res.status(200).json({ ok: true });
    }

    const value = body.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message || message.type !== "text") {
      return res.status(200).json({ ok: true });
    }

    const from = message.from;
    const userText = message.text?.body?.trim();

    if (!from || !userText) {
      return res.status(200).json({ ok: true });
    }

    // قراءة الرسالة
    await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          status: "read",
          message_id: message.id
        })
      }
    );

    // إرسال الرسالة إلى ChatGPT
    const ai = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: [
          {
            role: "system",
            content:
              "أنت مساعد ذكي على واتساب. تحدث بالعربية السعودية والخليجية بشكل طبيعي وودود ومختصر. أجب مباشرة وبوضوح."
          },
          {
            role: "user",
            content: userText
          }
        ]
      })
    });

    const aiData = await ai.json();

    if (!ai.ok) {
      console.error("OpenAI Error:", aiData);
      throw new Error("OpenAI API error");
    }

    const reply =
      aiData.output_text ||
      "ما قدرت أطلع رد حالياً، حاول مرة ثانية.";

    // إرسال الرد إلى واتساب
    const whatsapp = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: from,
          type: "text",
          text: {
            preview_url: false,
            body: reply.slice(0, 4096)
          }
        })
      }
    );

    if (!whatsapp.ok) {
      console.error("WhatsApp Error:", await whatsapp.text());
    }

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(200).json({ ok: true });
  }
}
