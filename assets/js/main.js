/* =========================================================
   HOUSE OF HENDLER — main.js
   Applies SITE_CONFIG to the DOM + small UI interactions.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Announcement bar ---------- */
  const track = document.querySelector("[data-announcement-track]");
  if (track && window.SITE_CONFIG) {
    track.innerHTML = SITE_CONFIG.announcement
      .map((msg) => `<span>${msg}</span>`)
      .join('<span class="dot" aria-hidden="true">&#9670;</span>');
  }

  /* ---------- Shop links (hero CTA, footer, etc.) ---------- */
  document.querySelectorAll("[data-etsy-link]").forEach((el) => {
    if (window.SITE_CONFIG) el.href = SITE_CONFIG.etsyShopUrl;
  });

  /* ---------- Instagram links + handle text ---------- */
  document.querySelectorAll("[data-instagram-link]").forEach((el) => {
    if (window.SITE_CONFIG) el.href = SITE_CONFIG.instagramUrl;
  });
  document.querySelectorAll("[data-instagram-handle]").forEach((el) => {
    if (window.SITE_CONFIG) el.textContent = SITE_CONFIG.instagramHandle;
  });

  /* ---------- Contact email (visible text + mailto href) ---------- */
  document.querySelectorAll("[data-contact-email]").forEach((el) => {
    if (!window.SITE_CONFIG) return;
    el.textContent = SITE_CONFIG.contactEmail;
    if (el.tagName === "A") el.href = `mailto:${SITE_CONFIG.contactEmail}`;
  });

  /* ---------- Mailto-only links (icon buttons — don't touch content) ---------- */
  document.querySelectorAll("[data-contact-mailto]").forEach((el) => {
    if (window.SITE_CONFIG) el.href = `mailto:${SITE_CONFIG.contactEmail}`;
  });

  /* ---------- Wholesale resources ---------- */
  const wholesaleTerms = document.querySelector(".ws-terms");
  if (wholesaleTerms && !document.querySelector("[data-wholesale-resources]")) {
    const resources = document.createElement("div");
    resources.setAttribute("data-wholesale-resources", "");
    resources.style.cssText = "text-align:center;margin:-10px auto 34px;padding:20px 18px;background:var(--hoh-cream);border:1px solid var(--hoh-line);border-radius:var(--radius-sm);";
    resources.innerHTML = `
      <span class="eyebrow">Wholesale Resources</span>
      <p style="margin:7px auto 14px;color:var(--hoh-ink-soft);font-size:13.5px;max-width:560px;">Current 2026 pricing: $14 wholesale, $28 suggested retail, 18-piece opening minimum and 12-piece reorder minimum.</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        <a class="btn btn-outline-navy" href="wholesale-line-sheet.pdf" target="_blank" rel="noopener">View Wholesale Line Sheet</a>
        <a class="btn btn-pink" href="#wholesale-order-form">Place Wholesale Order</a>
      </div>`;
    wholesaleTerms.insertAdjacentElement("afterend", resources);
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-current-year]").forEach((el) => {
    if (window.SITE_CONFIG) el.textContent = SITE_CONFIG.currentYear;
  });

  /* ---------- Product grid (rendered from config) ---------- */
  document.querySelectorAll("[data-product-grid]").forEach((grid) => {
    if (!window.SITE_CONFIG) return;
    grid.innerHTML = SITE_CONFIG.products
      .map(
        (p) => `
      <article class="product-card">
        <div class="thumb">
          <img src="${p.image}" alt="${p.alt}" loading="lazy" width="900" height="1125">
        </div>
        <div class="info">
          <h3>${p.name}</h3>
          <p class="price">${p.price}</p>
          <a class="btn btn-pink" href="${p.etsyUrl}" target="_blank" rel="noopener">Shop Now</a>
        </div>
      </article>`
      )
      .join("");
  });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    // Close mobile nav on link click
    mobileNav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        mobileNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- Submit static forms through the configured form backend ---------- */
  document.querySelectorAll("form[data-static-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const note = form.querySelector("[data-form-success]");
      const submitBtn = form.querySelector('button[type="submit"]');
      const showSuccess = () => {
        if (note) {
          note.hidden = false;
          note.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        form.reset();
      };
      const showError = () => {
        alert("Sorry, something went wrong sending that. Please try again or email us directly.");
      };

      const action = form.getAttribute("action");

      // No backend configured yet — just show the success note locally.
      if (!action) {
        showSuccess();
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then((response) => {
          if (response.ok) {
            showSuccess();
          } else {
            showError();
          }
        })
        .catch(() => showError())
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  });
});
