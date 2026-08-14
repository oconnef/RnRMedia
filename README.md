# R&R Media — static site

Plain HTML / CSS / JS. No build step, no framework, no dependencies.
Drop the contents of this folder at your repo root and GitHub Pages serves it as-is.

```
index.html          Home
services.html       Services
css/styles.css      Shared: base, ticker, nav, reveal, buttons, forms, footer
css/home.css        Home page only
css/services.css    Services page only
js/app.js           Shared: ticker feed, nav scroll/shrink, mobile menu, reveal, lead tracking
js/services.js      Services only: accordion, phone carousel, ads audience switcher
assets/             Images (JPEG for photography, PNG where transparency is needed)
trends/feed.json    Trending crawl data
```

## Updating the trending crawl

Edit `trends/feed.json` and commit. Both pages fetch it at load and re-poll every
15 minutes, so no rebuild is needed.

```json
{
  "updatedAt": "2026-08-14T14:00:00Z",
  "items": [
    { "source": "google", "title": "…", "traffic": "2M+ searches", "url": "https://…" }
  ]
}
```

`source` must be one of `google`, `tiktok`, `instagram`, `reddit`, `youtube` — it
selects the icon and colour. `updatedAt` drives the "UPD hh:mm" cell on the right.
If the file is missing or malformed, the ticker falls back to a built-in list and
logs a warning to the console.

## Contact form

`index.html` holds the only form. It posts nowhere yet — point `<form action>` at
your handler (Formspree, Netlify Forms, your own endpoint).

Five hidden fields record which CTA sent the visitor there:

| field | example |
| --- | --- |
| `lead_cta` | `Start a pipeline →` |
| `lead_section` | `ugc-pipeline` |
| `lead_page` | `services` |
| `lead_clicked_at` | `2026-08-14T18:22:05.114Z` |
| `lead_entry` | `services › ugc-pipeline › Start a pipeline →` |

Any link to `#contact` is tracked, on either page. The value survives the
cross-page jump from the services page via `sessionStorage`.

## Deep links

`services.html#ugc-pipeline`, `#social-media`, `#casting`, `#targeted-ads`,
`#consultation` open that service and scroll it under the nav.

## Notes

- Fonts load from the Google Fonts CDN (Archivo Black, Sora, DM Serif Display).
  Self-host them if you'd rather not depend on it.
- Palette: `#080707` background, `#0D0B0B` panels, `#F4F0EC` text, `#C8191A` red.
- The nav markup is duplicated in both pages. If you edit it, edit both.
- The hero graphic is a placeholder for the showreel video — swap
  `.hero-media img` for a `<video>` when the reel is ready.
