# Halenoir font files

Halenoir is a commercial typeface (by René Bieder) — it can't be bundled or
fetched from a CDN, so drop the licensed `.woff2` files here:

```
public/fonts/halenoir-regular.woff2     (weight 400)
public/fonts/halenoir-medium.woff2      (weight 500)
public/fonts/halenoir-semibold.woff2    (weight 600)
public/fonts/halenoir-bold.woff2        (weight 700)
public/fonts/halenoir-black.woff2       (weight 800 — used for headings)
```

`app/globals.css` already declares the `@font-face` rules pointing at these
paths. Until the files are present the site falls back to the system sans stack
— nothing breaks, it just isn't Halenoir yet.

(If your licence only ships `.otf`/`.ttf`, convert to `.woff2` first, e.g. with
`npx fonttools` or an online converter, and keep the filenames above.)
