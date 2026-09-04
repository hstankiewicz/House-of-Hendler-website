/* =========================================================
   HOUSE OF HENDLER — SITE CONFIGURATION
   ---------------------------------------------------------
   Edit the values below to update links, prices, copy, and
   contact info across the ENTIRE site. Nothing else in the
   codebase needs to change.
   ========================================================= */

window.SITE_CONFIG = {

  // Announcement bar (top of every page)
  announcement: [
    "The Palm Bunny Collection Is Here",
    "TIMELESS PIECES, THOUGHTFULLY COLLECTED.",
    "Designed In Philadelphia",
  ],

  // Main shop link (Etsy storefront) — used for the hero CTA
  etsyShopUrl: "shop.html",

  // Social + contact
  instagramHandle: "@houseofhendler",
  instagramUrl: "https://www.instagram.com/houseofhendler",
  facebookUrl: "https://www.facebook.com/share/1K8g4kLBx9/?mibextid=wwXIfr",
  tiktokUrl: "https://www.tiktok.com/@houseofhendler?_r=1&_t=ZP-99DlEBdQIIx",
  contactEmail: "heather@houseofhendler.com",
  wholesaleNotificationEmail: "heather@houseofhendler.com",

  // Palm Bunny Collection — preview checkout routes stay on-site.
  products: [
    {
      id: "pink",
      name: "Palm Bunny Pink",
      price: "$28.00",
      image: "assets/img/product-pink.png",
      alt: "Palm Bunny Pink enamel needle minder with pink fishnet pattern and gold trim, shown on marble",
      etsyUrl: "checkout.html?product=pink",
    },
    {
      id: "green",
      name: "Palm Bunny Green",
      price: "$28.00",
      image: "assets/img/product-green.png",
      alt: "Palm Bunny Green enamel needle minder with green fishnet pattern and gold trim, shown on marble",
      etsyUrl: "checkout.html?product=green",
    },
    {
      id: "blue",
      name: "Palm Bunny Blue",
      price: "$28.00",
      image: "assets/img/product-blue.png",
      alt: "Palm Bunny Blue enamel needle minder with navy fishnet pattern and gold trim, shown on marble",
      etsyUrl: "checkout.html?product=blue",
    },
    {
      id: "trio",
      name: "The Palm Bunny Trio",
      price: "$80",
      image: "assets/img/palm-bunny-trio.png",
      alt: "The Palm Bunny Trio in Petal Pink, Palm Green, and Royal Blue",
      description: "All three signature Palm Bunnies, collected together. Includes Palm Green, Petal Pink, and Royal Blue. Each individually packaged.",
      exclusiveLine: "Available exclusively at House of Hendler.",
      etsyUrl: "checkout.html?product=trio",
    },
  ],

  currentYear: new Date().getFullYear(),
};

// Wholesale order notification redundancy:
// Send a copy of each wholesale order request to the business inbox
// so submissions are easy to track even if the form backend changes.
document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("wholesale-order-form");
  if (!form || !window.SITE_CONFIG.wholesaleNotificationEmail) return;

  var cc = form.querySelector('input[name="_cc"]');
  if (!cc) {
    cc = document.createElement("input");
    cc.type = "hidden";
    cc.name = "_cc";
    form.appendChild(cc);
  }
  cc.value = window.SITE_CONFIG.wholesaleNotificationEmail;
});
