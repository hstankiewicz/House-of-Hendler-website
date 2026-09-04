/* House of Hendler checkout: customer enters full address once; EasyPost updates shipping behind the scenes. */
(() => {
  const CART_KEY = "hoh-retail-cart";
  const STRIPE_PUBLISHABLE_KEY = "pk_live_51U8UJRKEDXkXigZmaUO0gBl9CBatEAQ3keZAAC5scQD8nCIzDuMUUy48By2uPzq2R0lFALO4IzV1NJsldHLtrP3g00NaUyX9Wy";
  let checkout = null;
  let checkoutActions = null;
  let shippingReady = false;
  let canConfirm = false;
  let lastAddressSignature = "";
  let shippingTimer = null;

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

  function showError(message) {
    const el = document.getElementById("checkout-error");
    if (!el) return;
    el.textContent = message;
    el.hidden = !message;
  }

  function updatePayButton() {
    const button = document.getElementById("pay-button");
    if (!button) return;
    button.disabled = !(shippingReady && canConfirm && checkoutActions);
  }

  function renderCart() {
    const container = document.getElementById("checkout-items");
    const summary = document.getElementById("checkout-summary");
    const items = cartItems(loadCart());

    if (!items.length) {
      container.innerHTML = '<p>Your cart is empty. <a class="checkout-link" href="shop.html">Return to the shop</a>.</p>';
      summary.textContent = "";
      return false;
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
    return true;
  }

  function addressSignature(value) {
    const a = value?.address || {};
    return [value?.name, a.line1, a.line2, a.city, a.state, a.postal_code, a.country].map((v) => String(v || "").trim().toLowerCase()).join("|");
  }

  async function updateShipping(shippingDetails) {
    const status = document.getElementById("shipping-status");
    shippingReady = false;
    updatePayButton();
    status.textContent = "Calculating USPS shipping…";
    showError("");

    const response = await fetch("/api/update-checkout-shipping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkout_session_id: checkoutActions.getSession().id,
        shipping_details: shippingDetails,
      }),
    });
    const result = await response.json();
    if (!response.ok || result.type === "error") {
      throw new Error(result.message || "We couldn't calculate shipping for this address.");
    }

    shippingReady = true;
    const amount = Number(result.shipping?.amount || 0).toFixed(2);
    status.textContent = `${result.shipping?.service || "USPS shipping"}: $${amount}`;
    updatePayButton();
    return { type: "object", value: { succeeded: true } };
  }

  async function initializeCheckout() {
    const loading = document.getElementById("checkout-loading");
    const form = document.getElementById("checkout-form");
    const items = cartItems(loadCart()).map(({ productId, quantity }) => ({ productId, quantity }));
    if (!items.length) {
      loading.textContent = "Add an item to your cart to check out.";
      return;
    }

    try {
      const sessionResponse = await fetch("/api/create-elements-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const sessionData = await sessionResponse.json();
      if (!sessionResponse.ok || !sessionData.clientSecret) throw new Error(sessionData.error || "Unable to start checkout.");

      const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
      checkout = stripe.initCheckoutElementsSdk({
        clientSecret: sessionData.clientSecret,
        elementsOptions: {
          appearance: {
            variables: {
              colorPrimary: "#12365f",
              colorText: "#12365f",
              borderRadius: "2px",
            },
          },
        },
      });

      const loadResult = await checkout.loadActions();
      if (loadResult.type !== "success") throw new Error(loadResult.error?.message || "Unable to load checkout.");
      checkoutActions = loadResult.actions;

      const contact = checkout.createContactDetailsElement();
      contact.mount("#contact-details-element");

      const shippingAddress = checkout.createShippingAddressElement();
      shippingAddress.mount("#shipping-address-element");

      const payment = checkout.createPaymentElement();
      payment.mount("#payment-element");

      checkout.on("change", (session) => {
        canConfirm = Boolean(session.canConfirm);
        updatePayButton();
      });

      shippingAddress.on("change", (event) => {
        clearTimeout(shippingTimer);
        if (!event.complete) {
          shippingReady = false;
          document.getElementById("shipping-status").textContent = "Shipping will calculate automatically after your address is complete.";
          updatePayButton();
          return;
        }

        shippingTimer = setTimeout(async () => {
          try {
            const valueResult = await shippingAddress.getValue();
            if (!valueResult.complete) return;
            const signature = addressSignature(valueResult.value);
            if (!signature || signature === lastAddressSignature) return;
            lastAddressSignature = signature;
            await checkout.runServerUpdate(() => updateShipping(valueResult.value));
          } catch (error) {
            shippingReady = false;
            document.getElementById("shipping-status").textContent = "Shipping could not be calculated yet.";
            showError(error?.message || "We couldn't calculate shipping. Please check the address and try again.");
            updatePayButton();
          }
        }, 450);
      });

      document.getElementById("pay-button").addEventListener("click", async () => {
        const button = document.getElementById("pay-button");
        button.disabled = true;
        button.textContent = "Processing…";
        showError("");
        try {
          const result = await checkoutActions.confirm();
          if (result?.type === "error") throw new Error(result.error?.message || "Payment could not be completed.");
        } catch (error) {
          showError(error?.message || "Payment could not be completed. Please try again.");
          button.textContent = "Pay securely";
          updatePayButton();
        }
      });

      loading.hidden = true;
      form.hidden = false;
      const initialSession = checkoutActions.getSession();
      canConfirm = Boolean(initialSession.canConfirm);
      updatePayButton();
    } catch (error) {
      console.error(error);
      loading.textContent = error?.message || "Unable to load secure checkout.";
    }
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
    window.location.reload();
  });

  document.addEventListener("DOMContentLoaded", () => {
    if (renderCart()) initializeCheckout();
    else document.getElementById("checkout-loading").textContent = "Add an item to your cart to check out.";
  });
})();
