# Móveis Carina Maia

Static website for **Móveis Carina Maia**, a Portuguese custom furniture / upholstery workshop (Santo Tirso, Porto). Plain HTML/CSS/JS — no build step, no framework, no dependencies.

## Pages

| File | Description |
|---|---|
| [`index.html`](index.html) | Home page — hero, manifesto, "Ícones" highlight grid, "O Ofício" (craft) section, "O Processo" (4-step process), testimonial, and a closing CTA/contact banner. |
| [`colecoes.html`](colecoes.html) | Catalog — every piece from `dados.json`, filterable by category (Sofás, Cadeiras & Poltronas, Camas & Quartos, Outros Móveis), rendered as a masonry grid with a full-screen lightbox (supports photo and video angles per piece). |
| [`sobre-nos.html`](sobre-nos.html) | About — studio history, specialties, team (rendered from `dados.json`), an objective/stats section, and a contact section with an embedded Google Map. |

Shared elements (nav, mobile menu, footer, CTA buttons) are duplicated across the three pages as plain HTML/CSS since there's no templating layer.

## Content data — `dados.json`

Drives the parts of the site that shouldn't require touching HTML/JS to update:

- **`colecoes`** — the product catalog shown on `colecoes.html`, grouped by category folder (`Cadeiras_Poltronas`, `Camas_Quartos`, `Outros_Moveis`, `Sofas`). Each item has an `id`, `nome`, optional `descricao`, and an `imagens` array (photo/video paths, first one used as the grid thumbnail).
- **`team`** — the team cards on `sobre-nos.html`. Each member has `name`, `role`, `bio`, and either a `foto` (image path) or a `grad` (CSS gradient fallback avatar).

To add/remove a product or team member, edit `dados.json` — no other file needs to change.

## Structure

```
index.html, colecoes.html, sobre-nos.html   Pages
css/style.css                                All styling (shared + page-specific + responsive)
js/common.js                                 Mobile nav menu (all pages)
js/reveal.js                                 Scroll-triggered fade-in for `.reveal` elements
js/colecoes.js                                Catalog: fetches dados.json, renders grid, filters, lightbox
js/sobre-nos.js                               About: renders team + specialties from dados.json
dados.json                                    Product catalog + team content
assets/                                       Logo, hero/background imagery
uploads/                                      Product photos & videos, grouped by category folder
```

## Running locally

No build step — any static file server works, e.g.:

```
npx serve .
```

Then open the printed local URL.

## Notes

- Fonts (Newsreader, Manrope, Material Symbols) are loaded from Google Fonts at runtime — an internet connection is needed for correct typography.
- The Google Maps embed on `sobre-nos.html` also requires an internet connection.
- This repo contains only the finished site. Design source files, raw photo dumps, and working notes live outside this repo in the parent project folder.
