# Umair Javaid Manj, Portfolio

Personal portfolio for **Umair Javaid Manj**, a cybersecurity and networking specialist (penetration testing, network security, threat intelligence, incident response).

Live: https://umair-jm.github.io

## About this site
A multi-page static site. Plain hand written HTML, CSS and vanilla JavaScript, with no framework and no build step. The structure (label to content rows, timezone widget, accent theme switcher) takes after the layout of gianmarcocavallo.com, rebuilt from scratch with original code. The look is a **jacket black background with red neon** accents, and red neon borders on every button.

```
index.html          home (hero, about, focus, stack, experience, certifications, contact)
certifications.html masonry grid of certifications
playground.html     security experiments and CTF writeups
travel.html         places lived and visited
guestbook.html      leave a message (stored locally in the browser)
now.html            what I'm focused on now
styles.css          design system and components
app.js              theme switcher, timezone widget, guestbook
favicon.svg         shield favicon
```

## Fonts
Satoshi, Cabinet Grotesk and Zodiak, served free from the Fontshare CDN (free for personal and commercial use). No other third party dependencies.

## Develop locally
Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000   # then visit http://localhost:8000
```

## Editing
All content is plain HTML. Colours and fonts are tokenised at the top of `styles.css` (`:root` is the dark neon theme, `[data-theme="light"]` is a warm light theme). The accent swatches in the top bar let visitors recolour the site; their choice is saved in `localStorage`.

(c) Umair Javaid Manj
