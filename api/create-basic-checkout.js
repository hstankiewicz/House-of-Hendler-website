const PRODUCTS = {
  pink: { name: "Palm Bunny Pink", unitAmount: 2800 },
  green: { name: "Palm Bunny Green", unitAmount: 2800 },
  blue: { name: "Palm Bunny Blue", unitAmount: 2800 },
  trio: { name: "The Palm Bunny Trio", unitAmount: 8000 },
};

function originFromRequest(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret || !secret.startsWith("sk_")) {
      return res.status(500).json({ error: "Stripe checkout is not configured yet." });
    }

    const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
    const items = rawItems.map((item) => ({
      productId: String(item.productId || ""),
      quantity: Number(item.quantity),
    })).filter((item) => PRODUCTS[item.productId] && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99);

    if (!items.length) return res.status(400).json({ error: "Your cart is empty." });

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("success_url", `${originFromRequest(req)}/shop.html?order=success`);
    params.set("cancel_url", `${originFromRequest(req)}/cart.html`);
    params.set("shipping_address_collection[allowed_countries][0]", "US");
    params.set("billing_address_collection", "auto");
    params.set("allow_promotion_codes", "true");
    params.set("metadata[sales_channel]", "retail_website_rebuild");

    items.forEach((item, index) => {
      const p = PRODUCTS[item.productId];
      params.set(`line_items[${index}][quantity]`, String(item.quantity));
      params.set(`line_items[${index}][price_data][currency]`, "usd");
      params.set(`line_items[${index}][price_data][unit_amount]`, String(p.unitAmount));
      params.set(`line_items[${index}][price_data][product_data][name]`, p.name);
      params.set(`line_items[${index}][adjustable_quantity][enabled]`, "true");
      params.set(`line_items[${index}][adjustable_quantity][minimum]`, "1");
      params.set(`line_items[${index}][adjustable_quantity][maximum]`, "99");
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
    if (!stripeResponse.ok || !session.url) {
      console.error("Stripe checkout error", session?.error?.message || session);
      return res.status(500).json({ error: session?.error?.message || "Unable to start checkout." });
    }

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to start checkout." });
  }
};
