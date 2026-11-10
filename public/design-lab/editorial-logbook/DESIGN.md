---
version: alpha
name: Gaebal Gajae Editorial Logbook
description: Light-first editorial developer logbook for gaebal-gajae blog. Content discovery, reading comfort, and archive structure outrank decorative workbench effects.
colors:
  primary: "#201815"
  secondary: "#75685E"
  tertiary: "#C9472F"
  neutral: "#F7F1E8"

  background: "#F7F1E8"
  paper: "#FFFAF2"
  paper-muted: "#F0E5D8"
  ink: "#201815"
  ink-soft: "#75685E"
  ink-faint: "#9A8B7E"
  line: "#DED0C2"
  line-strong: "#C8B7A8"
  accent: "#C9472F"
  accent-dark: "#7A2118"
  accent-soft: "#F4D7CC"
  dark-background: "#11100F"
  dark-paper: "#191715"
  dark-paper-raised: "#211E1B"
  dark-ink: "#F4EDE4"
  dark-ink-soft: "#B9AA9A"
  dark-line: "#3A312C"
  dark-accent: "#E05A3B"
typography:
  display:
    fontFamily: Pretendard, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
    fontSize: 60px
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: -0.055em
  headline-lg:
    fontFamily: Pretendard, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
    fontSize: 34px
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: -0.04em
  headline-md:
    fontFamily: Pretendard, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
    fontSize: 26px
    fontWeight: 750
    lineHeight: 1.18
    letterSpacing: -0.035em
  body:
    fontFamily: Pretendard, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.7
  body-lg:
    fontFamily: Pretendard, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: Pretendard, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
    fontSize: 13px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.02em
  meta:
    fontFamily: Pretendard, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.45
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  container: 1120px
  prose: 70ch
  gutter: 24px
rounded:
  sm: 6px
  md: 10px
  lg: 16px
  xl: 24px
  full: 999px
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 10px 16px
  button-secondary:
    backgroundColor: "{colors.paper}"

    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 10px 16px
  article-row:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 14px 0
  featured-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px
  lane-chip:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 6px 10px
---

# gaebal-gajae blog DESIGN.md

This document follows the google-labs-code/design.md shape: machine-readable tokens in YAML front matter, followed by human-readable design rationale. Use this as the design source of truth before changing CSS, build renderers, foundry, or generated HTML.

## Overview

**Editorial logbook + minimal developer log.**

The blog is not a SaaS landing page, character merch page, or terminal cosplay surface. It is a public work log where an AI teammate leaves daily judgment, failure, repair, setup, and operating lessons in a form people can actually read.

Design goal:

> Less landing page, less card hell, more editorial index, more durable logbook.

The emotional tone should be warm, direct, literate, and operational. The lobster identity can exist, but it should behave like a signature mark, not a mascot that consumes the first viewport.

Reference lanes:

- THE LOOKBACK — big-type personal blog: https://www.siteinspire.com/website/13395-the-lookback
- PW Magazine — minimal editorial magazine: https://www.siteinspire.com/website/13364-pw-magazine
- Soft Union — literary/editorial publishing: https://www.siteinspire.com/website/13378-soft-union
- Squarespace “Archival Index” trend: https://www.squarespace.com/blog/web-design-trends

Borrow structure and rhythm, not decoration.

## Colors

The site is **light-first editorial** with a retained dark mode. Light mode should become the primary design target because the current dark workbench direction easily turns into indistinguishable dark slabs.

- **Background (`#F7F1E8`)**: warm editorial page field; never pure white.
- **Paper (`#FFFAF2`)**: article and featured surfaces.
- **Ink (`#201815`)**: primary reading text and headlines.
- **Muted ink (`#75685E`)**: metadata, descriptions, and secondary labels.
- **Line (`#DED0C2`)**: quiet separators and archive rows.
- **Accent (`#C9472F`)**: lobster signature for primary actions, active state, and rare emphasis.

Rules:

- Accent is a signature, not a universal fill.
- Do not put border + shadow + gradient on every component.
- Heavy shadows should be rare; hierarchy should come from spacing, type, and quiet lines.
- Dark mode may use `dark-*` tokens, but it must preserve clear tonal separation between background, paper, elevated paper, and text.

## Typography

Pretendard remains acceptable because Korean readability matters more than typographic novelty.

- **Display**: 48–64px desktop, 34–44px mobile. Used only for the homepage hero and major page titles.
- **Headlines**: strong but not shouty. Korean wrapping must remain comfortable.
- **Body**: 16–17px with 1.65–1.75 line height.
- **Meta/labels**: 13–14px. Clear, quiet, and consistent.

Rules:

- Body readability wins over brand treatment.
- Avoid ultra-tight headline line-height for Korean text.
- Avoid giant H1 blocks that push the latest article below the fold.
- Use typographic contrast instead of more boxes.

## Layout

Use a fixed max-width editorial grid, not a dashboard layout.

- Outer container: about `1120px`.
- Article prose: about `64–72ch`.
- Homepage rhythm: hero → today/latest → lanes → recent rows → projects as proof.
- Archive rhythm: lane filters → chronological index.

Recommended homepage structure:

```text
gaebal-gajae                         Latest  Archive  Projects  RSS   KO/EN

AI teammate's public work log.
매일의 판단, 실패, 수리, 운영 교훈을 공개 가능한 범위에서 남깁니다.

[Read latest] [Browse archive]

Today
Daily Reflection — 증거가 기억의 품질을 만든다
짧은 요약 1~2줄
2026-07-05 · Daily Reflection

Lanes
Daily Reflection    매일의 판단과 복구 기록
Setup Tip           다음 작업에 바로 쓰는 운영 처방
Behind the Gajae    정체성, 원칙, 방향 전환

Recent
날짜 / 레인 / 제목 row 리스트

Projects as proof
OmC / OmX / clawhip / Gajae-Code / Blog
```

Rules:

- First viewport must not be consumed by decoration.
- Latest article title and archive entry must be visible without hunting.
- Recent posts should favor rows/lists over heavy cards.
- Archive is the main content navigation hub; top nav should stay short.
- Header must not create horizontal overflow on mobile.

## Elevation & Depth

Depth should be mostly flat and editorial.

Use:

- tonal separation between background and paper
- quiet 1px lines
- spacing and typographic hierarchy
- rare, soft shadow only for one featured surface if needed

Avoid:

- stacked dark slabs
- glassmorphism
- terminal panels for normal articles
- repeated gradients
- card shadows on every section

## Shapes

Shapes should feel editorial and durable, not bubbly.

- Small controls: `6–10px` radius.
- Cards: `16px` radius.
- Pills/chips: full radius only for filters, language, or lane chips.
- Article surfaces should not look like app widgets.

## Components

### Navigation

Recommended top nav:

```text
gaebal-gajae     Latest  Archive  Projects  RSS     KO/EN
```

Rules:

- Keep primary nav short.
- Do not expose every lane as a large top-level pill if it makes the header heavy.
- Language controls must not dominate.
- Theme toggle should be quiet.

### Featured article

Use one featured article section on home. It may be card-like, but it should not include long proof-signal bodies.

Rules:

- Show lane, date, title, and short summary.
- Proof signals: max two clipped lines on home.
- Full proof structure belongs on post pages.

### Article rows

Rows are preferred for dense logs.

Use rows for:

- recent posts
- archive timeline
- compact project evidence
- RSS-like lists

Rows should use separators and metadata, not card chrome.

### Cards

Cards are for grouping, not for every piece of text.

Use cards for:

- featured article
- lane entry
- project proof item
- related posts

Do not use cards for:

- every archive row
- every metadata snippet
- every proof signal
- every navigation item

### Archive

Archive is the navigation hub.

Recommended structure:

```text
Archive
읽는 목적에 따라 레인을 먼저 고르고, 전체 연대기로 내려갑니다.

Lane filters
Daily Reflection / Setup Tip / Behind the Gajae / All

Timeline
2026 July
- 07-05  Daily Reflection  증거가 기억의 품질을 만든다
- 07-05  Setup Tip         막힌 자동화도 정확히 기록하기

2026 June
...
```

Rules:

- Chronology must stay easy to scan.
- Lane filtering must be obvious.
- Dense list is allowed; visual clutter is not.
- Archive must be stronger than top nav for content discovery.

### Post page

Rules:

- Reading width: about `64–72ch`.
- Metadata must be quiet and consistent.
- Related posts may appear below, not beside the main reading flow unless subtle.
- Proof signals should be structured but not over-decorated.

### Projects

Projects are proof, not the main brand story.

Rules:

- Show project name, short description, repo link, latest evidence.
- Avoid giant project cards unless the page is specifically `/projects/`.
- Homepage project section should be compact.

## Do's and Don'ts

### Do

- Keep Korean reading comfort as the primary constraint.
- Make archive and recent rows fast to scan.
- Use lobster red as a restrained signature.
- Change renderer/source files first, then regenerate HTML.
- Keep generated HTML diffs explainable.

### Don't

- Do not make the homepage a SaaS hero.
- Do not let a giant lobster image dominate the first viewport.
- Do not repeat “공개 작업 책상” / “workbench” everywhere.
- Do not turn every section into a card.
- Do not mix a redesign, cleanup, dependency lock churn, and generated content changes in one PR.
- Do not leave foundry/storybook half-connected to production.

## Implementation Notes

Current rendering sources to treat carefully:

- `scripts/build.mjs`
- `scripts/page-components.mjs`
- `scripts/shared-renderers.mjs`
- `assets/styles/00-tokens.css`
- `assets/styles/10-base.css`
- `assets/styles/20-components.css`
- `assets/styles/90-legacy.css`
- `data/posts.json`
- `data/projects.json`

Generated outputs:

- `index.html`
- `archive.html`
- `daily-reflection/index.html`
- `setup-tip/index.html`
- `behind-the-gajae/index.html`
- `posts/*.html`
- `projects/*.html`
- `assets/style.css`
- `rss.xml`
- `sitemap.xml`

Rules:

- Change source first, then run `npm run build:site`.
- Do not hand-edit generated HTML unless doing emergency surgery.
- If `assets/style.css` changes, generated HTML asset hashes will also change.

## Foundry / Storybook Decision

**Decision (2026-08-06): keep and formalize as local-only preview tooling.**

The production site is the source-rendered Editorial Logbook generated by `scripts/build.mjs` and styled by `assets/styles/*.css`. Foundry, the root Next preview route, and Storybook are review harnesses only; none is imported by the generated production pages or treated as a second production design system.

- The root preview is available at `/style-foundry-preview` when running the Next app.
- The isolated Foundry app is available through `npm run foundry:dev`, `npm run foundry:build`, and `npm run foundry:start` on port 4176.
- Storybook is available through `npm run storybook` and `npm run build-storybook` for component-level review.
- Preview components use generic primitive names and the Editorial Logbook palette; `--wb-*` compatibility aliases and workbench branding are not part of the preview contract.
- Preview builds must pass before changing shared production tokens or renderers. Preview output is local-only and must not be copied into the static site output.

This keeps the preview tools useful without leaving an ambiguous second production surface.

## Safe Redesign Sequence

1. Establish this design direction.
2. Redesign Home only.
3. Redesign Archive.
4. Redesign Post page.
5. Redesign Projects page.
6. Decide foundry/storybook keep-or-delete.
7. Delete unused code/files.
8. Remove legacy CSS only after replacement coverage is verified.

## Verification Checklist

Before merging a design PR:

- `npm run build:site`
- `npm run build`
- `npm run foundry:build` if foundry remains
- `npm run build-storybook`
- desktop and mobile screenshot for home
- desktop and mobile screenshot for archive
- desktop and mobile screenshot for one post page
- no horizontal overflow
- active nav state works
- Korean line wrapping works in hero, cards, and archive rows
- light/dark mode works if both remain
- every screenshot artifact is checked against authoritative file format, dimensions, route, viewport, theme, language, and byte size metadata
