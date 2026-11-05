# Swatchproof

Turn one brand color into a full palette, and see which combinations people can read.

**Live demo:** https://kyungkwon01.github.io/swatchproof/

## Features

- **Palette generation:** creates a 10-step brand scale and a matching neutral scale from one color.
- **Contrast checking:** tests every pair in the brand scale against WCAG AA and AAA, for normal and large text.
- **Live preview:** shows the palette on a sample form in light and dark mode, with the contrast of each element.
- **Color blindness simulation:** shows the palette and preview as they may appear with protanopia, deuteranopia, tritanopia, or achromatopsia.
- **Color blindness check:** retests each element for all four types and flags pairings that fall below the contrast minimum, even when the real colors pass.
- **Export:** copies the palette as CSS variables or a Tailwind v4 theme.
- **Sharing:** keeps the color and name in the URL, so any palette can be shared with a link.

## How it works

Everything runs in the browser. There is no backend, database, or account.

- **Even color steps:** the scale is built in OKLCH rather than HSL. Equal lightness values in HSL can look very different across hues, because yellow looks far brighter than blue. OKLCH is designed around how people perceive color, so steps look even.
- **Colors that stay on hue:** OKLCH can describe colors a screen can't show. When that happens, a binary search lowers the chroma until the color fits, because clipping the RGB channels would shift the hue.
- **Your exact color stays in the scale:** it replaces the step closest in lightness, so the brand color appears unchanged.
- **Honest ratios:** contrast ratios are rounded down, so 4.499 shows as 4.49 rather than a passing-looking 4.50.
- **Light URL updates:** URL writes are debounced because dragging in the color picker fires constantly and browsers throttle `history.replaceState`.
- **Color blindness simulation:** colors are multiplied by the severity 1.0 matrices from [Machado, Oliveira, and Fernandes (2009)](https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html), applied in linear RGB because they model light.
- **Real values stay real:** hex labels, copied values, exports, and WCAG scores always use the actual colors. Only the display changes.

### Limits of the color blindness check

The simulation is an estimate, and people's color vision varies. WCAG doesn't define a contrast check on simulated colors, so a "Low" result is a warning to look closer, not a compliance failure.

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

Every push to `main` runs the tests, builds the app, and deploys it to GitHub Pages through [GitHub Actions](.github/workflows/deploy.yml).
