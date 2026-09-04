/* Safe diagnostic endpoint for Preview testing.
   Reports ONLY whether each required env var is present, and (for STRIPE_SECRET_KEY)
   whether its prefix looks like a real Stripe secret key. Never returns key values. */

function prefixLooksLikeStripeSecret(value) {
  const v = String(value || "").trim();
  if (v.startsWith("sk_test_") || v.startsWith("sk_live_")) return "sk_test_ or sk_live_ (correct)";
  if (!v) return "missing";
  return `unexpected prefix "${v.slice(0, 3)}..." — this is not a valid Stripe secret key`;
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const easypostKey = process.env.EASYPOST_API_KEY;
  const shipFromZip = process.env.SHIP_FROM_ZIP;

  const report = {
    STRIPE_SECRET_KEY: {
      present: Boolean(stripeSecret && String(stripeSecret).trim()),
      check: prefixLooksLikeStripeSecret(stripeSecret),
    },
    EASYPOST_API_KEY: {
      present: Boolean(easypostKey && String(easypostKey).trim()),
    },
    SHIP_FROM_ZIP: {
      present: Boolean(shipFromZip && String(shipFromZip).trim()),
    },
    environment: process.env.VERCEL_ENV || "unknown",
  };

  const allPresent =
    report.STRIPE_SECRET_KEY.present &&
    report.STRIPE_SECRET_KEY.check.includes("correct") &&
    report.EASYPOST_API_KEY.present &&
    report.SHIP_FROM_ZIP.present;

  return res.status(200).json({ ok: allPresent, vars: report });
};
