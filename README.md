# Umair Javaid Manj — Portfolio

Personal portfolio site for **Umair Javaid Manj** — cybersecurity researcher & educator, PhD candidate in Health AI at Auckland University of Technology.

🔗 **Live:** https://umair-jm.github.io

## Stack
Plain HTML, CSS and vanilla JavaScript — no build step. Hosted on GitHub Pages.
A few free, open-source front-end plugins are loaded from the jsDelivr CDN (no accounts, no API keys):

| Plugin | Use | License |
|---|---|---|
| [AOS](https://github.com/michalsnik/aos) | Scroll-reveal animations | MIT |
| [Typed.js](https://github.com/mattboldt/typed.js) | Animated typing in the hero | MIT |
| [tsParticles](https://github.com/tsparticles/tsparticles) | Security-network background | MIT |
| [Lucide](https://github.com/lucide-icons/lucide) | SVG icons | ISC |

All degrade gracefully — if a CDN is blocked, the site still renders fully (static text/icons fallback) and respects `prefers-reduced-motion`.

```
index.html    # all content / structure
styles.css    # design system, light + dark themes
script.js     # theme toggle, live Auckland clock, scroll-spy nav
favicon.svg   # shield favicon
```

## Develop locally
Just open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000   # then visit http://localhost:8000
```

## Editing content
All text lives in `index.html`. Sections: Hero, About, Stack & tools, Experience & research, Certifications, Education, Contact. Colours and fonts are tokenised at the top of `styles.css` (`:root` for light, `[data-theme="dark"]` for dark).

---
© Umair Javaid Manj
