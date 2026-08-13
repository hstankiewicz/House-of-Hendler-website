#!/usr/bin/env python3
"""Static site builder for House of Hendler.
Combines shared header/footer with per-page content into flat,
self-contained HTML files (no runtime fetch/includes needed)."""

import os

OUT_DIR = os.path.dirname(os.path.abspath(__file__))

NAV_ITEMS = [
    ("SHOP", "shop.html"),
    ("OUR STORY", "our-story.html"),
    ("WHOLESALE", "wholesale.html"),
    ("CONTACT", "contact.html"),
]

# ---------- small inline icon svgs ----------
ICON_INSTAGRAM = '''<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>'''
ICON_MENU = '''<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>'''
ICON_MAIL = '''<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 6.5 12 13l8-6.5"/></svg>'''


def head(title, description, canonical_path):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="https://houseofhendler.com{canonical_path}">

<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://houseofhendler.com{canonical_path}">
<meta property="og:image" content="https://houseofhendler.com/assets/img/hero-palm-bunnies.jpg">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="assets/img/logo.png">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
'''


def header(active):
    def nav_link(label, href):
        current = ' aria-current="page"' if href == active else ""
        return f'<a href="{href}"{current}>{label}</a>'

    nav_links = "\n      ".join(nav_link(l, h) for l, h in NAV_ITEMS)

    return f'''<header>
  <div class="announcement-bar">
    <div class="announcement-track container" data-announcement-track></div>
  </div>

  <div class="site-header">
    <div class="header-inner">
      <a href="index.html" class="brand-logo" aria-label="House of Hendler — home">
        <img src="assets/img/logo.png" alt="House of Hendler logo" width="140" height="164">
      </a>

      <nav class="main-nav" aria-label="Primary">
      {nav_links}
      </nav>

      <div class="header-icons">
        <a href="#" data-instagram-link target="_blank" rel="noopener" aria-label="House of Hendler on Instagram">{ICON_INSTAGRAM}</a>
        <button type="button" class="nav-toggle" data-nav-toggle aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav">{ICON_MENU}</button>
      </div>
    </div>

    <nav class="mobile-nav" id="mobile-nav" data-mobile-nav aria-label="Mobile">
      {nav_links}
    </nav>
  </div>
</header>
'''


def footer():
    return f'''<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <img src="assets/img/logo.png" alt="House of Hendler logo" width="120" height="140">
        <p>Palm Beach color, chinoiserie motifs, needlepoint essentials.</p>
        <div class="footer-social">
          <a href="#" data-instagram-link target="_blank" rel="noopener" aria-label="Instagram">{ICON_INSTAGRAM}</a>
          <a href="#" data-contact-mailto aria-label="Email us">{ICON_MAIL}</a>
        </div>
        <a href="#" data-contact-email class="footer-email"></a>
      </div>

      <div class="footer-col">
        <h4>Shop</h4>
        <ul>
          <li><a href="shop.html">Palm Bunny Collection</a></li>
          <li><a href="shop.html">All Products</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Our Story</h4>
        <ul>
          <li><a href="our-story.html">Our Story</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Wholesale</h4>
        <ul>
          <li><a href="wholesale.html">Wholesale Inquiries</a></li>
          <li><a href="wholesale.html#stockists">Stockists</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Customer Care</h4>
        <ul>
          <li><a href="shipping-returns.html">Shipping &amp; Returns</a></li>
          <li><a href="faq.html">FAQ</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <span>&copy; <span data-current-year></span> House of Hendler. All rights reserved.</span>
      <div class="legal-links">
        <a href="privacy.html">Privacy Policy</a>
        <a href="terms.html">Terms of Service</a>
        <a href="contact.html">Contact Us</a>
      </div>
    </div>
  </div>
</footer>

<script src="assets/js/config.js"></script>
<script src="assets/js/main.js"></script>
</body>
</html>
'''


def page(title, description, path, active, body):
    return head(title, description, path) + header(active) + "\n<main>\n" + body + "\n</main>\n" + footer()


def write(filename, html):
    with open(os.path.join(OUT_DIR, filename), "w") as f:
        f.write(html)
    print("wrote", filename)


# Content for each page is imported from content.py to keep this file focused on structure.
if __name__ == "__main__":
    from content import PAGES
    for filename, (title, description, active, body_fn) in PAGES.items():
        write(filename, page(title, description, "/" + filename if filename != "index.html" else "/", active, body_fn()))
