# House of Hendler — Website

A static, responsive website for House of Hendler built with plain HTML/CSS/JS
(no build step required — just open index.html or deploy the folder as-is).

## Structure

```
index.html              Homepage
shop.html                Shop / Palm Bunny Collection
our-story.html            Brand story
wholesale.html            Wholesale info + inquiry form
contact.html               Contact form
shipping-returns.html      Placeholder policy (fill in before launch)
faq.html                    Placeholder FAQ (fill in before launch)
privacy.html                 Placeholder privacy policy (fill in before launch)
terms.html                    Placeholder terms (fill in before launch)

assets/css/style.css     All site styles (design tokens at the top)
assets/js/config.js       *** EDIT THIS FILE to update: ***
                             - announcement bar messages
                             - Etsy shop URL
                             - Instagram handle/URL
                             - contact email
                             - product names, prices, images, and
                               per-product Etsy listing links
assets/js/main.js          Powers the config → page wiring, mobile nav,
                             and the product grid rendering
assets/img/                 Your logo + real product photography
build.py, content.py        The Python templating scripts used to generate
                             the HTML pages (only needed if you want to
                             regenerate the site after editing content.py —
                             not required for normal deployment)
```

## To update prices, links, or copy later
Open `assets/js/config.js` — it's a single, well-commented file. Change a
value, save, and refresh; every page pulls from it automatically.

## To deploy
Upload the whole folder to any static host (Netlify, Vercel, GitHub Pages,
Squarespace's file hosting, etc.) or point houseofhendler.com at it. No
server or database required.

## Before launch, still needs from you
- Real Etsy listing URLs for each Palm Bunny color (currently all point to
  your shop homepage as a placeholder)
- Real copy for Shipping & Returns, FAQ, Privacy Policy, and Terms of
  Service (each page is clearly marked as a placeholder)
- Connect the newsletter and wholesale/contact forms to an email or form
  service (Formspree, Airtable, Mailchimp, etc.) — they're fully styled
  and structured but not wired to a backend yet
