/* House of Hendler retail checkout: add products to cart, then use a normal checkout page. */
(() => {
  const CART_KEY = "hoh-retail-cart";

  function getProduct(productId) {
    if (!window.SITE_CONFIG || !Array.isArray(SITE_CONFIG.products)) return null;
    return SITE_CONFIG.products.find((product) => product.id === productId) || null;
  }

  function loadCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function productIdFromClickedCard(button) {
    const card = button.closest(".product-card");
    const grid = card && card.closest("[data-product-grid]");
    if (!card || !grid || !window.SITE_CONFIG || !Array.isArray(SITE_CONFIG.products)) return null;
    const cards = [...grid.querySelectorAll(".product-card")];
    const index = cards.indexOf(card);
    const product = SITE_CONFIG.products[index];
    return product ? product.id : null;
  }

  function addToCart(productId) {
    if (!getProduct(productId)) return;
    const cart = loadCart();
    const current = Number(cart[productId] || 0);
    cart[productId] = Math.min(99, Number.isInteger(current) ? current + 1 : 1);
    saveCart(cart);
    window.location.href = "checkout.html";
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-product-grid] .product-card a.btn");
    if (!button) return;
    const productId = productIdFromClickedCard(button);
    if (!productId) return;
    event.preventDefault();
    event.stopPropagation();
    addToCart(productId);
  }, true);

  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("order") === "success") localStorage.removeItem(CART_KEY);
  });
})();
