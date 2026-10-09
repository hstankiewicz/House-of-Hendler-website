const { inventory } = require("../lib/parlor-inventory");
module.exports = async function handler(req, res) {
  const origin = String(req.headers.origin || "");
  const allowed = !origin || ["https://houseofhendler.com", "https://www.houseofhendler.com"].includes(origin) || (process.env.VERCEL_ENV === "preview" && origin === `https://${process.env.VERCEL_URL}`);
  if (!allowed) return res.status(403).json({ error: "Origin not allowed" });
  if (origin) { res.setHeader("Access-Control-Allow-Origin", origin); res.setHeader("Vary", "Origin"); }
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret?.startsWith("sk_")) throw new Error("Inventory is unavailable.");
    return res.status(200).json({ products: await inventory(secret) });
  } catch (error) { return res.status(503).json({ error: "We could not check inventory. Please try again." }); }
};
