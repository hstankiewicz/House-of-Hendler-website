module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  async function textProbe(url, needles) {
    try {
      const response = await fetch(url, { redirect: "follow", cache: "no-store" });
      const text = await response.text();
      return {
        status: response.status,
        server: response.headers.get("server"),
        checks: Object.fromEntries(Object.entries(needles).map(([key, needle]) => [key, text.includes(needle)])),
      };
    } catch (error) {
      return { error: error?.message || String(error) };
    }
  }

  async function preflight(url) {
    try {
      const response = await fetch(url, {
        method: "OPTIONS",
        headers: {
          Origin: "https://houseofhendler.com",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "content-type",
        },
        redirect: "manual",
      });
      return {
        status: response.status,
        allowOrigin: response.headers.get("access-control-allow-origin"),
        allowMethods: response.headers.get("access-control-allow-methods"),
        allowHeaders: response.headers.get("access-control-allow-headers"),
      };
    } catch (error) {
      return { error: error?.message || String(error) };
    }
  }

  const [page, script, createCors, updateCors] = await Promise.all([
    textProbe("https://houseofhendler.com/checkout-dynamic.html", {
      cacheVersion3: "dynamic-checkout.js?v=20260904-3",
    }),
    textProbe("https://houseofhendler.com/assets/js/dynamic-checkout.js?v=20260904-3", {
      vercelApiBase: "https://house-of-hendler-website.vercel.app",
      actionsServerUpdate: "actions.runServerUpdate",
    }),
    preflight("https://house-of-hendler-website.vercel.app/api/create-dynamic-checkout"),
    preflight("https://house-of-hendler-website.vercel.app/api/update-dynamic-shipping"),
  ]);

  res.status(200).json({ page, script, createCors, updateCors });
};
