# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static Hebrew landing page for "השקעות בלי חליפות" — an investment coaching brand by Nadav Michaeli. No build step, no framework, no package manager. Three files do everything.

## File Roles

- **index.html** — All markup. RTL Hebrew (`<html lang="he" dir="rtl">`). 13 sections in order: header, hero, pain, agitation, bridge, solution, process, FAQ, outcomes, about, testimonials, signup, footer.
- **style.css** — Design tokens in `:root`, then sections in the same order as the HTML. Mobile-first; breakpoints at 480 / 768 / 1024 / 1280px.
- **script.js** — Four responsibilities: sticky header, scroll animations (IntersectionObserver), FAQ accordion, form submissions (hero form + main signup form both POST to Formspree).
- **google-apps-script.js** — Not served on the page. Contains the Apps Script webhook code and setup instructions for a future Google Sheets integration (currently superseded by Formspree).

## Running Locally

Open `index.html` directly in a browser — drag the file into a browser window or use the file path. No server required.

## Key Integration Points

**Formspree endpoint** (`script.js` line 3):
```js
const FORMSPREE_URL = 'https://formspree.io/f/xaqvogor';
```
Both forms (hero + signup) POST JSON to this URL with fields: `name`, `phone`, `segment`, `date`, `time`.

**WhatsApp CTA** — search `972XXXXXXXXX` in `index.html` (appears twice) and replace with Nadav's real number in the format `972501234567`.

**About photo** — placeholder div in the About section. Replace with:
```html
<img src="assets/nadav.jpg" alt="נדב מיכאלי" class="about-photo" />
```

## Design System

All colors, spacing, and typography are CSS custom properties in `:root` at the top of `style.css`. Key tokens:
- `--color-accent: #6C63FF` (primary purple)
- `--color-accent-2: #FF6B6B` (coral, used for urgency/pain sections)
- `--gradient-cta` — used on all primary buttons and the signup card top border

## Deploying

Push to `main` on `https://github.com/michaelinadav15/landing-page` — GitHub Pages serves from that branch (Settings → Pages → Source: main).
