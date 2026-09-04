const PRODUCTS = {
  pink: { name: "Palm Bunny Pink", unitAmount: 2800, needleMindersPerUnit: 1 },
  green: { name: "Palm Bunny Green", unitAmount: 2800, needleMindersPerUnit: 1 },
  blue: { name: "Palm Bunny Blue", unitAmount: 2800, needleMindersPerUnit: 1 },
  trio: { name: "The Palm Bunny Trio", unitAmount: 8000, needleMindersPerUnit: 3 },
};

const MEASURED_PARCEL_WEIGHTS_OZ = { 1: 0.8, 3: 2.2 };

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function normalizeCart(body) {
  const requestedItems = Array.isArray(body.items) ? body.items : [];
  const merged = new Map();

  requestedItems.forEach((item) => {
    const productId = String(item?.productId || "").toLowerCase();
    const quantity = Number(item?.quantity ?? 1);
    const product = PRODUCTS[productId];
    if (!product) throw new Error("Unknown product.");
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error("Invalid product quantity.");
    merged.set(productId, (merged.get(productId) || 0) + quantity);
  });

  const items = [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity, product: PRODUCTS[productId] }));
  if (!items.length) throw new Error("Cart is empty.");
  return items;
}

function calculateWeight(items) {
  const needleMinderCount = items.reduce((total, item) => total + item.quantity * item.product.needleMindersPerUnit, 0);
  let weightOz;
  if (MEASURED_PARCEL_WEIGHTS_OZ[needleMinderCount]) weightOz = MEASURED_PARCEL_WEIGHTS_OZ[needleMinderCount];
  else if (needleMinderCount === 2) weightOz = 1.6;
  else if (needleMinderCount > 3) weightOz = Math.round((2.2 + (needleMinderCount - 3) * 0.8) * 10) / 10;
  else throw new Error("Cart is empty.");
  return { needleMinderCount, weightOz };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) throw new Error("Stripe checkout is not configured.");

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const items = normalizeCart(body);
    const { needleMinderCount, weightOz } = calculateWeight(items);

    const forwardedProto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
    const forwardedHost = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
    const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : "https://houseofhendler.com";

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("ui_mode", "elements");
    params.set("return_url", `${origin}/shop.html?order=success&session_id={CHECKOUT_SESSION_ID}`);
    params.set("permissions[update_shipping_details]", "server_only");
    params.set("shipping_address_collection[allowed_countries][0]", "US");
    params.set("automatic_tax[enabled]", "true");
    params.set("customer_creation", "always");
    params.set("metadata[sales_channel]", "retail_website");
    params.set("metadata[shipping_source]", "easypost_live_rate");
    params.set("metadata[needle_minder_count]", String(needleMinderCount));
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
    if (!stripeResponse.ok || !session.client_secret) {
      throw new Error(session.error?.message || "Unable to start checkout.");
    }

    return json(res, 200, { clientSecret: session.client_secret, sessionId: session.id });
  } catch (error) {
    console.error(error);
    const message = error?.message || "Unable to start checkout.";
    const clientError = ["Unknown product.", "Invalid product quantity.", "Cart is empty."].includes(message);
    return json(res, clientError ? 400 : 500, { error: clientError ? message : "Unable to start checkout." });
  }
}
