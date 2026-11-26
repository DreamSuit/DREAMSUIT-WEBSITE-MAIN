# DreamSuit — Investor/Customer Site

A single-page, dependency-free static site for **DreamSuit**, the synchronized
dual-haptic arm sleeve that gates needle distress across the lifespan — pediatric
immunizations and adult self-injection alike (GLP-1 regimens, Type 1 Diabetes insulin).
Built to deploy on GitHub Pages with no build step.

## Structure
```
index.html          # the whole page + SEO/OG/JSON-LD
styles/main.css     # design system (neuro-tech HUD)
scripts/main.js     # scroll experience + live telemetry (vanilla JS)
assets/             # favicon set + og-image.png
site.webmanifest    # PWA manifest
sitemap.xml robots.txt CNAME .nojekyll
PLAN.md CHANGELOG.md
```

## Deploy to GitHub Pages
1. Create a repo and push these files to the default branch (root, not `/docs`).
   ```bash
   git init && git add . && git commit -m "DreamSuit site"
   git branch -M main
   git remote add origin git@github.com:<you>/<repo>.git
   git push -u origin main
   ```
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   branch `main` / root. `.nojekyll` is included so Pages serves files as-is.
3. **Custom domain:** `CNAME` is set to `dreamsuit.com`. In Settings → Pages, enter the
   same domain and add these DNS records at your registrar:
   - `A` records for the apex → GitHub Pages IPs (185.199.108–111.153)
   - or a `CNAME` for `www` → `<you>.github.io`
   Enable **Enforce HTTPS** once the cert provisions.

## Before you publish — swap the placeholders
Search the repo for these and replace with real values:
- **Domain** `dreamsuit.com` → your domain, in: `index.html` (canonical, OG, Twitter,
  JSON-LD), `CNAME`, `robots.txt`, `sitemap.xml`, `site.webmanifest`.
- **Email** `invest@dreamsuit.com` / `hello@dreamsuit.com` in `index.html` (the two CTAs
  and the contact line). Or point the primary CTA at a deck link / data-room URL.
- **`[placeholder]` figures** — market size, needle-fear %, traction milestones, team.
  They are visibly tagged in the UI and in `index.html`.
- **Deck delivery** — the primary CTA is a `mailto:`. Swap for Docsend/Notion/data-room
  link, or wire a form service (Formspree etc.) if you want on-site capture.

## Regenerating the social banner / icons
The OG image and icons were rendered from HTML/SVG with headless Chrome. Source templates
live in the project scratchpad; the committed outputs are in `assets/`. To re-render, open
`assets/favicon.svg` or the OG template in a browser at 1200×630 and export, or re-run the
headless-Chrome screenshot step.

## Accessibility & performance
Responsive to mobile · keyboard-focusable · `prefers-reduced-motion` respected ·
AA contrast · no JS framework, no layout-shift (fonts preconnected + `display=swap`).
