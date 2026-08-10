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
    "Free Shipping On Orders $75+",
    "Designed In South Philadelphia",
  ],

  // Main shop link (Etsy storefront) — used for the hero CTA
  etsyShopUrl: "https://www.etsy.com/shop/HouseOfHendler",

  // Social + contact
  instagramHandle: "@houseofhendler",
  instagramUrl: "https://www.instagram.com/houseofhendler",
  contactEmail: "hello@houseofhendler.com",

  // Palm Bunny Collection — the three launch products.
  // Update "etsyUrl" for each with the direct Etsy listing link.
  products: [
    {
      id: "pink",
      name: "Palm Bunny Pink",
      price: "$24.00",
      image: "assets/img/palm-bunny-pink.jpg",
      alt: "Palm Bunny Pink enamel needle minder with pink fishnet pattern and gold trim, shown on marble",
      etsyUrl: "https://www.etsy.com/shop/HouseOfHendler",
    },
    {
      id: "green",
      name: "Palm Bunny Green",
      price: "$24.00",
      image: "assets/img/palm-bunny-green.jpg",
      alt: "Palm Bunny Green enamel needle minder with green fishnet pattern and gold trim, shown on marble",
      etsyUrl: "https://www.etsy.com/shop/HouseOfHendler",
    },
    {
      id: "blue",
      name: "Palm Bunny Blue",
      price: "$24.00",
      image: "assets/img/palm-bunny-blue.jpg",
      alt: "Palm Bunny Blue enamel needle minder with navy fishnet pattern and gold trim, shown on marble",
      etsyUrl: "https://www.etsy.com/shop/HouseOfHendler",
    },
  ],

  currentYear: new Date().getFullYear(),
};
