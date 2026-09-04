module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  async function probe(url, checks) {
    try {
      const response = await fetch(url, { redirect: 'follow', cache: 'no-store' });
      const text = await response.text();
      const matched = {};
      for (const [key, needle] of Object.entries(checks || {})) {
        matched[key] = text.includes(needle);
      }
      return {
        ok: response.ok,
        status: response.status,
        finalUrl: response.url,
        server: response.headers.get('server'),
        vercelId: response.headers.get('x-vercel-id'),
        vercelCache: response.headers.get('x-vercel-cache'),
        age: response.headers.get('age'),
        matched,
      };
    } catch (error) {
      return { ok: false, error: error?.message || String(error) };
    }
  }

  const [checkout, script] = await Promise.all([
    probe('https://houseofhendler.com/checkout-dynamic.html', {
      cacheVersion2: 'dynamic-checkout.js?v=20260904-2',
    }),
    probe('https://houseofhendler.com/assets/js/dynamic-checkout.js?v=20260904-2', {
      actionsRunServerUpdate: 'actions.runServerUpdate',
      oldCheckoutRunServerUpdate: 'checkout.runServerUpdate',
    }),
  ]);

  res.status(200).json({ checkout, script });
};
