/* House of Hendler clean cart page. */
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

  function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
  function product(id) { return window.SITE_CONFIG?.products?.find((p) => p.id === id) || null; }
  function money(value) { return `$${value.toFixed(2)}`; }

  function items() {
    return Object.entries(loadCart()).map(([productId, quantity]) => ({ productId, quantity:Number(quantity), product:product(productId) })).filter((x) => x.product && x.quantity > 0);
  }

  function render() {
    const list = document.getElementById("cart-items");
    const subtotalEl = document.getElementById("cart-subtotal");
    const button = document.getElementById("checkout-button");
    const current = items();

    if (!current.length) {
      list.innerHTML = '<p>Your cart is empty. <a href="shop.html">Return to the shop</a>.</p>';
      subtotalEl.textContent = "";
      button.disabled = true;
      return;
    }

    let subtotal = 0;
    list.innerHTML = current.map((item) => {
      const unit = Number(String(item.product.price).replace(/[^0-9.]/g, ""));
      const line = unit * item.quantity;
      subtotal += line;
      return `<div class="cart-row"><div><div class="cart-name">${item.product.name}</div><div class="cart-price">${item.product.price} each</div></div><div class="cart-qty"><button type="button" data-action="minus" data-id="${item.productId}">−</button><strong>${item.quantity}</strong><button type="button" data-action="plus" data-id="${item.productId}">+</button></div><div class="cart-total">${money(line)}</div></div>`;
    }).join("");
    subtotalEl.textContent = `Subtotal ${money(subtotal)}`;
    button.disabled = false;
  }

  document.addEventListener("click", (event) => {
    const control = event.target.closest("button[data-action]");
    if (!control) return;
    const cart = loadCart();
    const id = control.dataset.id;
    const qty = Number(cart[id] || 0);
    if (control.dataset.action === "plus") cart[id] = Math.min(99, qty + 1);
    else if (qty <= 1) delete cart[id];
    else cart[id] = qty - 1;
    saveCart(cart);
    render();
  });

  document.getElementById("checkout-button")?.addEventListener("click", () => {
    if (!items().length) return;
    window.location.href = "checkout-dynamic.html";
  });

  document.addEventListener("DOMContentLoaded", render);
})();
