/* House of Hendler retail checkout: cart-aware live USPS rate by destination ZIP. Preview env refresh 2026-09-04. */
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

  function cartNeedleMinderCount(cart) {
    return cartItems(cart).reduce((total, item) => {
      const perUnit = item.productId === "trio" ? 3 : 1;
      return total + item.quantity * perUnit;
    }, 0);
  }

  function makeModal() {
    if (document.getElementById("hoh-shipping-modal")) return;

    const style = document.createElement("style");
    style.textContent = `
      .hoh-checkout-modal[hidden]{display:none!important}
      .hoh-checkout-modal{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:rgba(11,31,58,.58)}
      .hoh-checkout-card{width:min(470px,100%);max-height:min(760px,92vh);overflow:auto;background:#fff;border-radius:2px;padding:30px;box-shadow:0 18px 70px rgba(0,0,0,.22);position:relative}
      .hoh-checkout-card h2{margin:0 0 8px;font-size:28px}
      .hoh-checkout-card p{margin:0 0 20px;color:var(--hoh-ink-soft,#56606f);line-height:1.5}
      .hoh-checkout-card label{display:block;font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px}
      .hoh-cart-items{border-top:1px solid #e4e6e8;margin:20px 0}
      .hoh-cart-item{display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center;padding:14px 0;border-bottom:1px solid #e4e6e8}
      .hoh-cart-name{font-weight:700;color:var(--hoh-navy,#0b1f3a)}
      .hoh-cart-qty{display:flex;align-items:center;gap:9px}
      .hoh-cart-qty button{width:30px;height:30px;border:1px solid #cfd3d8;background:#fff;cursor:pointer;font:inherit;line-height:1}
      .hoh-cart-qty span{min-width:18px;text-align:center;font-weight:700}
      .hoh-cart-summary{font-size:13px!important;margin:0 0 18px!important}
      .hoh-checkout-row{display:flex;gap:10px}
      .hoh-checkout-row input{min-width:0;flex:1;border:1px solid #cfd3d8;padding:13px 14px;font:inherit}
      .hoh-checkout-row button{white-space:nowrap}
      .hoh-checkout-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:18px}
      .hoh-checkout-secondary{border:0;background:transparent;padding:0;color:var(--hoh-navy,#0b1f3a);text-decoration:underline;cursor:pointer;font:inherit}
      .hoh-checkout-close{position:absolute;right:14px;top:10px;border:0;background:transparent;font-size:28px;line-height:1;cursor:pointer;color:#6b7280}
      .hoh-checkout-error{color:#9f1239!important;font-size:13px;margin:12px 0 0!important}
      .hoh-checkout-note{font-size:12px!important;margin-top:14px!important}
      @media(max-width:520px){.hoh-checkout-row{display:block}.hoh-checkout-row button{width:100%;margin-top:10px}.hoh-checkout-actions{align-items:flex-start;flex-direction:column}}
    `;
    document.head.appendChild(style);

    const modal = document.createElement("div");
    modal.id = "hoh-shipping-modal";
    modal.className = "hoh-checkout-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="hoh-checkout-card" role="dialog" aria-modal="true" aria-labelledby="hoh-checkout-title">
        <button class="hoh-checkout-close" type="button" aria-label="Close">&times;</button>
        <span class="eyebrow">Checkout</span>
        <h2 id="hoh-checkout-title">Your cart</h2>
        <p>Add any combination of Palm Bunnies, then enter the delivery ZIP code to calculate the current USPS shipping rate.</p>
        <div class="hoh-cart-items" id="hoh-cart-items"></div>
        <p class="hoh-cart-summary" id="hoh-cart-summary"></p>
        <form id="hoh-shipping-form">
          <label for="hoh-shipping-zip">Shipping ZIP code</label>
          <div class="hoh-checkout-row">
            <input id="hoh-shipping-zip" name="zip" inputmode="numeric" autocomplete="postal-code" maxlength="10" placeholder="19147" required>
            <button class="btn btn-pink" type="submit">Continue</button>
          </div>
          <p class="hoh-checkout-error" id="hoh-checkout-error" hidden></p>
          <p class="hoh-checkout-note">Your full shipping address will be collected securely at checkout.</p>
        </form>
        <div class="hoh-checkout-actions">
          <button class="hoh-checkout-secondary" id="hoh-continue-shopping" type="button">Continue shopping</button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    const close = () => { modal.hidden = true; };
    modal.querySelector(".hoh-checkout-close").addEventListener("click", close);
    modal.querySelector("#hoh-continue-shopping").addEventListener("click", close);
    modal.addEventListener("click", (event) => { if (event.target === modal) close(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modal.hidden) close(); });

    modal.querySelector("#hoh-cart-items").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-cart-action]");
      if (!button) return;
      const productId = button.dataset.productId;
      const action = button.dataset.cartAction;
      const cart = loadCart();
      const current = cart[productId] || 0;

      if (action === "increase") cart[productId] = Math.min(99, current + 1);
      if (action === "decrease") {
        if (current <= 1) delete cart[productId];
        else cart[productId] = current - 1;
      }

      saveCart(cart);
      renderCart();
    });

    modal.querySelector("#hoh-shipping-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const button = form.querySelector('button[type="submit"]');
      const error = modal.querySelector("#hoh-checkout-error");
      const zip = form.zip.value.trim();
      const cart = loadCart();
      const items = cartItems(cart).map(({ productId, quantity }) => ({ productId, quantity }));

      error.hidden = true;
      if (!items.length) {
        error.textContent = "Your cart is empty.";
        error.hidden = false;
        return;
      }

      button.disabled = true;
      button.textContent = "Calculating…";

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
        error.textContent = err.message || "We couldn't calculate shipping. Please try again.";
        error.hidden = false;
        button.disabled = false;
        button.textContent = "Continue";
      }
    });
  }

  function renderCart() {
    const modal = document.getElementById("hoh-shipping-modal");
    if (!modal) return;
    const cart = loadCart();
    const items = cartItems(cart);
    const itemContainer = modal.querySelector("#hoh-cart-items");
    const summary = modal.querySelector("#hoh-cart-summary");
    const submit = modal.querySelector('#hoh-shipping-form button[type="submit"]');

    if (!items.length) {
      itemContainer.innerHTML = '<p style="margin:14px 0;">Your cart is empty.</p>';
      summary.textContent = "";
      submit.disabled = true;
      return;
    }

    itemContainer.innerHTML = items.map((item) => `
      <div class="hoh-cart-item">
        <div class="hoh-cart-name">${item.product.name}</div>
        <div class="hoh-cart-qty" aria-label="Quantity for ${item.product.name}">
          <button type="button" data-cart-action="decrease" data-product-id="${item.productId}" aria-label="Decrease ${item.product.name} quantity">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-cart-action="increase" data-product-id="${item.productId}" aria-label="Increase ${item.product.name} quantity">+</button>
        </div>
      </div>`).join("");

    const minderCount = cartNeedleMinderCount(cart);
    summary.textContent = `${minderCount} needle minder${minderCount === 1 ? "" : "s"} in this order.`;
    submit.disabled = false;
  }

  function openCart() {
    const modal = document.getElementById("hoh-shipping-modal");
    if (!modal) makeModal();
    const currentModal = document.getElementById("hoh-shipping-modal");
    if (!currentModal) return;
    renderCart();
    currentModal.hidden = false;
    const zip = currentModal.querySelector("#hoh-shipping-zip");
    setTimeout(() => zip.focus(), 0);
  }

  function addToCart(productId) {
    const cart = loadCart();
    cart[productId] = Math.min(99, (cart[productId] || 0) + 1);
    saveCart(cart);
    openCart();
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
    makeModal();
  });
})();
