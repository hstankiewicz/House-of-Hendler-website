const PRODUCTS = {
  pink: { name: "Palm Bunny Pink", unitAmount: 2800, weightOz: 0.8 },
  green: { name: "Palm Bunny Green", unitAmount: 2800, weightOz: 0.8 },
  blue: { name: "Palm Bunny Blue", unitAmount: 2800, weightOz: 0.8 },
  trio: { name: "The Palm Bunny Trio", unitAmount: 8000, weightOz: 2.2 },
};

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function getGroundAdvantageRate(zip, product) {
  const apiKey = process.env.EASYPOST_API_KEY;
  const fromZip = process.env.SHIP_FROM_ZIP;
  if (!apiKey || !fromZip) throw new Error("Shipping service is not configured.");

  const auth = Buffer.from(`${apiKey}:`).toString("base64");
  const shipmentResponse = await fetch("https://api.easypost.com/v2/shipments", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      shipment: {
        from_address: { country: "US", zip: fromZip },
        to_address: { country: "US", zip },
        parcel: {
          length: 7,
          width: 5,
          height: 1,
          weight: product.weightOz,
        },
      },
    }),
  });

  const shipment = await shipmentResponse.json();
  if (!shipmentResponse.ok) {
    const details = shipment?.error?.message || JSON.stringify(shipment);
    throw new Error(`Unable to calculate shipping: ${details}`);
  }

  const uspsRates = (shipment.rates || []).filter(
    (rate) => String(rate.carrier || "").toUpperCase() === "USPS"
  );
  if (!uspsRates.length) throw new Error("No USPS rate is available for that ZIP code.");

  const ground = uspsRates.find((rate) => {
    const service = String(rate.service || "").toLowerCase().replace(/[^a-z]/g, "");
    return service.includes("groundadvantage");
  });

  const selected = ground || [...uspsRates].sort((a, b) => Number(a.rate) - Number(b.rate))[0];
  const amountCents = Math.round(Number(selected.rate) * 100);
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    throw new Error("The shipping rate returned was invalid.");
  }

  return {
    amountCents,
    displayName: selected.service === "GroundAdvantage" ? "USPS Ground Advantage" : `USPS ${selected.service}`,
    estimatedDays: selected.delivery_days || selected.est_delivery_days || null,
  };
}

async function createStripeCheckout(productId, product, shipping, origin) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("Stripe checkout is not configured.");

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${origin}/shop.html?order=success`);
  params.set("cancel_url", `${origin}/shop.html`);
  params.set("billing_address_collection", "required");
  params.set("shipping_address_collection[allowed_countries][0]", "US");
  params.set("automatic_tax[enabled]", "true");
  params.set("customer_creation", "always");

  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][unit_amount]", String(product.unitAmount));
  params.set("line_items[0][price_data][product_data][name]", product.name);

  params.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
  params.set("shipping_options[0][shipping_rate_data][display_name]", shipping.displayName);
  params.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(shipping.amountCents));
  params.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "usd");
  if (shipping.estimatedDays) {
    params.set("shipping_options[0][shipping_rate_data][delivery_estimate][minimum][unit]", "business_day");
    params.set("shipping_options[0][shipping_rate_data][delivery_estimate][minimum][value]", String(Math.max(1, shipping.estimatedDays - 1)));
    params.set("shipping_options[0][shipping_rate_data][delivery_estimate][maximum][unit]", "business_day");
    params.set("shipping_options[0][shipping_rate_data][delivery_estimate][maximum][value]", String(shipping.estimatedDays + 1));
  }

  params.set("metadata[product_id]", productId);
  params.set("metadata[sales_channel]", "retail_website");
  params.set("metadata[shipping_source]", "easypost_live_rate");

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
    throw new Error(session.error?.message || "Unable to start checkout.");
  }
  return session.url;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const productId = String(body.productId || "").toLowerCase();
    const zip = String(body.zip || "").trim();
    const product = PRODUCTS[productId];

    if (!product) return json(res, 400, { error: "Unknown product." });
    if (!/^\d{5}(-\d{4})?$/.test(zip)) {
      return json(res, 400, { error: "Please enter a valid U.S. ZIP code." });
    }

    const forwardedProto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
    const forwardedHost = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
    const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : "https://houseofhendler.com";

    const shipping = await getGroundAdvantageRate(zip, product);
    const checkoutUrl = await createStripeCheckout(productId, product, shipping, origin);
    return json(res, 200, {
      url: checkoutUrl,
      shipping: {
        amount: shipping.amountCents / 100,
        service: shipping.displayName,
      },
    });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: "We couldn't calculate shipping right now. Please try again." });
  }
}
