/* House of Hendler normal checkout page with cart quantities and live EasyPost rate. */
(() => {
  const CART_KEY = "hoh-retail-cart";

  function getProduct(productId) {
    if (!window.SITE_CONFIG || !Array.isArray(SITE_CONFIG.products)) return null;
    return SITE_CONFIG.products.find((product) => product.id === productId) || null;
  }

  function loadCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
      const cleaned = {};
      Object.entries(parsed).forEach(([productId, quantity]) => {
        const product = getProduct(productId);
        const qty = Number(quantity);
        if (product && Number.isInteger(qty) && qty > 0 && qty <= 99) cleaned[productId] = qty;
      });
      return cleaned;
    } catch (_) {
      return {};
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function cartItems(cart) {
    return Object.entries(cart)
      .map(([productId, quantity]) => ({ productId, quantity, product: getProduct(productId) }))
      .filter((item) => item.product && item.quantity > 0);
  }

  function minderCount(items) {
    return items.reduce((total, item) => total + item.quantity * (item.productId === "trio" ? 3 : 1), 0);
  }

  function render() {
    const container = document.getElementById("checkout-items");
    const summary = document.getElementById("checkout-summary");
    const button = document.getElementById("checkout-button");
    const cart = loadCart();
    const items = cartItems(cart);

    if (!items.length) {
      container.innerHTML = '<p>Your cart is empty. <a class="checkout-link" href="shop.html">Return to the shop</a>.</p>';
      summary.textContent = "";
      button.disabled = true;
      return;
    }

    container.innerHTML = items.map((item) => `
      <div class="checkout-item">
        <div>
          <div class="checkout-item-name">${item.product.name}</div>
          <div>${item.product.price}</div>
        </div>
        <div class="checkout-qty">
          <button type="button" data-action="decrease" data-product-id="${item.productId}" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-action="increase" data-product-id="${item.productId}" aria-label="Increase quantity">+</button>
        </div>
      </div>`).join("");

    const count = minderCount(items);
    summary.textContent = `${count} needle minder${count === 1 ? "" : "s"} in this order.`;
    button.disabled = false;
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const cart = loadCart();
    const productId = button.dataset.productId;
    const current = Number(cart[productId] || 0);
    if (button.dataset.action === "increase") cart[productId] = Math.min(99, current + 1);
    if (button.dataset.action === "decrease") {
      if (current <= 1) delete cart[productId];
      else cart[productId] = current - 1;
    }
    saveCart(cart);
    render();
  });

  document.getElementById("shipping-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = document.getElementById("checkout-button");
    const error = document.getElementById("checkout-error");
    const zip = form.zip.value.trim();
    const items = cartItems(loadCart()).map(({ productId, quantity }) => ({ productId, quantity }));

    error.hidden = true;
    button.disabled = true;
    button.textContent = "Calculating shipping…";

    try {
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, zip }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || "Unable to start checkout.");
      window.location.href = data.url;
    } catch (err) {
      error.textContent = err.message || "We couldn't calculate shipping right now. Please try again.";
      error.hidden = false;
      button.disabled = false;
      button.textContent = "Continue to secure payment";
    }
  });

  document.addEventListener("DOMContentLoaded", render);
})();
