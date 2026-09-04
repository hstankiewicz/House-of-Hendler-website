/* House of Hendler clean cart rebuild. No shipping logic here. */
(() => {
  const CART_KEY = "hoh-cart-rebuild";

  function loadCart() {
    try {
      const value = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch (_) {
      return {};
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function productIdForButton(button) {
    const card = button.closest(".product-card");
    const grid = card && card.closest("[data-product-grid]");
    if (!card || !grid || !window.SITE_CONFIG?.products) return null;
    const cards = [...grid.querySelectorAll(".product-card")];
    const product = SITE_CONFIG.products[cards.indexOf(card)];
    return product?.id || null;
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-product-grid] .product-card a.btn");
    if (!button) return;
    const productId = productIdForButton(button);
    if (!productId) return;

    event.preventDefault();
    event.stopPropagation();

    const cart = loadCart();
    cart[productId] = Math.min(99, Number(cart[productId] || 0) + 1);
    saveCart(cart);
    window.location.href = "cart.html";
  }, true);

  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("order") !== "success") return;

    localStorage.removeItem(CART_KEY);
    const sessionId = params.get("session_id");
    if (sessionId) {
      window.location.replace(`order-confirmation.html?session_id=${encodeURIComponent(sessionId)}`);
    }
  });
})();
