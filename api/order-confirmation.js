const ALLOWED_CORS_ORIGINS = new Set([
  "https://houseofhendler.com",
  "https://www.houseofhendler.com",
]);

function applyCors(req, res) {
  const origin = String(req.headers.origin || "");
  if (!origin) return true;
  if (!ALLOWED_CORS_ORIGINS.has(origin)) return false;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
  return true;
}

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function ensureReceiptEmail(secret, session) {
  const paymentIntentId = String(session.payment_intent || "");
  const email = String(session.customer_details?.email || session.customer_email || "").trim();
  if (!paymentIntentId.startsWith("pi_") || !email) return { configured: false, email: "" };

  try {
    const piResponse = await fetch(`https://api.stripe.com/v1/payment_intents/${encodeURIComponent(paymentIntentId)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const paymentIntent = await piResponse.json();
    if (!piResponse.ok) throw new Error(paymentIntent?.error?.message || "Unable to read PaymentIntent");

    if (String(paymentIntent.receipt_email || "").toLowerCase() === email.toLowerCase()) {
      return { configured: true, email };
    }

    const params = new URLSearchParams();
    params.set("receipt_email", email);
    const updateResponse = await fetch(`https://api.stripe.com/v1/payment_intents/${encodeURIComponent(paymentIntentId)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    const updated = await updateResponse.json();
    if (!updateResponse.ok) throw new Error(updated?.error?.message || "Unable to set receipt email");

    return { configured: String(updated.receipt_email || "").toLowerCase() === email.toLowerCase(), email };
  } catch (error) {
    console.error("receipt email setup error", error?.message || error);
    return { configured: false, email };
  }
}

module.exports = async function handler(req, res) {
  const corsAllowed = applyCors(req, res);
  if (req.method === "OPTIONS") {
    if (!corsAllowed) return res.status(403).end();
    return res.status(204).end();
  }
  if (!corsAllowed) return json(res, 403, { error: "Origin not allowed" });
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const secret = String(process.env.STRIPE_SECRET_KEY || "").trim();
    if (!secret || !secret.startsWith("sk_")) return json(res, 500, { error: "Order confirmation is unavailable." });

    const sessionId = String(req.query?.session_id || "").trim();
    if (!sessionId.startsWith("cs_")) return json(res, 400, { error: "Invalid confirmation number." });

    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const session = await response.json();
    if (!response.ok) return json(res, 404, { error: "We couldn't find this order." });

    const fallbackReference = `HOH-${sessionId.slice(-8).replace(/[^a-z0-9]/gi, "").toUpperCase()}`;
    const orderReference = session.metadata?.order_reference || fallbackReference;
    const paid = session.payment_status === "paid" || session.status === "complete";
    const receipt = paid ? await ensureReceiptEmail(secret, session) : { configured: false, email: "" };

    return json(res, 200, {
      paid,
      orderReference,
      amountTotal: Number(session.amount_total || 0),
      currency: String(session.currency || "usd").toUpperCase(),
      receiptConfigured: Boolean(receipt.configured),
      receiptEmail: receipt.email,
    });
  } catch (error) {
    console.error("order confirmation error", error?.message || error);
    return json(res, 500, { error: "We couldn't load your confirmation yet." });
  }
};
