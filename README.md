# YesYes (prototype)

Next.js (App Router, TS) static export, deployed to GitHub Pages by `.github/workflows/pages.yml`.
- `/` RU, `/en/` EN (hreflang, sitemap, robots, manifest via Next metadata APIs)
- `lib/legacy-app.js` — game logic ported 1:1 from the vanilla prototype (runs in a client component); `lib/markup.ts` — shared markup; `data/deck.json` — cards
- Old static version: branch `static-legacy`
- Local: `npm ci && npm run build` (set `BASE_PATH=""` for root hosting, e.g. Vercel)
- Next step: split markup into React components, add Supabase/API routes (needs a non-export host such as Vercel).
