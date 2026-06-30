# Umair Javaid Manj, Cybersecurity Portfolio

Personal portfolio for **Umair Javaid Manj**, a cybersecurity and networking specialist in
Auckland (security operations, threat intelligence, incident response, network defense and applied
security research).

Live: https://umair-jm.github.io

## Stack
React + Vite + framer-motion. Jacket black with red neon accents. Animated reveals, staggered
lists, cursor spotlight cards and magnetic buttons, all built on framer-motion with a small
in-repo component library (`src/lib/motion.jsx`).

```
src/
  main.jsx            app entry, BrowserRouter
  App.jsx             routes (home, certifications, research)
  index.css           design system + tokens
  data.js             all content
  lib/motion.jsx      Reveal, Stagger, SpotlightCard, Magnetic
  components/          TopBar, Footer, LocalTime
  pages/              Home, Certifications, Research
public/
  favicon.svg         shield favicon
  404.html            SPA fallback for GitHub Pages deep links
.github/workflows/    deploy.yml builds and publishes to GitHub Pages
```

## Develop locally
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
```

## Deploy
Pushing to `main` triggers the GitHub Actions workflow, which builds and publishes to GitHub Pages.
Pages source must be set to "GitHub Actions" in the repository settings.

(c) Umair Javaid Manj
