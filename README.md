# Abrands: protein snacks website (concept demo)

A 3D shop for **Abrands** (Acup · Abar · Abites · Abutter, Instagram [@abrands_int](https://www.instagram.com/abrands_int/)).
Plain HTML/CSS/JS, no build step. Three.js and the fonts are bundled in `assets/`.

> **Concept demo.** The site is marked `noindex`, shows "Concept demo", uses **placeholder prices**, and orders are not sent.
> Keep it this way until Abrands approves.

## What's inside

| File | What it does |
|---|---|
| `index.html` | Page and all styles (dark, sporty; each brand recolors the whole page) |
| `scene.js` | 3D product studio with real soft shadows: Acup tub (clear plastic, cream + crumble, foil + printed lid), Abar pillow bar with its real wrapper, Abites carton, Abutter jar. Drag to spin. |
| `app.js` | Brand switcher, shop + protein finder, Acup scroll story with real photos (Grab it · Open it · Enjoy it · Repeat), country cards with WhatsApp buttons, mix box (any 10 products, −10%), countries, cart → WhatsApp, wholesale form |
| `data.js` | Brands, products, prices, countries, box deal. **Edit prices here** (between the AB-CONFIG markers). |
| `assets/img` | Product art cut from Abrands' Instagram posts (replace with the original files for sharper images) |

## Before launch (confirm with Abrands)

- **Invasion photo**: the card uses a placeholder until we get the real product photo.
- **Real prices** for every product (all prices now are placeholders; Carrefour lists Acup Kunafa 80 g at 286,670 LL ≈ $3.20).
- The full flavor list (Carrefour also lists Vanilla & Dates, Red Berries, Invasion, Vanilla Marvel).
- Protein per Abar bar (pack says 33%) and the Abutter jar size.
- Original product photos (current images come from screenshots).
- Delivery fees per country; whether the mix-box discount is something they want.

## Going live

1. `data.js`: set real prices, `"pricesConfirmed": true`, and `"whatsapp": "9617189537"` (orders then open WhatsApp with the full order).
2. `index.html`: remove the `noindex` meta, the "Concept demo" tag and the footer disclaimer.
3. Optional: the AK Bowl owner panel + order tracker can be added (same engine).
