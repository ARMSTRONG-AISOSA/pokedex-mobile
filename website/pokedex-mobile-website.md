# Dexplorer website

The promotional site for the Dexplorer app: one page that explains what the app does and links to the Android download. It lives in `website/` in the app's repository and will be published with GitHub Pages at **https://armstrong-aisosa.github.io/pokedex-mobile/**.

Status: **live since 2026-11-05** at https://armstrong-aisosa.github.io/pokedex-mobile/ (published by `.github/workflows/pages.yml`).

---

## 1. Design

### 1.1 Principles

1. **It should feel like the app.** Same colors, fonts, corner radii, type pills, tinted cards and motion curves. Someone who installs the app after visiting the site should recognize it instantly. Tokens are copied from `src/theme/tokens.ts` and `DESIGN.md`; if the app's tokens change, change them here too.
2. **Show the real app.** Screenshots come from the app on a device, never mock-ups. Feature text describes only what the app actually does.
3. **One goal: the download.** Every section leads to the "Download for Android" button. There are two of them: one in the hero, one in the download section.
4. **Plain words.** Same voice as the app (DESIGN.md §10): sentence case, short sentences, no filler, no hype words.

### 1.2 Color

Light and dark palettes are the app's, unchanged. The page follows the visitor's system setting until they press the theme button; their choice is then remembered.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--bg` | `#ffffff` | `#0e1618` | Page background |
| `--surface` | `#ffffff` | `#162226` | Base of tinted cards and pills |
| `--field` | `#e9f0ee` | `#162226` | Split-section bands, icon button |
| `--ink` | `#13222b` | `#e8f1f0` | Headings, body text, focus ring |
| `--muted` | `#55666e` | `#94a7ac` | Secondary text |
| `--line` | `#d3dfdc` | `#263a3f` | Borders and dividers |
| `--rule` | `#94a9a9` | `#4a666b` | Reserved (matches the app) |

**Brand colors.** Like the app's launch screen, these never change with light or dark mode:

| Token | Value | Used for |
|---|---|---|
| `--brand-bg` | `#13222b` | Hero and download card background |
| `--brand-ink` | `#ffffff` | Text on the brand background |
| `--brand-muted` | `#b9c9cc` | Secondary text on the brand background |
| `--ball-red` | `#e8453c` | Poké Ball top, step numbers |
| `--cta` / `--cta-hover` | `#c03028` / `#a5281f` | Download buttons |

**Why the button isn't `#e8453c`.** White text on `#e8453c` is only about 3.9:1, below the 4.5:1 minimum. `#c03028` is the app's deep Fighting color, already checked against white text in the app.

**Type colors** are the app's 18 approved pairs: `c` (bright) and `d` (deep), listed in `src/theme/tokens.ts`. On the site they are passed per element as CSS variables:

- **Feature cards:** `--t` (bright) and `--td` (deep). The card background is `color-mix(--t 16%, --surface)` and the border is `color-mix(--t 30%, --line)`, the same recipe as the app's Pokémon cards. The icon circle is `--td` with a white icon.
- **Type pills:** background `color-mix(--t 24%, --surface)` and a dot in `--t`, the same as the app's `TypePill`.

The six feature cards use Grass, Water, Fire, Dragon, Electric and Fairy, so the page shows the full type palette without repeating a color.

### 1.3 Typography

Same families as the app, loaded from Google Fonts: **Bricolage Grotesque** (700, 800) for display text and **Figtree** (400, 500, 600) for everything else.

| Role | Font | Size / line height | Letter spacing |
|---|---|---|---|
| Hero headline (h1) | Bricolage 800 | `clamp(44px, 7vw, 76px)` / 0.98 | −0.035em |
| Section title (h2) | Bricolage 800 | `clamp(32px, 4.4vw, 46px)` / 1.04 | −0.03em |
| Card title (h3) | Bricolage 700 | 22px / 1.2 | −0.02em |
| Fact numbers | Bricolage 800 | 40px (32px on phones) | −0.03em |
| Wordmark | Bricolage 800 | 22px (header), 20px (footer) | −0.03em |
| Body | Figtree 400 | 17px / 1.55 (16px on phones) | 0 |
| Lede | Figtree 400 | 18–19px | 0 |
| Kicker (small label above a title) | Figtree 600 | 14px, uppercase | +0.08em |
| Buttons | Figtree 600 | 16px | 0 |

The body text is a little larger than the app's (17px rather than 16px) because a web page is read from further away and in longer passages.

### 1.4 Shape and spacing

| Token | Value | From the app |
|---|---|---|
| `--r-card` | 22px | Pokémon cards and team slots |
| `--r-btn` | 16px | "Clear team" and other buttons |
| `--r-pill` | 999px | Chips and type pills |
| `--r-sheet` | 28px | The add-to-team sheet (used for the download card) |

- **Layout:** content width is `--wrap` (1120px), with a 20px side gutter (16px on phones).
- **Spacing:** sections have 96px of vertical padding (72px on phones), feature cards have a 16px gap, and the gallery has a 20px gap.
- **Touch targets:** every link, button and the theme toggle is at least 44px tall, matching the app's rule.

### 1.5 Components

| Component | What it is | App equivalent |
|---|---|---|
| Header | Sticky, blurred background, the app icon next to the wordmark, nav links, round theme button | List header + theme button |
| Primary button | `--cta` background, white text, download icon, scales to .97 when pressed | Card press feedback |
| Ghost button | Outline on the brand background ("View the code") | n/a |
| Feature card | Tinted card, deep-colored icon circle, title, one short paragraph | Pokémon card |
| Type pill | Tinted pill with a colored dot | `TypePill` |
| Phone frame | `#0b1417` bezel, 34px outer radius, 27px screen radius, soft shadow | n/a (shows real screenshots) |
| Facts strip | Four big numbers with labels, separated by thin lines | Stat totals |
| Split section | Phone on one side, kicker + title + text + dot list on the other; sides alternate | n/a |
| Gallery | Row of phone frames with captions; swipes sideways on phones | n/a |
| Download card | Brand background, button, three numbered install steps | Launch screen colors |
| Footer | Wordmark; “Designed and built by Bossstrong-Dev” linking to the developer portfolio (https://bossstrong-dev.vercel.app/), GitHub, MIT License, PokéAPI credit, fan-project disclaimer | n/a |

**Icons.** The icons are the app's own: search, moon, sun, heart, shield and sparkle, on a 24×24 grid with a 2px round stroke. Four new ones are drawn in the same style: evolution tree, offline, download and code. They are defined once in an inline SVG sprite and used with `<use>`.

### 1.6 Motion

The site uses the app's curves (`theme/motion.ts`): `--ease-out` = `cubic-bezier(0.22, 1, 0.36, 1)` and `--ease-overshoot` = `cubic-bezier(0.3, 1.4, 0.5, 1)`. Like the app, it follows one rule: **motion happens on load or in response to the visitor, and nothing loops.**

| Name | Trigger | What happens | Timing |
|---|---|---|---|
| Launch ball | Page load | The hero's Poké Ball drops in from −90px, wobbles (−14° → 12° → −6° → 3° → 0), then a white glow bursts behind it. A shortened version of the app's launch animation; the ball stays as a logo instead of splitting open | Drop 450ms overshoot; wobble 600ms, delay 450ms; glow 550ms, delay 1050ms |
| Hero phones | Page load | The two phones (side by side, overlapping, not tilted) rise 44px and fade in, staggered | 700ms `out`, second phone +120ms |
| Scroll reveal | A section enters the viewport | Rises 14px and fades in, once | 500ms `out` |
| Button press | Press | Scales to .97 | 150ms `out` |
| Nav hover | Hover | Background fades to `--field` | 200ms `out` |

**Reduced motion** (`prefers-reduced-motion: reduce`): the launch ball and phone rises are skipped, scroll reveals show instantly, the button doesn't scale, and smooth scrolling is turned off.

### 1.7 Imagery

- **Screenshots:** real screenshots from the app at the device's full resolution (800×1187 from the tablet), cropped to the app area (no Android status or navigation bar), **lossless WebP** (40–100 KB each; lossy compression and downscaling made small app text blurry). Made with `tools/make-screens.py`. Always shown inside the phone frame and never rotated (browsers soften rotated images).
- **Share preview:** `assets/og-image.png`, 1200×630. Brand background, Poké Ball, the "Dexplorer" wordmark in the app's font, the tagline, and two tilted phones. Generated by `tools/make-og-image.py`.
- **Favicon and header logo:** `assets/favicon.svg`, the app icon (the “explorer lens”: the Poké Ball as a magnifying glass on `#13222b`). App icon PNGs are generated by `scripts/make-icons.py` from the same shapes.
- **No Pokémon artwork outside screenshots.** The page shows the app, not Nintendo's art, and the footer carries the same fan-project disclaimer as the README.

### 1.8 Accessibility

- A "Skip to content" link appears on the first Tab press, and the visible focus ring is a 3px `--ink` outline, the same as the draft.
- The page uses semantic landmarks (`header`, `nav`, `main`, `footer`), one `h1`, and headings in order. Each section is labelled by its heading.
- Every screenshot has alt text describing what it shows. Decorative SVGs are `aria-hidden`. The theme button's label says what it will do ("Switch to dark mode").
- Text contrast is at least 4.5:1 in both themes and on the brand background. The type pills always show the type name, so type is never shown by color alone.
- Text uses relative sizing and the layout reflows down to 320px wide; the gallery scrolls sideways and can be reached with the keyboard.

### 1.9 Copy

| Element | Text |
|---|---|
| Headline | "Every Pokémon, even offline." |
| Lede | "Dexplorer is a fast, free Pokédex for Android. Search all 1,025 Pokémon, follow their evolution trees, and build a team that covers its weak spots." |
| Main button | "Download for Android" (hero), "Download the APK" (download section) |
| Requirements | "Android 7.0 or newer · No account · No ads" |

Android 7.0 is the minimum version React Native 0.88 and Expo SDK 58 support (`minSdk` 24). Use typographic quotes and apostrophes (“ ” ’), as in the app.

---

## 2. Architecture

### 2.1 Stack

Plain **HTML, CSS and JavaScript**. There's no framework, no build step and no npm packages. The page is one screen of content, so a framework would add weight and a build pipeline without adding anything the visitor would notice. The only third-party request is Google Fonts.

### 2.2 Files

```
website/
├── index.html                  The page (content, meta tags, inline SVG icon sprite)
├── styles.css                  All styles, in numbered sections (tokens → base → … → reduced motion)
├── main.js                     Theme toggle and scroll reveal (about 60 lines)
├── assets/
│   ├── favicon.svg
│   ├── og-image.png            Share preview (generated)
│   └── screens/*.webp          App screenshots, 800×1187 lossless
├── tools/
│   ├── make-screens.py         Crops raw device screenshots into screens/*.webp
│   └── make-og-image.py        Rebuilds og-image.png from the screenshots
└── pokedex-mobile-website.md   This document
```

### 2.3 Theming

- **Where the colors live.** They are CSS custom properties on `:root`. The dark palette is applied in two places: under `@media (prefers-color-scheme: dark)`, guarded by `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]`. Brand colors are defined once and never change.
- **The theme button.** It sets `data-theme` on `<html>` and saves the choice in `localStorage` under `dexplorer-theme`. Storage access is wrapped in try/catch, so private browsing just forgets the choice.
- **No flash on load.** A tiny inline script in `<head>` applies the saved theme before the first paint. Without it, the page could flash the wrong colors.
- **Following the system.** If the visitor never picked a theme, the button's icon and label follow live changes to the system setting.

### 2.4 JavaScript

`main.js` is loaded with `defer` and does two things:

1. **Theme toggle** (§2.3).
2. **Scroll reveal.** It adds a `js` class to `<html>`, and only then does the CSS hide `.reveal` elements, so the page is fully readable with JavaScript turned off. An `IntersectionObserver` adds `.in` to each element once as it enters the viewport, then stops watching it. Browsers without `IntersectionObserver` simply show everything.

### 2.5 Download link

Both download buttons point to `https://github.com/ARMSTRONG-AISOSA/pokedex-mobile/releases/latest`. GitHub redirects that address to the newest release, so the site never needs editing for a new version: publish a GitHub Release with the APK attached and the buttons point to it.

Until the first release exists, the link opens an empty Releases page. **Don't share the site before the first release is up** (§2.9).

### 2.6 Hosting

The site will be published with **GitHub Pages from the `website/` folder, using a GitHub Actions workflow** (`.github/workflows/pages.yml`, added when shipping). The workflow uploads `website/` and deploys it whenever something in `website/` changes on `main`.

| | Choice | Why |
|---|---|---|
| Host | GitHub Pages | Free, HTTPS, same repo as the code |
| Source | Actions workflow deploying `website/` | Pages' "deploy from a branch" option only serves the repo root or `/docs`. `website/` is a clearer name and keeps the app's files out of the published site |
| URL | `https://armstrong-aisosa.github.io/pokedex-mobile/` | GitHub's default for this repo; a custom domain can be added later |

All paths in the page are relative (`styles.css`, `assets/…`), so the site works both from the `/pokedex-mobile/` subpath and when opened as a local file. The Open Graph tags use absolute URLs because social networks require them.

### 2.7 Performance budget

| Asset | Size |
|---|---|
| HTML + CSS + JS | about 32 KB uncompressed |
| Screenshots | about 600 KB for all nine (lossless); below-the-fold images use `loading="lazy"` |
| Share image | about 185 KB (only fetched by social networks) |
| Fonts | 5 font files from Google Fonts, `display=swap` |

Images have `width` and `height` set, so the layout doesn't jump as they load. Target: fully loaded in under 2 seconds on a mid-range phone over 4G.

### 2.8 Testing

Check before every publish:

- **Render in Chrome:** light and dark mode, at 1280px (desktop) and 390px (phone). The headless Chrome on this laptop can screenshot the page (`chrome-headless-shell --screenshot --window-size=…`).
- **Behaviour:**
  - The theme button switches and the choice survives a reload.
  - The page still reads with JavaScript disabled.
  - Keyboard: Tab reaches the skip link, the nav, both buttons and the gallery, with a visible focus ring on each.
  - With reduced motion turned on, nothing animates.
- **Links:** both download buttons reach the latest release (the APK is attached), and the GitHub links work.
- **Sharing:** paste the URL into a chat app and the preview image and title appear.

### 2.9 Shipping checklist (first release)

- [x] **Screenshots from the release APK** (1.0.0, tablet), processed with `python3 website/tools/make-screens.py RAW_DIR`; share image rebuilt with `python3 website/tools/make-og-image.py`.
- [x] **First GitHub Release** published: [v1.0.0](https://github.com/ARMSTRONG-AISOSA/pokedex-mobile/releases/tag/v1.0.0) with `dexplorer-1.0.0.apk`.
- [x] **`.github/workflows/pages.yml`** added; Pages enabled with source “GitHub Actions” (done with `gh api`).
- [x] Live URL checked (page, assets, share image, download link → v1.0.0); link added to the app's README.

### 2.10 Decisions

| # | Decision | Why | Alternatives considered |
|---|---|---|---|
| W-1 | Static HTML/CSS/JS, no build | One page; fastest to load and simplest to maintain | React or Astro: a build step for no visible gain |
| W-2 | Lives in `website/` in the app repo | One place for code, docs and site; the site's screenshots come from the app | A separate repo: two places to keep in sync |
| W-3 | Deploy with an Actions workflow | Lets the folder be called `website/` | Pages from `/docs`: the name suggests documentation |
| W-4 | Download through `releases/latest` | The site never needs changing for a new version | A direct APK file link: breaks with every release |
| W-5 | Shortened launch animation (the ball doesn't split open) | The ball stays on screen as a logo; a full split would leave an empty space | The full app animation |
| W-6 | Download button `#c03028`, not the ball red | Passes 4.5:1 contrast with white text | `#e8453c`: about 3.9:1, fails |
