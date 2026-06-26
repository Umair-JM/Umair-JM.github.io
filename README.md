# Umair Javaid Manj — Portfolio

Personal portfolio site for **Umair Javaid Manj** — cybersecurity researcher & educator, PhD candidate in Health AI at Auckland University of Technology.

🔗 **Live:** https://umair-jm.github.io

## Stack
Plain HTML, CSS and a little vanilla JavaScript — no build step, no dependencies. Hosted on GitHub Pages.

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
