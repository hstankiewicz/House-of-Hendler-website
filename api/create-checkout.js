const BUNNY_WEIGHT_OZ = 0.8;

const PRODUCTS = {
  pink: { name: "Palm Bunny Pink", unitAmount: 2800, needleMindersPerUnit: 1 },
  green: { name: "Palm Bunny Green", unitAmount: 2800, needleMindersPerUnit: 1 },
  blue: { name: "Palm Bunny Blue", unitAmount: 2800, needleMindersPerUnit: 1 },
  trio: { name: "The Palm Bunny Trio", unitAmount: 8000, needleMindersPerUnit: 3 },
};

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function normalizeCart(body) {
  const requestedItems = Array.isArray(body.items)
    ? body.items
    : [{ productId: body.productId, quantity: body.quantity ?? 1 }];

  const items = requestedItems.map((item) => {
    const productId = String(item?.productId || "").toLowerCase();
    const quantity = Number(item?.quantity ?? 1);
    const product = PRODUCTS[productId];

    if (!product) throw new Error("Unknown product.");
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error("Invalid product quantity.");
    }

    return { productId, quantity, product };
  });

  if (!items.length) throw new Error("Cart is empty.");
  return items;
}

function calculateParcelWeightOz(items) {
  const needleMinderCount = items.reduce(
    (total, item) => total + item.quantity * item.product.needleMindersPerUnit,
    0
  );

  const weightOz = Math.round(needleMinderCount * BUNNY_WEIGHT_OZ * 10) / 10;
  return { needleMinderCount, weightOz };
}

async function getGroundAdvantageRate(zip, weightOz) {
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
          weight: weightOz,
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

async function createStripeCheckout(items, shipping, origin, needleMinderCount, weightOz) {
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

  items.forEach((item, index) => {
    params.set(`line_items[${index}][quantity]`, String(item.quantity));
    params.set(`line_items[${index}][price_data][currency]`, "usd");
    params.set(`line_items[${index}][price_data][unit_amount]`, String(item.product.unitAmount));
    params.set(`line_items[${index}][price_data][product_data][name]`, item.product.name);
  });

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

  params.set("metadata[sales_channel]", "retail_website");
  params.set("metadata[shipping_source]", "easypost_live_rate");
  params.set("metadata[needle_minder_count]", String(needleMinderCount));
  params.set("metadata[shipping_weight_oz]", String(weightOz));

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
    const zip = String(body.zip || "").trim();

    if (!/^\d{5}(-\d{4})?$/.test(zip)) {
      return json(res, 400, { error: "Please enter a valid U.S. ZIP code." });
    }

    const items = normalizeCart(body);
    const { needleMinderCount, weightOz } = calculateParcelWeightOz(items);

    const forwardedProto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
    const forwardedHost = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
    const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : "https://houseofhendler.com";

    const shipping = await getGroundAdvantageRate(zip, weightOz);
    const checkoutUrl = await createStripeCheckout(items, shipping, origin, needleMinderCount, weightOz);
    return json(res, 200, {
      url: checkoutUrl,
      shipping: {
        amount: shipping.amountCents / 100,
        service: shipping.displayName,
        weightOz,
        needleMinderCount,
      },
    });
  } catch (error) {
    console.error(error);
    const message = error?.message || "We couldn't calculate shipping right now. Please try again.";
    const clientError = ["Unknown product.", "Invalid product quantity.", "Cart is empty."].includes(message);
    return json(res, clientError ? 400 : 500, {
      error: clientError ? message : "We couldn't calculate shipping right now. Please try again.",
    });
  }
}
