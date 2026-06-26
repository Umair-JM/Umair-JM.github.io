# Umair Javaid Manj — Portfolio

Personal portfolio for **Umair Javaid Manj** — cybersecurity researcher & educator, PhD candidate in Health AI at Auckland University of Technology.

🔗 **Live:** https://umair-jm.github.io

## About this site
A multi-page, static site. **Plain hand-written HTML, CSS and vanilla JavaScript — no framework, no build step.** The layout and design system (warm palette, label → content rows, timezone widget, accent theme switcher) are modeled on the structure of [gianmarcocavallo.com](https://gianmarcocavallo.com), rebuilt from scratch with original code and adapted to a security/research profile.

```
index.html          # home (hero, about, stack, contact, socials, local time)
certifications.html # masonry grid of certifications
playground.html     # security experiments / CTF write-ups
travel.html         # places lived & visited
blog.html           # writing (placeholder)
guestbook.html      # leave a message (stored locally in the browser)
now.html            # what I'm focused on now
styles.css          # design system + components
app.js              # theme switcher, timezone widget, guestbook
favicon.svg         # shield favicon
```

## Fonts
[Satoshi](https://www.fontshare.com/fonts/satoshi), [Cabinet Grotesk](https://www.fontshare.com/fonts/cabinet-grotesk) and [Zodiak](https://www.fontshare.com/fonts/zodiak) — served free from the Fontshare CDN (free for personal & commercial use). No other third-party dependencies.

## Develop locally
Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000   # then visit http://localhost:8000
```

## Editing
All content is plain HTML. Colours/fonts are tokenised at the top of `styles.css` (`:root` light, `[data-theme="dark"]` dark). The accent swatches in the top bar let visitors recolour the site; their choice persists in `localStorage`.

---
© Umair Javaid Manj
