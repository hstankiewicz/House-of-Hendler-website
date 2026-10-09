const IDS = ["parlor-lantern-green", "parlor-lantern-navy", "parlor-lantern-pink", "parlor-pagoda-frame-green", "parlor-pagoda-frame-navy", "parlor-pagoda-frame-pink", "parlor-bamboo-chair", "parlor-curio-cabinet", "parlor-accent-lamp"];
const LIMIT = 50;
async function inventory(secret) {
  const totals = Object.fromEntries(IDS.map(id => [id, { limit: LIMIT, sold: 0, reserved: 0, available: LIMIT }]));
  let cursor = "";
  do {
    const query = new URLSearchParams({ limit: "100", "created[gte]": "1791500000" });
    if (cursor) query.set("starting_after", cursor);
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions?${query}`, { headers: { Authorization: `Bearer ${secret}` } });
    const page = await response.json();
    if (!response.ok) throw new Error("Preorder availability could not be checked. Please try again.");
    for (const session of page.data || []) {
      if (session.status === "expired") continue;
      let items; try { items = JSON.parse(session.metadata?.parlor_items || "[]"); } catch (_) { continue; }
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        const stock = totals[item.productId]; const quantity = Number(item.quantity);
        if (!stock || !Number.isInteger(quantity) || quantity < 1) continue;
        if (session.status === "complete") stock.sold += quantity;
        else if (session.status === "open" && session.expires_at > Date.now()/1000) stock.reserved += quantity;
      }
    }
    cursor = page.has_more ? page.data?.[page.data.length - 1]?.id || "" : "";
  } while (cursor);
  for (const stock of Object.values(totals)) stock.available = Math.max(0, LIMIT - stock.sold - stock.reserved);
  return totals;
}
module.exports = { inventory, IDS, LIMIT };
