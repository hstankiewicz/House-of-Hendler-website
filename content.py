# -*- coding: utf-8 -*-
"""Per-page body content for the House of Hendler site."""

# ---------------------------------------------------------------
# Small original line-art motif (chinoiserie urn + palm fronds)
# used sparingly to flank the collection heading.
# ---------------------------------------------------------------
def motif_svg(flip=False):
    scale = "scale(-1,1)" if flip else ""
    return f'''<div class="motif" aria-hidden="true">
  <svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg" transform="{scale}">
    <g fill="none" stroke="#3E5F91" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="60" cy="150" rx="22" ry="5"/>
      <path d="M42 148 q-2 -18 6 -30 q10 12 4 30"/>
      <path d="M78 148 q2 -18 -6 -30 q-10 12 -4 30"/>
      <path d="M60 148 v-26"/>
    </g>
    <g fill="none" stroke="#2E6B4C" stroke-width="1.6" stroke-linecap="round">
      <path d="M60 122 C 58 90 40 68 22 54 C 44 56 62 74 66 98 Z"/>
      <path d="M60 122 C 62 90 80 68 98 54 C 76 56 58 74 54 98 Z"/>
      <path d="M60 122 C 58 82 54 58 44 36 C 60 42 66 66 64 98 Z"/>
      <path d="M60 122 C 62 82 66 58 76 36 C 60 42 54 66 56 98 Z"/>
      <path d="M60 122 V 60"/>
    </g>
    <g fill="none" stroke="#BB9A4E" stroke-width="1">
      <circle cx="60" cy="140" r="3"/>
    </g>
  </svg>
</div>'''


ICON_PALM = '''<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 34V18"/><path d="M20 18c0-8-6-12-13-12 2 7 6 11 13 12z"/><path d="M20 18c0-8 6-12 13-12-2 7-6 11-13 12z"/><path d="M20 22c-2-6-8-8-14-6 3 5 8 7 14 6z"/><path d="M20 22c2-6 8-8 14-6-3 5-8 7-14 6z"/></svg>'''

ICON_MAIL_LG = '''<svg class="icon-mail-lg" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="5" y="10" width="30" height="22" rx="3"/><path d="M7 12 20 24 33 12"/></svg>'''


# =================================================================
# HOME
# =================================================================
def home_body():
    return f'''
<section class="hero">
  <div class="hero-grid">
    <div class="hero-copy">
      <span class="eyebrow">House of Hendler</span>
      <h1>Needlepoint gets a point of view.</h1>
      <p>Palm Beach color and chinoiserie pattern, starting with the Palm Bunny Collection.</p>
      <a class="btn btn-pink" href="#" data-etsy-link target="_blank" rel="noopener">Shop the Collection</a>
    </div>
    <div class="hero-media">
      <img src="assets/img/hero-palm-bunnies.jpg" alt="The Palm Bunny Collection: pink, green and navy enamel needle minders arranged in front of blue-and-white chinoiserie porcelain">
      <span class="hero-badge">The Palm Bunny Collection</span>
    </div>
  </div>
</section>

<section class="section bg-white" id="collection">
  <div class="container">
    <div class="motif-flanked">
      {motif_svg()}
      <div class="section-heading">
        <span class="eyebrow">The Launch Collection</span>
        <h2>The Palm Bunny Collection</h2>
        <div class="rule"></div>
      </div>
      {motif_svg(flip=True)}
    </div>

    <div class="product-grid" data-product-grid style="margin-top:44px;"></div>
  </div>
</section>

<section class="split">
  <div class="split-media">
    <img src="assets/img/story-card.jpg" alt="A Palm Bunny Pink needle minder displayed on its House of Hendler backing card, styled with fresh blooms and blue-and-white porcelain" width="1000" height="1000">
  </div>
  <div class="split-copy">
    <span class="eyebrow">How We Think</span>
    <h2>Interiors first. Needlepoint second.</h2>
    <p>House of Hendler brings the colors, patterns and pieces we love in interiors to the needlepoint table &mdash; Palm Beach lacquer, chinoiserie porcelain, a little bit of nerve.</p>
    <a class="btn btn-outline-navy" href="our-story.html">Our Story</a>
  </div>
</section>

<section class="section-tight bg-cream newsletter-wrap">
  <div class="newsletter-frame">
    <div class="newsletter-inner">
      <div class="newsletter-icon">{ICON_PALM}</div>
      <div class="newsletter-copy">
        <h2>More than bunnies is coming.</h2>
        <p>Join the list to hear about new drops first.</p>
      </div>
      <form class="newsletter-form" data-static-form aria-label="Newsletter signup" action="https://formspree.io/f/mjybyqpw" method="POST">
        <input type="hidden" name="_subject" value="New Newsletter Signup — House of Hendler">
        <input type="hidden" name="form_name" value="Newsletter">
        <label class="visually-hidden" for="newsletter-email">Email address</label>
        <input type="email" id="newsletter-email" name="email" placeholder="Email address" required>
        <button type="submit" class="btn btn-pink">Keep Me In The Loop</button>
      </form>
    </div>
  </div>
</section>

<section class="wholesale-band">
  <div class="container wholesale-inner">
    <div class="wholesale-copy">
      <span class="eyebrow" style="color:var(--hoh-gold-soft);">Wholesale</span>
      <h2>For the shops we love.</h2>
      <p>Interested in carrying House of Hendler? Let&rsquo;s talk.</p>
      <a class="btn btn-outline-light" href="wholesale.html">Wholesale Inquiries &rarr;</a>
    </div>
    <div class="wholesale-badge">
      <img src="assets/img/logo-monogram.png" alt="" width="116" height="116">
    </div>
  </div>
</section>

<section class="section bg-white">
  <div class="container">
    <div class="section-heading">
      <h2>Follow Along</h2>
      <p style="color:var(--hoh-pink); font-weight:600; letter-spacing:0.04em;" data-instagram-handle></p>
    </div>
    <div class="insta-grid">
      <a href="#" data-instagram-link target="_blank" rel="noopener" aria-label="View on Instagram"><img src="assets/img/pink-canvas.jpg" alt="Palm Bunny Pink needle minder resting on needlepoint canvas" loading="lazy"></a>
      <a href="#" data-instagram-link target="_blank" rel="noopener" aria-label="View on Instagram"><img src="assets/img/story-card.jpg" alt="Palm Bunny Pink on its House of Hendler backing card" loading="lazy"></a>
      <a href="#" data-instagram-link target="_blank" rel="noopener" aria-label="View on Instagram"><img src="assets/img/hero-palm-bunnies.jpg" alt="The Palm Bunny trio with chinoiserie porcelain" loading="lazy"></a>
      <a href="#" data-instagram-link target="_blank" rel="noopener" aria-label="View on Instagram"><img src="assets/img/trio-marble.jpg" alt="The Palm Bunny trio styled with embroidery thread and gold scissors" loading="lazy"></a>
      <a href="#" data-instagram-link target="_blank" rel="noopener" aria-label="View on Instagram"><img src="assets/img/green-solo.jpg" alt="Palm Bunny Green enamel needle minder detail" loading="lazy"></a>
      <a href="#" data-instagram-link target="_blank" rel="noopener" aria-label="View on Instagram"><img src="assets/img/blue-solo.jpg" alt="Palm Bunny Blue enamel needle minder detail" loading="lazy"></a>
    </div>
  </div>
</section>
'''


# =================================================================
# SHOP
# =================================================================
def shop_body():
    return f'''
<section class="page-banner">
  <div class="container">
    <span class="eyebrow">Shop</span>
    <h1>The Palm Bunny Collection</h1>
    <p>Pink, green and navy enamel needle minders, designed in-house with gold detailing.</p>
  </div>
</section>

<section class="shop-hero">
  <div class="shop-hero-media">
    <img src="assets/img/trio-marble.jpg" alt="The Palm Bunny trio in pink, green and blue, styled with embroidery thread and gold scissors">
  </div>
  <div>
    <span class="eyebrow">Launch Collection</span>
    <h2 style="margin-top:10px;">Needlepoint accessories with a point of view.</h2>
    <p style="color:var(--hoh-ink-soft); font-size:16px;">Each Palm Bunny is an enamel needle minder designed by House of Hendler, with a strong magnetic back &mdash; as at home on your needlepoint canvas as it is anywhere else. This is where House of Hendler starts; more is coming.</p>
    <a class="btn btn-navy" href="#" data-etsy-link target="_blank" rel="noopener">Shop on Etsy</a>
  </div>
</section>

<section class="section bg-white">
  <div class="container">
    <div class="section-heading">
      <span class="eyebrow">All Products</span>
      <h2>Palm Bunny Collection</h2>
      <div class="rule"></div>
    </div>
    <div class="product-grid" data-product-grid></div>
    <p style="text-align:center; color:var(--hoh-ink-soft); font-size:14px; margin-top:36px;">More collections are coming. Get on the list on the homepage to hear first.</p>
  </div>
</section>
'''


# =================================================================
# OUR STORY
# =================================================================
def our_story_body():
    return f'''
<section class="page-banner">
  <div class="container">
    <span class="eyebrow">Our Story</span>
    <h1>Interiors first. Everything else follows.</h1>
    <p>House of Hendler brings the colors, patterns and pieces we love in interiors to needlepoint &mdash; starting with the Palm Bunny Collection.</p>
  </div>
</section>

<section class="split">
  <div class="split-media">
    <img src="assets/img/pink-canvas.jpg" alt="Palm Bunny Pink needle minder resting on cross-stitch canvas mid-project" width="800" height="800">
  </div>
  <div class="split-copy">
    <span class="eyebrow">Where We Started</span>
    <h2>Good design shouldn&rsquo;t stop at the front door.</h2>
    <p>House of Hendler started with a simple idea: the objects on your needlepoint table should look like they belong in the rooms around them. Palm Beach color, chinoiserie motifs, a bit of lacquer-cabinet nerve &mdash; that&rsquo;s the House of Hendler point of view.</p>
    <p>Our first collection, the Palm Bunnies, brought that idea to life as a set of enamel needle minders designed in-house with gold detailing. They were made for the needlepoint table, but they&rsquo;ve found homes well beyond it.</p>
  </div>
</section>

<section class="split split-reverse">
  <div class="split-media">
    <img src="assets/img/story-card.jpg" alt="Palm Bunny Pink displayed on its House of Hendler backing card with fresh blooms and blue-and-white porcelain" width="800" height="800">
  </div>
  <div class="split-copy">
    <span class="eyebrow">Where We&rsquo;re Headed</span>
    <h2>More than a needlepoint brand.</h2>
    <p>The Palm Bunny Collection is our launch, not our identity. House of Hendler will grow into accessories, gifts and home pieces that share the same DNA: Palm Beach polish, chinoiserie influence and classic American style.</p>
    <p>Every piece will hold the same standard: strong color, specific detail, nothing generic.</p>
  </div>
</section>

<section class="section bg-green-soft">
  <div class="container">
    <div class="section-heading">
      <span class="eyebrow">What Guides Us</span>
      <h2>The House of Hendler point of view</h2>
      <div class="rule"></div>
    </div>
    <div class="product-grid" style="grid-template-columns:repeat(3,1fr); max-width:980px;">
      <div class="product-card" style="text-align:left;">
        <div class="info" style="padding:30px 26px;">
          <h3 style="font-size:19px;">Strong Color</h3>
          <p style="color:var(--hoh-ink-soft); font-size:14.5px; margin:0;">Bold, specific color pulled straight from the rooms we love &mdash; never an afterthought.</p>
        </div>
      </div>
      <div class="product-card" style="text-align:left;">
        <div class="info" style="padding:30px 26px;">
          <h3 style="font-size:19px;">Classic Motifs</h3>
          <p style="color:var(--hoh-ink-soft); font-size:14.5px; margin:0;">Chinoiserie, trellis, palm &mdash; patterns with history, used with intention.</p>
        </div>
      </div>
      <div class="product-card" style="text-align:left;">
        <div class="info" style="padding:30px 26px;">
          <h3 style="font-size:19px;">Real Design</h3>
          <p style="color:var(--hoh-ink-soft); font-size:14.5px; margin:0;">Every piece is designed in-house, not pulled from a catalog.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section-tight bg-white">
  <div class="container" style="text-align:center;">
    <h2 style="margin-bottom:20px;">See the collection for yourself.</h2>
    <a class="btn btn-pink" href="shop.html">Shop The Palm Bunny Collection</a>
  </div>
</section>
'''


# =================================================================
# WHOLESALE
# =================================================================
def wholesale_body():
    return f'''
<section class="page-banner" style="background:var(--hoh-green-deep); border-bottom:none;">
  <div class="container">
    <span class="eyebrow" style="color:var(--hoh-gold-soft);">Wholesale</span>
    <h1 style="color:#fff;">For the shops we love.</h1>
    <p style="color:rgba(255,255,255,0.82);">House of Hendler is building wholesale relationships with boutiques and needlepoint shops. If the Palm Bunny Collection fits your shelves, let&rsquo;s talk.</p>
  </div>
</section>

<section class="section bg-white">
  <div class="container">
    <div class="form-card">
      <h2 style="text-align:center; font-size:24px; margin-bottom:6px;">Wholesale Inquiry</h2>
      <p style="text-align:center; color:var(--hoh-ink-soft); font-size:14.5px; margin-bottom:28px;">Tell us about your shop and we&rsquo;ll be in touch.</p>

      <form data-static-form action="https://formspree.io/f/mjybyqpw" method="POST">
        <input type="hidden" name="_subject" value="New Wholesale Inquiry — House of Hendler">
        <input type="hidden" name="form_name" value="Wholesale Inquiry">
        <div class="field-row">
          <div class="field">
            <label for="ws-shop">Shop Name</label>
            <input type="text" id="ws-shop" name="shopName" required>
          </div>
          <div class="field">
            <label for="ws-contact">Your Name</label>
            <input type="text" id="ws-contact" name="contactName" required>
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="ws-email">Email</label>
            <input type="email" id="ws-email" name="email" required>
          </div>
          <div class="field">
            <label for="ws-website">Website / Instagram</label>
            <input type="text" id="ws-website" name="website">
          </div>
        </div>
        <div class="field">
          <label for="ws-message">Tell Us About Your Shop</label>
          <textarea id="ws-message" name="message" placeholder="Location, the kinds of brands you carry, order size you'd like to start with, etc."></textarea>
        </div>
        <button type="submit" class="btn btn-pink btn-block">Send Inquiry</button>
        <p class="form-note" data-form-success hidden>Thank you! Your inquiry has been noted &mdash; we&rsquo;ll be in touch soon.</p>
      </form>
    </div>
  </div>
</section>

<section class="section-tight bg-green-soft" id="stockists">
  <div class="container" style="text-align:center; max-width:600px;">
    <h2 style="font-size:24px;">Stockists</h2>
    <p style="color:var(--hoh-ink-soft);">We&rsquo;re just getting started. Check back soon for the shops carrying House of Hendler.</p>
  </div>
</section>
'''


# =================================================================
# CONTACT
# =================================================================
def contact_body():
    return f'''
<section class="page-banner">
  <div class="container">
    <span class="eyebrow">Contact</span>
    <h1>Get in touch.</h1>
    <p>Order questions, wholesale ideas, or just want to say hi &mdash; reach out below.</p>
  </div>
</section>

<section class="section bg-white">
  <div class="container">
    <div class="form-card">
      <div style="display:flex; align-items:center; gap:12px; justify-content:center; margin-bottom:26px; color:var(--hoh-green);">
        {ICON_MAIL_LG}
        <a href="#" data-contact-email style="font-weight:600; color:var(--hoh-navy);"></a>
      </div>

      <form data-static-form action="https://formspree.io/f/mjybyqpw" method="POST">
        <input type="hidden" name="_subject" value="New Contact Message — House of Hendler">
        <input type="hidden" name="form_name" value="Contact">
        <div class="field-row">
          <div class="field">
            <label for="c-name">Name</label>
            <input type="text" id="c-name" name="name" required>
          </div>
          <div class="field">
            <label for="c-email">Email</label>
            <input type="email" id="c-email" name="email" required>
          </div>
        </div>
        <div class="field">
          <label for="c-subject">Subject</label>
          <select id="c-subject" name="subject">
            <option>Order Question</option>
            <option>Product Question</option>
            <option>Press / Collaboration</option>
            <option>Something Else</option>
          </select>
        </div>
        <div class="field">
          <label for="c-message">Message</label>
          <textarea id="c-message" name="message" required></textarea>
        </div>
        <button type="submit" class="btn btn-pink btn-block">Send Message</button>
        <p class="form-note" data-form-success hidden>Thanks for reaching out &mdash; we&rsquo;ll reply as soon as we can.</p>
      </form>
    </div>
  </div>
</section>
'''


# =================================================================
# PLACEHOLDER POLICY PAGES
# =================================================================
def shipping_returns_body():
    return f'''
<section class="page-banner">
  <div class="container">
    <span class="eyebrow">Customer Care</span>
    <h1>Shipping &amp; Returns</h1>
  </div>
</section>
<section class="section bg-white">
  <div class="container prose">
    <div class="placeholder-note">
      <strong>Placeholder page.</strong> Replace the bracketed copy below with your real shipping and returns policy before launch.
    </div>

    <h2>Processing Time</h2>
    <p>[Add your processing time here &mdash; e.g., orders ship within 2&ndash;3 business days.]</p>

    <h2>Shipping</h2>
    <p>[Add your shipping carriers, rates and estimated delivery times here. Note your free-shipping threshold if you have one.]</p>

    <h2>Returns &amp; Exchanges</h2>
    <p>[Add your return window, condition requirements and how customers should start a return or exchange.]</p>

    <h2>Damaged or Missing Items</h2>
    <p>[Add instructions for what a customer should do if an item arrives damaged or an order goes missing.]</p>

    <h2>Questions</h2>
    <p>Reach out any time at <a href="#" data-contact-email style="color:var(--hoh-pink); font-weight:600;"></a>.</p>
  </div>
</section>
'''


def faq_body():
    faqs = [
        ("Are these needle minders magnetic?", "[Confirm magnet strength / backing details here.]"),
        ("How should I care for my Palm Bunny?", "[Add cleaning and care instructions here.]"),
        ("Do you ship internationally?", "[Add your shipping regions here.]"),
        ("Can I use a needle minder if I don't do needlepoint?", "[Add your suggested alternate uses here, e.g., pinning to a bag or using as a magnet.]"),
        ("Will there be more colors or collections?", "[Add a note about upcoming drops, or point customers to the email list.]"),
    ]
    items = "\n".join(
        f'''<details class="faq-item">
  <summary>{q}</summary>
  <p>{a}</p>
</details>'''
        for q, a in faqs
    )
    return f'''
<section class="page-banner">
  <div class="container">
    <span class="eyebrow">Customer Care</span>
    <h1>Frequently Asked Questions</h1>
  </div>
</section>
<section class="section bg-white">
  <div class="container prose">
    <div class="placeholder-note">
      <strong>Placeholder page.</strong> The questions below are a starting point &mdash; replace the bracketed answers with your own before launch.
    </div>
    {items}
  </div>
</section>
'''


def privacy_body():
    return f'''
<section class="page-banner">
  <div class="container">
    <span class="eyebrow">Legal</span>
    <h1>Privacy Policy</h1>
  </div>
</section>
<section class="section bg-white">
  <div class="container prose">
    <div class="placeholder-note">
      <strong>Placeholder page.</strong> This is not a real privacy policy. Replace with your own (or one generated by a service like Termly or a lawyer) before launch.
    </div>
    <h2>Information We Collect</h2>
    <p>[Describe what information you collect &mdash; e.g., email addresses from the newsletter signup, contact form submissions.]</p>
    <h2>How We Use Information</h2>
    <p>[Describe how customer information is used.]</p>
    <h2>Third-Party Services</h2>
    <p>[List any third-party tools you use &mdash; email marketing provider, Etsy, analytics, etc.]</p>
    <h2>Contact</h2>
    <p>Questions about this policy can be sent to <a href="#" data-contact-email style="color:var(--hoh-pink); font-weight:600;"></a>.</p>
  </div>
</section>
'''


def terms_body():
    return f'''
<section class="page-banner">
  <div class="container">
    <span class="eyebrow">Legal</span>
    <h1>Terms of Service</h1>
  </div>
</section>
<section class="section bg-white">
  <div class="container prose">
    <div class="placeholder-note">
      <strong>Placeholder page.</strong> This is not a real terms of service. Replace with your own before launch.
    </div>
    <h2>Orders</h2>
    <p>[Note that purchases are currently completed through Etsy, and link to your Etsy shop.]</p>
    <h2>Intellectual Property</h2>
    <p>[State that House of Hendler designs, photography and branding are your property.]</p>
    <h2>Limitation of Liability</h2>
    <p>[Add your standard liability language here.]</p>
    <h2>Contact</h2>
    <p>Questions can be sent to <a href="#" data-contact-email style="color:var(--hoh-pink); font-weight:600;"></a>.</p>
  </div>
</section>
'''


# =================================================================
# PAGE REGISTRY: filename -> (title, description, active-nav-href, body_fn)
# =================================================================
PAGES = {
    "index.html": (
        "House of Hendler | Needlepoint With A Point Of View",
        "House of Hendler brings Palm Beach color and chinoiserie style to needlepoint accessories, starting with the Palm Bunny Collection.",
        None,
        home_body,
    ),
    "shop.html": (
        "Shop The Palm Bunny Collection | House of Hendler",
        "Shop the Palm Bunny Collection: enamel needle minders in pink, green and blue, designed in-house with gold detailing. $24 each.",
        "shop.html",
        shop_body,
    ),
    "our-story.html": (
        "Our Story | House of Hendler",
        "House of Hendler brings Palm Beach color and chinoiserie style to needlepoint, launching with the Palm Bunny Collection.",
        "our-story.html",
        our_story_body,
    ),
    "wholesale.html": (
        "Wholesale | House of Hendler",
        "Interested in carrying House of Hendler in your shop? Learn about wholesale opportunities and send an inquiry.",
        "wholesale.html",
        wholesale_body,
    ),
    "contact.html": (
        "Contact Us | House of Hendler",
        "Get in touch with House of Hendler for order questions, wholesale inquiries or anything else.",
        "contact.html",
        contact_body,
    ),
    "shipping-returns.html": (
        "Shipping & Returns | House of Hendler",
        "Shipping and returns information for House of Hendler orders.",
        None,
        shipping_returns_body,
    ),
    "faq.html": (
        "FAQ | House of Hendler",
        "Frequently asked questions about House of Hendler and the Palm Bunny Collection.",
        None,
        faq_body,
    ),
    "privacy.html": (
        "Privacy Policy | House of Hendler",
        "House of Hendler privacy policy.",
        None,
        privacy_body,
    ),
    "terms.html": (
        "Terms of Service | House of Hendler",
        "House of Hendler terms of service.",
        None,
        terms_body,
    ),
}
