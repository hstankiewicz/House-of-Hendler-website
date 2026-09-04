const PRODUCTS = {
  pink: { name: "Palm Bunny Pink", unitAmount: 2800, needleMindersPerUnit: 1 },
  green: { name: "Palm Bunny Green", unitAmount: 2800, needleMindersPerUnit: 1 },
  blue: { name: "Palm Bunny Blue", unitAmount: 2800, needleMindersPerUnit: 1 },
  trio: { name: "The Palm Bunny Trio", unitAmount: 8000, needleMindersPerUnit: 3 },
};

const ALLOWED_CORS_ORIGINS = new Set([
  "https://houseofhendler.com",
  "https://www.houseofhendler.com",
]);

function applyCors(req, res) {
  const origin = String(req.headers.origin || "");
  if (!origin) return true;
  if (!ALLOWED_CORS_ORIGINS.has(origin)) return false;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
  return true;
}

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function originFromRequest(req) {
  if (process.env.VERCEL_ENV === "production") {
    return "https://houseofhendler.com";
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim() || "https";
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  return host ? `${proto}://${host}` : "https://houseofhendler.com";
}

function normalizeItems(rawItems) {
  const merged = new Map();
  (Array.isArray(rawItems) ? rawItems : []).forEach((item) => {
    const productId = String(item?.productId || "");
    const quantity = Number(item?.quantity);
    const product = PRODUCTS[productId];
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return;
    merged.set(productId, (merged.get(productId) || 0) + quantity);
  });
  return [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity, product: PRODUCTS[productId] }));
}

function shippingWeight(items) {
  const count = items.reduce((sum, item) => sum + item.quantity * item.product.needleMindersPerUnit, 0);
  if (count === 1) return { count, weightOz: 0.8 };
  if (count === 2) return { count, weightOz: 1.6 };
  if (count === 3) return { count, weightOz: 2.2 };
  return { count, weightOz: Math.round((2.2 + (count - 3) * 0.8) * 10) / 10 };
}

module.exports = async function handler(req, res) {
  const corsAllowed = applyCors(req, res);
  if (req.method === "OPTIONS") {
    if (!corsAllowed) return res.status(403).end();
    return res.status(204).end();
  }
  if (!corsAllowed) return json(res, 403, { error: "Origin not allowed" });
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const secret = String(process.env.STRIPE_SECRET_KEY || "").trim();
    if (!secret || !secret.startsWith("sk_")) {
      console.error("Stripe secret unavailable or invalid prefix", { present: Boolean(secret), prefix: secret.slice(0, 3) });
      return json(res, 500, { error: "Stripe checkout is not configured." });
    }

    const items = normalizeItems(req.body?.items);
    if (!items.length) return json(res, 400, { error: "Your cart is empty." });

    const { count, weightOz } = shippingWeight(items);
    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("ui_mode", "elements");
    params.set("return_url", `${originFromRequest(req)}/shop.html?order=success&session_id={CHECKOUT_SESSION_ID}`);
    params.set("permissions[update_shipping_details]", "server_only");
    params.set("shipping_address_collection[allowed_countries][0]", "US");
    params.set("automatic_tax[enabled]", "true");
    params.set("customer_creation", "always");
    params.set("metadata[sales_channel]", "retail_website_rebuild");
    params.set("metadata[needle_minder_count]", String(count));
    params.set("metadata[shipping_weight_oz]", String(weightOz));

    items.forEach((item, index) => {
      params.set(`line_items[${index}][quantity]`, String(item.quantity));
      params.set(`line_items[${index}][price_data][currency]`, "usd");
      params.set(`line_items[${index}][price_data][unit_amount]`, String(item.product.unitAmount));
      params.set(`line_items[${index}][price_data][product_data][name]`, item.product.name);
    });

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const session = await stripeResponse.json();
    if (!stripeResponse.ok || !session.client_secret || !session.id) {
      console.error("Stripe dynamic checkout error", session?.error?.message || session);
      return json(res, 500, { error: session?.error?.message || "Unable to start checkout." });
    }

    return json(res, 200, { clientSecret: session.client_secret, sessionId: session.id });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: "Unable to start checkout." });
  }
};
