# Swatchproof

Turn one brand color into a full palette, and see which combinations people can read.

**Live demo:** _add your link here_

## Features

- **Palette generation:** creates a 10-step brand scale and a matching neutral scale from one color.
- **Contrast checking:** tests every pair in the brand scale against WCAG AA and AAA, for normal and large text.
- **Live preview:** shows the palette on a sample form in light and dark mode, with the contrast of each element.
- **Export:** copies the palette as CSS variables or a Tailwind v4 theme.
- **Sharing:** keeps the color and name in the URL, so any palette can be shared with a link.

## How it works

Everything runs in the browser. There is no backend, database, or account.

- **Even color steps:** the scale is built in OKLCH rather than HSL. Equal lightness values in HSL can look very different across hues, because yellow looks far brighter than blue. OKLCH is designed around how people perceive color, so steps look even.
- **Colors that stay on hue:** OKLCH can describe colors a screen can't show. When that happens, a binary search lowers the chroma until the color fits, because clipping the RGB channels would shift the hue.
- **Your exact color stays in the scale:** it replaces the step closest in lightness, so the brand color appears unchanged.
- **Honest ratios:** contrast ratios are rounded down, so 4.499 shows as 4.49 rather than a passing-looking 4.50.
- **Light URL updates:** URL writes are debounced because dragging in the color picker fires constantly and browsers throttle `history.replaceState`.

The color conversion and contrast math are written from scratch in [`src/color`](src/color), with no color library.

## Run it locally

```bash
npm install
npm run dev
```

## Test and build

```bash
npm test
npm run build
```

## Deploy

Connect the repo to Vercel or Netlify. Use `npm run build` as the build command and `dist` as the output folder.
