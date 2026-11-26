# DreamSuit — Investor/Customer Site · PLAN

> Living plan. Decisions, design system, architecture, and the step list.
> Pair with `CHANGELOG.md` for the step-by-step history.

---

## 1. Brief & decisions

**Product.** DreamSuit — a dual-haptic wearable (TENS current + Piezo voltage) that
gates pediatric procedural pain and renders texture illusions in synchrony, turning a
needle stick into a gamified "mission." The moat: competitors are single-modality
(buzzers, VR distractors, passive TENS); **nobody achieves synchronized dual-haptic
embodiment.**

**Confirmed decisions (2026-11-25):**
| Decision | Choice |
|---|---|
| Primary audience | **Investors first** (clinical proof supports, below the fold) |
| Primary CTA | **Request the investor deck** |
| Hosting | **Custom domain** — placeholder `https://dreamsuit.com`, swap in `index.html` + `CNAME` |
| Content | **Clearly-marked placeholders** for all real stats/team/quotes — nothing fabricated as fact |
| Stack | Static HTML/CSS/vanilla JS, **no build step**, GitHub Pages ready |

**Open items the client must supply:** final domain, real TAM/traction numbers, team bios,
clinical/advisory logos, deck link or deck-request email address, regulatory status line.

---

## 2. Design system (tokens)

Direction is pinned by the two inspiration frames: a **clinical neuro-tech HUD** — deep-space
navy canvas, faint engineering grid, cyan signal accent, neon-magenta "charge" glow,
pass-green live states, glowing bordered telemetry panels, diegetic monospace readouts.

### Color — 6 named values
```
--void     #05070E   canvas, deep-space navy-black
--panel    #0B1220   raised telemetry panel surface
--signal   #2FE4E4   cyan — primary accent: live data, alignment locks, links
--pulse    #FF3DD8   neon magenta — emphasis / "charge" glow (used sparingly)
--pass     #38E88A   validated / PASS / engaged states
--text     #EAF2F8   primary text    (--muted #8DA2B8 secondary)
```
Support: `--amber #F5C542` (prep stage), `--grid rgba(90,130,170,.08)` (engineering grid).

### Type — three roles, deliberately not default
- **Display / headlines — "Space Grotesk"** (geometric technical grotesk). Carries the
  personality; used large, tight tracking. *Not* Inter-for-everything.
- **Body — "Inter"** 400/500, ≤70ch line length, sentence case.
- **Telemetry data — "IBM Plex Mono"** — **diegetic**: used ONLY for genuine instrument
  values (impedance `810 Ω`, `85 V P-P`, circuit IDs, status words). This is the product's
  own console vernacular, not decorative mono labels, so it is an intentional,
  subject-grounded choice rather than the generic "mono-for-small-labels" tell.

Type scale (1.25 major third): 0.78 / 0.875 / 1 / 1.25 / 1.563 / 1.953 / 2.441 / 3.815rem,
hero clamps larger.

### Layout
Full-bleed `--void` canvas with a persistent faint grid and a thin **left-edge circuit
progress rail** that charges as you scroll (echoes the stage bars in frame 2). Centered
reading column (~1080px); device/telemetry sections break wider into instrument panels.
**Text left-aligned** (instrument-like); only the hero statement is centered.

```
┌──────────────────────────────────────────────┐
│▐ [logo]                       Deck ▸  Nav     │  sticky header, rail on far left ▐
│▐                                              │
│▐           SYNCHRONIZED DUAL-HAPTIC           │  HERO (100vh, centered)
│▐             EMBODIMENT.                       │  live telemetry strip under headline
│▐        [ Request the investor deck ]          │
│▐                                              │
├▐─ THE SINGLE-MODALITY TRAP ───────────────────┤  PROBLEM (3 competitor columns, frame 1)
│▐  Buzzers │ Distractors │ Passive regulators  │  → neon verdict bar
├▐─ THE BREAKTHROUGH ───────────────────────────┤  SCIENCE (pain-gating + piezo + synchrony)
├▐─ THE DEVICE ─────────────────────────────────┤  TELEMETRY HUD (frame 2 recreated, live)
├▐─ THE MISSION ────────────────────────────────┤  STICKY 4-stage sequence (cinematic beat)
├▐─ WHY NOW / MARKET ───────────────────────────┤  moat + TAM [placeholders]
├▐─ TRACTION ───────────────────────────────────┤  milestones [placeholders]
├▐─ THE ASK ────────────────────────────────────┤  deck CTA + contact
└▐─ footer (safety/regulatory, nav) ────────────┘
```

### Principles
1. **Diegetic instrumentation** — the page behaves like DreamSuit's own console: data looks
   real, locks engage, bars charge. The UI *is* the argument.
2. **One cinematic moment** — the sticky Mission sequence. Everything else stays disciplined;
   no fade-up on every card.
3. **Spend boldness once** — magenta is the rare "charge" color; cyan is the workhorse.
   Quiet, instrument-grade everywhere else.

### Self-critique vs. generic-AI tells (frontend-design skill)
- Not cream/serif/terracotta; not generic SaaS cards. ✓
- Monospace confined to real data, never to eyebrow labels. ✓
- Numbered markers only where content is a true sequence (the 4 mission stages). ✓
- Accent-one-word headline treatment avoided; emphasis via the verdict bar / telemetry. ✓

---

## 3. Architecture / files
```
index.html            one page, all sections, full SEO/OG/Twitter/JSON-LD
styles/main.css       design system + components + responsive + reduced-motion
scripts/main.js       scroll reveals, progress rail, mission sequence, live telemetry
assets/
  favicon.svg         scalable mark
  favicon-32.png      raster fallback
  apple-touch-icon.png
  og-image.png        1200×630 social share banner
site.webmanifest      PWA manifest
sitemap.xml  robots.txt  CNAME  .nojekyll
README.md             deploy instructions
PLAN.md  CHANGELOG.md
```

## 4. SEO / social kit
- Title + description, canonical, theme-color.
- Open Graph (type, title, desc, url, image 1200×630, image:alt).
- Twitter `summary_large_image`.
- JSON-LD: `Organization` + `Product` (name, description, brand).
- `sitemap.xml`, `robots.txt`, `.nojekyll` (skip Jekyll), `CNAME` (custom domain).
- Favicon set + webmanifest + apple-touch-icon.

## 5. Quality floor
Responsive to mobile · visible keyboard focus · `prefers-reduced-motion` honored ·
AA contrast · no horizontal overflow · no layout shift from fonts (preconnect + swap).

---

## 6. Step list
1. ✅ Scaffold + PLAN + CHANGELOG
2. index.html — structure, copy, full meta/SEO/JSON-LD
3. main.css — design system + components
4. main.js — scroll experience + live telemetry
5. assets — favicon set + OG banner + manifest
6. SEO infra — sitemap/robots/CNAME/.nojekyll/README
7. Local preview, screenshot desktop+mobile, self-critique, polish
8. Final CHANGELOG pass + handoff notes
