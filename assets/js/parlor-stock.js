document.addEventListener("DOMContentLoaded", async () => {
  const labels = [...document.querySelectorAll("[data-parlor-stock]")];
  if (!labels.length) return;
  const base = ["houseofhendler.com", "www.houseofhendler.com"].includes(location.hostname) ? "https://house-of-hendler-website.vercel.app" : "";
  try {
    const response = await fetch(`${base}/api/parlor-inventory`);
    if (!response.ok) throw new Error("Availability unavailable");
    const data = await response.json();
    for (const label of labels) {
      const id = label.dataset.parlorStock; const stock = data.products[id]; if (!stock) continue;
      label.textContent = stock.available > 0 ? `${stock.available} available for preorder.` : "Currently sold out or reserved in checkout.";
      if (!stock.available) for (const link of document.querySelectorAll(`[data-parlor-buy="${id}"]`)) { link.setAttribute("aria-disabled", "true"); link.removeAttribute("href"); link.textContent = "Unavailable"; }
    }
  } catch (_) { labels.forEach(label => { label.textContent = "Availability confirmed at checkout."; }); }
});
