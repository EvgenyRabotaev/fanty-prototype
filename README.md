# YesYes (prototype)

Next.js (App Router, TS) static export, deployed to GitHub Pages by `.github/workflows/pages.yml`.
- `/` RU, `/en/` EN (hreflang, sitemap, robots, manifest via Next metadata APIs)
- `lib/legacy-app.js` — game logic ported 1:1 from the vanilla prototype (runs in a client component); `lib/markup.ts` — shared markup; `data/deck.json` — cards
- Old static version: branch `static-legacy`
- Local: `npm ci && npm run build` (set `BASE_PATH=""` for root hosting, e.g. Vercel)
- Next step: split markup into React components, add Supabase/API routes (needs a non-export host such as Vercel).

## Two-phone room (beta)
`lib/room.js` — peer-to-peer rooms over WebRTC via PeerJS and its free public broker (0.peerjs.com, no account).
Host taps «Создать комнату» → 5-char code + QR (`#join=CODE`, respects BASE_PATH and /ru/). The host phone
computes matches in memory and drops raw answers right after; both phones mirror the host's state
(survey → result/fallback → game → end). Test: `python3 scripts/e2e_room.py <base-url>`.
