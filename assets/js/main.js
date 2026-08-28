/* =========================================================
   HOUSE OF HENDLER — main.js
   Applies SITE_CONFIG to the DOM + small UI interactions.
   ========================================================= */

/* Load the sitewide navy / pink / gold brand refresh on every page. */
(() => {
  const existing = document.querySelector('link[data-brand-refresh]');
  if (existing) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'assets/css/brand-refresh.css?v=20260825';
  link.setAttribute('data-brand-refresh', '');
  document.head.appendChild(link);
})();

/* Refined announcement-bar separators. */
(() => {
  if (document.querySelector('style[data-announcement-separators]')) return;
  const style = document.createElement('style');
  style.setAttribute('data-announcement-separators', '');
  style.textContent = `
    .announcement-sep {
      display: inline-block;
      width: 1px;
      height: 13px;
      background: rgba(255,255,255,0.42);
      flex: 0 0 1px;
      align-self: center;
    }
    @media (max-width: 720px) {
      .announcement-sep { display: none; }
    }
  `;
  document.head.appendChild(style);
})();

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Announcement bar ---------- */
  const track = document.querySelector("[data-announcement-track]");
  if (track && window.SITE_CONFIG) {
    track.innerHTML = SITE_CONFIG.announcement
      .map((msg) => `<span>${msg}</span>`)
      .join('<span class="announcement-sep" aria-hidden="true"></span>');
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

  /* ---------- Facebook + TikTok links ---------- */
  if (window.SITE_CONFIG) {
    const additionalSocialLinks = [
      {
        key: "facebook",
        label: "House of Hendler on Facebook",
        url: SITE_CONFIG.facebookUrl,
        icon: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V4.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V11H7.3v3h2.8v8h3.4Z"/></svg>',
      },
      {
        key: "tiktok",
        label: "House of Hendler on TikTok",
        url: SITE_CONFIG.tiktokUrl,
        icon: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 3c.3 2.1 1.5 3.4 3.4 3.6v3.1c-1.4 0-2.6-.4-3.5-1.1v6.2a6.1 6.1 0 1 1-5.2-6v3.2a3 3 0 1 0 2.1 2.8V3h3.2Z"/></svg>',
      },
    ];

    document.querySelectorAll("[data-instagram-link]").forEach((instagramLink) => {
      if (!instagramLink.parentElement.matches(".header-icons, .footer-social")) return;
      let insertionPoint = instagramLink;
      additionalSocialLinks.forEach((social) => {
        if (!social.url || instagramLink.parentElement.querySelector(`[data-${social.key}-link]`)) return;
        const link = document.createElement("a");
        link.href = social.url;
        link.target = "_blank";
        link.rel = "noopener";
        link.setAttribute(`data-${social.key}-link`, "");
        link.setAttribute("aria-label", social.label);
        link.innerHTML = social.icon;
        insertionPoint.insertAdjacentElement("afterend", link);
        insertionPoint = link;
      });
    });
  }

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

  /* ---------- Wholesale page cleanup ---------- */
  document.querySelectorAll("h2").forEach((heading) => {
    if (heading.textContent.trim() === "Trade pricing is kept private.") {
      heading.remove();
    }
  });

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
          ${p.description ? `<p style="margin:0 0 10px;">${p.description}</p>` : ""}
          ${p.exclusiveLine ? `<p style="margin:0 0 18px; font-style:italic;">${p.exclusiveLine}</p>` : ""}
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
