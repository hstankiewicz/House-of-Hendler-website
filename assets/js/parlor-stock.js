document.addEventListener('DOMContentLoaded', async () => {
  const cards = [...document.querySelectorAll('[data-parlor-card]')];
  if (!cards.length) return;
  let stock = null;
  function update(card) {
    const selector = card.querySelector('[data-parlor-color]');
    const id = selector ? selector.value : card.dataset.productId;
    card.dataset.productId = id;
    const product = window.SITE_CONFIG.products.find(product => product.id === id);
    const image = card.querySelector('img'), button = card.querySelector('[data-parlor-buy]');
    image.src = product.image; image.alt = product.name;
    button.href = `cart.html?add=${encodeURIComponent(id)}`;
    const available = stock?.[id]?.available;
    card.querySelector('[data-parlor-availability]').textContent = typeof available === 'number' ? (available > 0 ? `${available} available.` : 'Sold out.') : '';
    button.textContent = available === 0 ? 'Sold Out' : 'Add to Cart';
    if (available === 0) { button.removeAttribute('href'); button.setAttribute('aria-disabled','true'); }
    else button.removeAttribute('aria-disabled');
  }
  cards.forEach(card => { card.querySelector('select')?.addEventListener('change', () => update(card)); update(card); });
  const base = ['houseofhendler.com','www.houseofhendler.com'].includes(location.hostname) ? 'https://house-of-hendler-website.vercel.app' : '';
  try {
    const response = await fetch(`${base}/api/parlor-inventory`);
    if (!response.ok) throw new Error('Unavailable');
    stock = (await response.json()).products;
    cards.forEach(update);
  } catch (_) { /* Checkout refuses purchases if the reservation service is unavailable. */ }
});
