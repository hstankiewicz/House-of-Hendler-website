function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function stripeRequest(path, options = {}) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("Stripe checkout is not configured.");
  const response = await fetch(`https://api.stripe.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secret}`,
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Stripe request failed.");
  return data;
}

async function getEasyPostRate(shippingDetails, weightOz) {
  const apiKey = process.env.EASYPOST_API_KEY;
  const fromZip = process.env.SHIP_FROM_ZIP;
  if (!apiKey || !fromZip) throw new Error("Shipping service is not configured.");

  const address = shippingDetails?.address || {};
  if (String(address.country || "US").toUpperCase() !== "US") throw new Error("We currently ship within the United States only.");
  if (!address.postal_code) throw new Error("Please enter a complete shipping address.");

  const auth = Buffer.from(`${apiKey}:`).toString("base64");
  const response = await fetch("https://api.easypost.com/v2/shipments", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      shipment: {
        from_address: { country: "US", zip: fromZip },
        to_address: {
          name: shippingDetails?.name || undefined,
          street1: address.line1 || undefined,
          street2: address.line2 || undefined,
          city: address.city || undefined,
          state: address.state || undefined,
          zip: address.postal_code,
          country: "US",
        },
        parcel: { length: 7, width: 5, height: 1, weight: weightOz },
      },
    }),
  });

  const shipment = await response.json();
  if (!response.ok) throw new Error(shipment?.error?.message || "Unable to calculate shipping.");

  const uspsRates = (shipment.rates || []).filter((rate) => String(rate.carrier || "").toUpperCase() === "USPS");
  if (!uspsRates.length) throw new Error("No USPS shipping rate is available for this address.");

  const ground = uspsRates.find((rate) => String(rate.service || "").toLowerCase().replace(/[^a-z]/g, "").includes("groundadvantage"));
  const selected = ground || [...uspsRates].sort((a, b) => Number(a.rate) - Number(b.rate))[0];
  const amountCents = Math.round(Number(selected.rate) * 100);
  if (!Number.isFinite(amountCents) || amountCents <= 0) throw new Error("The shipping rate returned was invalid.");

  return {
    amountCents,
    displayName: selected.service === "GroundAdvantage" ? "USPS Ground Advantage" : `USPS ${selected.service}`,
    estimatedDays: selected.delivery_days || selected.est_delivery_days || null,
  };
}

function setShippingDetails(params, shippingDetails) {
  const address = shippingDetails.address || {};
  if (shippingDetails.name) params.set("collected_information[shipping_details][name]", shippingDetails.name);
  if (address.line1) params.set("collected_information[shipping_details][address][line1]", address.line1);
  if (address.line2) params.set("collected_information[shipping_details][address][line2]", address.line2);
  if (address.city) params.set("collected_information[shipping_details][address][city]", address.city);
  if (address.state) params.set("collected_information[shipping_details][address][state]", address.state);
  if (address.postal_code) params.set("collected_information[shipping_details][address][postal_code]", address.postal_code);
  params.set("collected_information[shipping_details][address][country]", "US");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { type: "error", message: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const sessionId = String(body.checkout_session_id || "");
    const shippingDetails = body.shipping_details;
    if (!sessionId || !shippingDetails?.address) return json(res, 400, { type: "error", message: "Please enter a complete shipping address." });

    const session = await stripeRequest(`/v1/checkout/sessions/${encodeURIComponent(sessionId)}`);
    const weightOz = Number(session.metadata?.shipping_weight_oz);
    if (!Number.isFinite(weightOz) || weightOz <= 0) throw new Error("Shipping weight is missing from checkout.");

    const shipping = await getEasyPostRate(shippingDetails, weightOz);
    const params = new URLSearchParams();
    setShippingDetails(params, shippingDetails);
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

    await stripeRequest(`/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    return json(res, 200, {
      type: "object",
      value: { succeeded: true },
      shipping: { amount: shipping.amountCents / 100, service: shipping.displayName, weightOz },
    });
  } catch (error) {
    console.error(error);
    return json(res, 500, { type: "error", message: error?.message || "We couldn't calculate shipping. Please try again." });
  }
}
