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

  // Main shop link — used for hero CTAs
  etsyShopUrl: "shop.html",

  // Social + contact
  instagramHandle: "@houseofhendler",
  instagramUrl: "https://www.instagram.com/houseofhendler",
  facebookUrl: "https://www.facebook.com/share/1K8g4kLBx9/?mibextid=wwXIfr",
  tiktokUrl: "https://www.tiktok.com/@houseofhendler?_r=1&_t=ZP-99DlEBdQIIx",
  contactEmail: "heather@houseofhendler.com",
  wholesaleNotificationEmail: "heather@houseofhendler.com",

  products: [
    {
      id: "pink",
      name: "Palm Bunny Pink",
      price: "$28.00",
      image: "assets/img/product-pink.png",
      alt: "Palm Bunny Pink enamel needle minder with pink fishnet pattern and gold trim, shown on marble",
      etsyUrl: "cart.html?add=pink",
    },
    {
      id: "green",
      name: "Palm Bunny Green",
      price: "$28.00",
      image: "assets/img/product-green.png",
      alt: "Palm Bunny Green enamel needle minder with green fishnet pattern and gold trim, shown on marble",
      etsyUrl: "cart.html?add=green",
    },
    {
      id: "blue",
      name: "Palm Bunny Blue",
      price: "$28.00",
      image: "assets/img/product-blue.png",
      alt: "Palm Bunny Blue enamel needle minder with navy fishnet pattern and gold trim, shown on marble",
      etsyUrl: "cart.html?add=blue",
    },
    {
      id: "trio",
      name: "The Palm Bunny Trio",
      price: "$80",
      image: "assets/img/palm-bunny-trio.png",
      alt: "The Palm Bunny Trio in Petal Pink, Palm Green, and Royal Blue",
      description: "All three signature Palm Bunnies, collected together. Includes Palm Green, Petal Pink, and Royal Blue. Each individually packaged.",
      exclusiveLine: "Available exclusively at House of Hendler.",
      etsyUrl: "cart.html?add=trio",
    },
    {
      id: "tortoise-blonde",
      name: "Tortoise Scallop Thread Organizer — Blonde Tortoise",
      price: "$28.00",
      image: "assets/img/tortoise-blonde.png",
      alt: "House of Hendler Blonde Tortoise scalloped acrylic thread organizer styled with colorful embroidery threads",
      etsyUrl: "cart.html?add=tortoise-blonde",
      collection: "stitching-accessories",
    },
    {
      id: "tortoise-classic",
      name: "Tortoise Scallop Thread Organizer — Classic Tortoise",
      price: "$28.00",
      image: "assets/img/tortoise-both.png",
      alt: "House of Hendler Blonde and Classic Tortoise scalloped acrylic thread organizers side by side",
      etsyUrl: "cart.html?add=tortoise-classic",
      collection: "stitching-accessories",
    },

    {"id": "parlor-lantern-green", "name": "Chinoiserie Lantern — Green", "price": "$28.00", "unitAmount": 2800, "image": "assets/img/parlor-lantern-green.png", "alt": "Lantern — Green needle minder from The Parlor by House of Hendler", "description": "Rich green enamel, polished gold detailing, and a pagoda-inspired roof bring a classic chinoiserie accent to your canvas. The candle motif and bell details make this lantern a considered addition to The Parlor.", "etsyUrl": "cart.html?add=parlor-lantern-green", "collection": "parlor", "inventoryQuantity": 24, "availability": "in_stock", "approved": true},
    {"id": "parlor-lantern-navy", "name": "Chinoiserie Lantern — Navy", "price": "$28.00", "unitAmount": 2800, "image": "assets/img/parlor-lantern-navy.png", "alt": "Lantern — Navy needle minder from The Parlor by House of Hendler", "description": "Navy enamel and polished gold detailing give this lantern a traditional, collected presence. With its pagoda-inspired roof, candle motif, and bell details, it brings a familiar chinoiserie furnishing to your canvas.", "etsyUrl": "cart.html?add=parlor-lantern-navy", "collection": "parlor", "inventoryQuantity": 22, "availability": "in_stock", "approved": true},
    {"id": "parlor-lantern-pink", "name": "Chinoiserie Lantern — Pink", "price": "$28.00", "unitAmount": 2800, "image": "assets/img/parlor-lantern-pink.png", "alt": "Lantern — Pink needle minder from The Parlor by House of Hendler", "description": "Pink enamel and polished gold detailing offer a bright take on a traditional chinoiserie lantern. A pagoda-inspired roof, candle motif, and bell details make it a distinctive furnishing for your canvas.", "etsyUrl": "cart.html?add=parlor-lantern-pink", "collection": "parlor", "inventoryQuantity": 18, "availability": "in_stock", "approved": true},
    {"id": "parlor-pagoda-frame-green", "name": "Pagoda Frame — Green", "price": "$28.00", "unitAmount": 2800, "image": "assets/img/parlor-pagoda-frame-green.png", "alt": "Pagoda Frame — Green needle minder from The Parlor by House of Hendler", "description": "A green enamel pagoda frame with polished gold detailing and an open center. Its architectural silhouette and geometric fretwork bring a traditional chinoiserie detail to your canvas.", "etsyUrl": "cart.html?add=parlor-pagoda-frame-green", "collection": "parlor", "inventoryQuantity": 20, "availability": "in_stock", "approved": true},
    {"id": "parlor-pagoda-frame-navy", "name": "Pagoda Frame — Navy", "price": "$28.00", "unitAmount": 2800, "image": "assets/img/parlor-pagoda-frame-navy.png", "alt": "Pagoda Frame — Navy needle minder from The Parlor by House of Hendler", "description": "Navy enamel, polished gold detailing, and geometric fretwork give this pagoda frame a crisp, traditional finish. The open center and architectural silhouette make it a thoughtfully collected canvas accessory.", "etsyUrl": "cart.html?add=parlor-pagoda-frame-navy", "collection": "parlor", "inventoryQuantity": 19, "availability": "in_stock", "approved": true},
    {"id": "parlor-pagoda-frame-pink", "name": "Pagoda Frame — Pink", "price": "$28.00", "unitAmount": 2800, "image": "assets/img/parlor-pagoda-frame-pink.png", "alt": "Pagoda Frame — Pink needle minder from The Parlor by House of Hendler", "description": "A pink enamel pagoda frame outlined in polished gold, with geometric fretwork and an open center. A bright, considered accent inspired by the architectural details of a beautifully collected room.", "etsyUrl": "cart.html?add=parlor-pagoda-frame-pink", "collection": "parlor", "inventoryQuantity": 23, "availability": "in_stock", "approved": true},
    {"id": "parlor-bamboo-chair", "name": "Bamboo Chair", "price": "$28.00", "unitAmount": 2800, "image": "assets/img/parlor-bamboo-chair.png", "alt": "Bamboo Chair needle minder from The Parlor by House of Hendler", "description": "Pull up a chair. A bamboo-inspired frame, pale pink seat, and patterned pink chinoiserie cushion bring the look of a collected sitting room to your canvas. A timeless furnishing in miniature.", "etsyUrl": "cart.html?add=parlor-bamboo-chair", "collection": "parlor", "inventoryQuantity": 8, "availability": "in_stock", "approved": true},
    {"id": "parlor-curio-cabinet", "name": "Curio Cabinet", "price": "$28.00", "unitAmount": 2800, "image": "assets/img/parlor-curio-cabinet.png", "alt": "Curio Cabinet needle minder from The Parlor by House of Hendler", "description": "A pink curio cabinet filled with blue-and-white porcelain, finished with gold detailing and a blue tassel. Inspired by the pieces we gather and display, this needle minder brings a collected room to your canvas.", "etsyUrl": "cart.html?add=parlor-curio-cabinet", "collection": "parlor", "inventoryQuantity": 40, "availability": "in_stock", "approved": true},
    {"id": "parlor-accent-lamp", "name": "Accent Lamp", "price": "$28.00", "unitAmount": 2800, "image": "assets/img/parlor-accent-lamp.png", "alt": "Accent Lamp needle minder from The Parlor by House of Hendler", "description": "A blue-and-white patterned shade, green trim, and a white decorative base give this accent lamp its traditional character. Gold detailing and a gold finial complete a thoughtfully appointed furnishing for your canvas.", "etsyUrl": "cart.html?add=parlor-accent-lamp", "collection": "parlor", "inventoryQuantity": 22, "availability": "in_stock", "approved": true},
  ],

  currentYear: new Date().getFullYear(),
};

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
