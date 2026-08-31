/* House of Hendler retail checkout: live USPS rate by destination ZIP. */
(() => {
  function makeModal() {
    if (document.getElementById("hoh-shipping-modal")) return;

    const style = document.createElement("style");
    style.textContent = `
      .hoh-checkout-modal[hidden]{display:none!important}
      .hoh-checkout-modal{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:rgba(11,31,58,.58)}
      .hoh-checkout-card{width:min(430px,100%);background:#fff;border-radius:2px;padding:30px;box-shadow:0 18px 70px rgba(0,0,0,.22);position:relative}
      .hoh-checkout-card h2{margin:0 0 8px;font-size:28px}
      .hoh-checkout-card p{margin:0 0 20px;color:var(--hoh-ink-soft,#56606f);line-height:1.5}
      .hoh-checkout-card label{display:block;font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px}
      .hoh-checkout-row{display:flex;gap:10px}
      .hoh-checkout-row input{min-width:0;flex:1;border:1px solid #cfd3d8;padding:13px 14px;font:inherit}
      .hoh-checkout-row button{white-space:nowrap}
      .hoh-checkout-close{position:absolute;right:14px;top:10px;border:0;background:transparent;font-size:28px;line-height:1;cursor:pointer;color:#6b7280}
      .hoh-checkout-error{color:#9f1239!important;font-size:13px;margin:12px 0 0!important}
      .hoh-checkout-note{font-size:12px!important;margin-top:14px!important}
      @media(max-width:520px){.hoh-checkout-row{display:block}.hoh-checkout-row button{width:100%;margin-top:10px}}
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
        <h2 id="hoh-checkout-title">Calculate shipping</h2>
        <p>Enter the delivery ZIP code. We’ll calculate the current USPS shipping rate before sending you to secure Stripe checkout.</p>
        <form id="hoh-shipping-form">
          <label for="hoh-shipping-zip">Shipping ZIP code</label>
          <div class="hoh-checkout-row">
            <input id="hoh-shipping-zip" name="zip" inputmode="numeric" autocomplete="postal-code" maxlength="10" placeholder="19147" required>
            <button class="btn btn-pink" type="submit">Continue</button>
          </div>
          <p class="hoh-checkout-error" id="hoh-checkout-error" hidden></p>
          <p class="hoh-checkout-note">Your full shipping address will be collected securely at checkout.</p>
        </form>
      </div>`;
    document.body.appendChild(modal);

    const close = () => { modal.hidden = true; modal.dataset.productId = ""; };
    modal.querySelector(".hoh-checkout-close").addEventListener("click", close);
    modal.addEventListener("click", (event) => { if (event.target === modal) close(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modal.hidden) close(); });

    modal.querySelector("#hoh-shipping-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const button = form.querySelector('button[type="submit"]');
      const error = modal.querySelector("#hoh-checkout-error");
      const zip = form.zip.value.trim();
      const productId = modal.dataset.productId;

      error.hidden = true;
      button.disabled = true;
      button.textContent = "Calculating…";

      try {
        const response = await fetch("/api/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, zip }),
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

  function wireProducts() {
    if (!window.SITE_CONFIG || !Array.isArray(SITE_CONFIG.products)) return;
    makeModal();
    const modal = document.getElementById("hoh-shipping-modal");
    const cards = [...document.querySelectorAll("[data-product-grid] .product-card")];

    cards.forEach((card, index) => {
      const product = SITE_CONFIG.products[index];
      const button = card.querySelector("a.btn");
      if (!product || !button) return;
      button.dataset.checkoutProductId = product.id;
      button.removeAttribute("target");
      button.addEventListener("click", (event) => {
        event.preventDefault();
        modal.dataset.productId = product.id;
        modal.hidden = false;
        const zip = modal.querySelector("#hoh-shipping-zip");
        zip.value = "";
        setTimeout(() => zip.focus(), 0);
      });
    });
  }

  // main.js renders the product grid on DOMContentLoaded. Run immediately after it.
  document.addEventListener("DOMContentLoaded", () => setTimeout(wireProducts, 0));
})();
