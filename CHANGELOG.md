# Changelog — DreamSuit Site

All notable changes to the DreamSuit investor/customer site.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).
Dates are absolute (YYYY-MM-DD).

## [Unreleased]

### 2026-11-25 — Step 1: Project scaffold & plan
- Established project in `DREAMSUIT - BRAND DESIGN AND UI/`.
- Confirmed direction with client: **investor-led**, CTA **"Request the investor deck"**,
  **custom domain** (`dreamsuit.com` placeholder), **marked placeholders** for real data.
- Wrote `PLAN.md`: design-token system (neuro-tech HUD — void navy / cyan signal /
  magenta charge / pass green), type roles (Space Grotesk · Inter · IBM Plex Mono as
  diegetic telemetry), layout concept, section architecture, SEO kit, quality floor.
- Created `CHANGELOG.md` (this file).

### 2026-11-25 — Step 2: HTML structure + SEO
- Built `index.html`: header + hero + problem (single-modality trap) + science +
  device console + sticky mission + market + traction + ask + footer.
- Investor-led narrative; CTA = **Request the investor deck** (`mailto:` placeholder).
- Full meta: title/description/keywords, canonical, Open Graph, Twitter `summary_large_image`,
  theme-color, favicon/manifest links, and JSON-LD (`Organization` + `Product`).
- All unverifiable figures tagged `[placeholder]` inline.

### 2026-11-25 — Step 3: CSS design system
- `styles/main.css`: palette, type roles (Space Grotesk / Inter / IBM Plex Mono),
  fixed engineering-grid canvas + scroll progress rail, buttons, sticky header.
- Components: telemetry strip, trap grid, neon verdict bar, science pillars,
  device console (circuits + impedance + meters + safety pills), sticky mission,
  market moat + count-up stats, traction timeline, ask card, footer.
- Responsive breakpoints (920 / 560), full `prefers-reduced-motion` fallback, AA focus states.

### 2026-11-25 — Step 4: Scroll experience (JS)
- `scripts/main.js` (vanilla, no deps): IntersectionObserver reveals, rAF-throttled
  scroll loop, charging progress rail, count-up numbers, and the scroll-scrubbed
  **4-stage sticky mission sequence**. Reduced-motion + mobile static fallbacks.

### 2026-11-25 — Step 5: Brand assets
- `assets/favicon.svg` (cyan→magenta radiant node mark), rendered to `favicon-32.png`
  and `apple-touch-icon.png` (180), plus `og-image.png` (1200×630 social banner).
- Rendered from HTML/SVG via headless Chrome; `site.webmanifest` added.

### 2026-11-25 — Step 6: SEO infra + deploy files
- `sitemap.xml`, `robots.txt`, `CNAME` (dreamsuit.com), `.nojekyll`, and `README.md`
  with GitHub Pages deploy steps + the placeholder-swap checklist.

### 2026-11-25 — Step 7: Review & polish
- Local preview + headless-Chrome screenshot review (desktop, mobile, mission at depth).
- **Fix:** mission panels overlapped into unreadable text during the crossfade. Reworked
  to opaque, z-indexed panels with an asymmetric transition (outgoing clears fast,
  incoming fades in delayed over its own background) + inner-content reveal. Verified
  stage/panel sync across all four phases. No horizontal overflow at 390px.

#### Open items for the client
- Confirm final domain; swap `dreamsuit.com` + CTA email / deck link.
- Replace all `[placeholder]` figures and traction milestones with verified data.
- Optional: wire a form service if on-site email capture is desired.
