# Changelog — DreamSuit Site

All notable changes to the DreamSuit investor/customer site.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).
Dates are absolute (YYYY-MM-DD).

## [Unreleased]

### 2026-11-25 — Step 9: Engineering schematic in the Device section
- **Incorporated** the client's DreamSleeve anterior/posterior engineering schematic as
  `assets/schematic.png` (resized to 1600w) — placed as the Device section's lead figure
  above the live console, in a matching bordered panel with alt text + diegetic figcaption.
  The four schematic circuits (11 Biceps/Deltoid, 12 Triceps, 13 Posterior Forearm, 14
  Anterior Forearm) map 1:1 to the four circuits the live console reads.
- **Recreated the editable pieces as live SVG/HTML** (per client choice — vectorize the
  parts worth editing, keep the render for the arms):
  - **Fig. 02 — piezo actuator cross-section**: inline SVG layer stack (protective polymer →
    gold/ceramic/gold/ceramic/gold electrodes → flexible substrate) with a bending-displacement
    cue. All labels are editable text.
  - **Circuit index**: editable HTML table (circuit · muscle group · anterior/posterior view)
    with cyan/amber accent dots.
- Two-column detail block collapses to one column ≤920px; no horizontal overflow at 360–390px.

### 2026-11-25 — Step 8: Pediatric focus + Game & Regulatory sections
- **Reverted** an exploratory adult/GLP-1 "lifespan" broadening back to a **pediatric-only**
  focus, per client direction. Hero, meta, JSON-LD, mission, market all back to children.
- **New section — "Play the pathogen" (`#game`).** The gamified narrative made concrete:
  - Diegetic **Game Selector** panel that auto-scales the visual narrative + haptic texture
    profile by developmental age cohort (2–3 / 4–6 / 7–9 / 10+), active row highlighted.
  - **Pathogen game tiles** — Flu-Zilla (influenza), Corona Crusher (COVID-19), and a
    "one villain per vaccine" library card; titles tagged `[illustrative]`.
  - **Practice → Compete → Rank** flywheel: free home app (username) → harder device-linked
    version in-clinic → global/local **leaderboards**, with a diegetic leaderboard panel
    (mono rows, "you" row highlighted). Scores tagged `[placeholder]`.
- **New section — "Cleared to ship now" (`#pathway`).** Three-stage regulatory/commercial
  on-ramp: **Stage 01 NOW** — FDA General Wellness (clinics + home, LIVE); **Stage 02 NEXT** —
  RCT data → Class II clearance (IN TRIALS); **Stage 03 SCALE** — Medicaid EPSDT reimbursement
  + HSA/HRA DTC (PLANNED). Reuses the `.pill` vocabulary; added a `--plan` amber pill.
- **Footer legal rewritten** to the accurate General Wellness posture (not a cleared device;
  Class II / EPSDT described as planned pathways).
- Header + footer nav updated (Game, Pathway); keywords + Product JSON-LD enriched (gamified,
  General Wellness). New CSS appended; new grids collapse to 1 column ≤920px.
- Verified in headless Chrome (desktop): both sections on-brand, JSON-LD valid, tags balanced,
  all nav anchors resolve. No JS changes needed — new elements reuse `[data-reveal]`.

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
