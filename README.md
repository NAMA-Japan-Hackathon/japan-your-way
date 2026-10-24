# Japan, Your Way

A Japan-wide travel website with a Groq-powered adaptive planner, a context-aware travel assistant, and optional sourced flight/hotel searches.

## Run locally

Use Node 22 or later.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. `npm run build` produces a Next.js server build. Run `npm start` to serve it. The AI endpoints require a Node/serverless runtime; a static `out/` deployment cannot run them. `npm test` runs the domain tests; `npm run typecheck` checks TypeScript.

## Implemented

- A dark, native 4K Fuji and pagoda photograph with layered, native-scroll animation.
- A second scroll scene expanding a Kyoto garden photograph.
- Reduced-motion and no-script reading layouts; locally served GSAP and font assets.
- Three sample trip routes, month/interest/pace filters, and route details.
- An adaptive Groq interview with a visible traveler profile, daily trip generation, local saved copies and text downloads.
- A persistent Japan travel chat using active AI trip context.
- Optional SerpApi Google Flights/Hotels search snapshots in INR for the Indian market; missing credentials/details are explicit.
- Deterministic daily scheduling, operating-window/overlap/pace checks, group pricing, and explicit unpriced costs.
- Replacing, moving, adding, removing, and locking items; time edits and undo.
- Local save/reopen/rename/duplicate/delete, a shareable text snapshot, and a simulated provider inquiry.
- Help/privacy information and complete image credits.

A direct sample is available at `/plan/?sample=1`. Saved plans use `/plan/?id=...` on the same browser. These are local identifiers, not cross-device share links.

## Architecture and scope

The app uses Next.js, React, TypeScript and GSAP. Server-only route handlers call Groq and optional price sources; no provider credentials are sent to the browser. Conversations and saved trips live in browser storage, with no conversation database or account system. The request contents and active trip context go to Groq. See [AI setup and limitations](docs/ai-planner.md).

The old pure fixture planner in `src/lib/planner.ts` remains for existing `/plan/?id=...` saved samples and `/plan/?sample=1` references. Its prices, operating windows and supplier arrangements remain illustrative. New `/plan/` sessions use the AI conversation. Sample itinerary sections have been removed from the homepage.

AI budget allowances are estimates. SerpApi results are separate search snapshots, not independently verified MakeMyTrip/Agoda inventory or reservations. No payment, ticketing, hotel booking, automatic push or deployment is performed.

## Art direction

The original Taste Skill direction is “The product performs,” seed 1154879022; the app style is “Achromatic ledger,” seed 554352894. After the first preview, the owner requested dark silhouettes and strong scroll motion, then supplied https://floria-landing-page.vercel.app/ as a reference.

The revision takes its dark field, large type, sculptural composition, and staggered photography as inspiration. The original Japanese silhouette, content, controls, and scroll choreography are specific to this product. The night palette supersedes the initial stone palette. The page uses the device system UI font for controls and reading, with Cormorant Garamond for display typography. Pill-shaped public buttons follow the owner's visual reference; the working planner uses tighter controls.

The custom scenes use the Taste Skill shared stage, bundled GSAP 3.15.0, native scrolling, and media-query cleanup. There is no wheel hijacking. Destination photo credits are at `/credits/`; the hero is a credited native 3,840-pixel Wikimedia Commons photograph, and the edge-only Kintsugi seams are vector artwork. No ImageGen pictures, fake partner logos, or invented testimonials are used.

A Commons footage search returned a service-busy response. The page uses scroll-linked photography rather than an unrelated stock clip.

## Before a live partner pilot

Replace the seed catalogue and verify prices, date windows, meals, access, transport, and source freshness. Connect an actual reviewed supplier workflow and a consented, reliable handoff. Add server-side validation, operational monitoring, privacy/retention policies, and analytics only after those choices are made. Cross-device sharing and collaborative editing remain later work.

See [PRD.md](PRD.md) and [design.md](design.md) for product intent. See `QA.md` for checks and visual review of this implementation.


## Latest UI revision

The homepage now follows the supplied cinematic Stitch reference: Cormorant display type, native 3,840-pixel night photography, an adaptive planning entry point, all-section motion, and subtle scroll-drawn Kintsugi seams. See [UI_REVIEW.md](UI_REVIEW.md) for verification, image sources, motion behavior, and remaining demo limits.

## GitHub synchronization

The public source repository is https://github.com/NAMA-Japan-Hackathon/japan-your-way.
The `github` remote is separate from the private website publishing workflow.
Automatic synchronization is disabled. Push only when explicitly requested; see [GITHUB_SYNC.md](GITHUB_SYNC.md).

## Reviews and Japan-wide discovery — 24 October 2026

New routes: `/reviews/`, `/metro/` and `/explore/`. Discovery covers all 47 prefectures; rail coverage includes 65 national hubs, 28 selected corridors and 639 stations across ten city systems. Restaurant research currently covers Tokyo, Kyoto and Osaka. The original itineraries remain samples.

See [feature architecture, coverage and limits](docs/explore-and-rail.md), [photo inventory and credits](docs/image-fallbacks.md), and [QA](QA.md). Run `npm run validate:data` to check records and optional image availability. Personal-use photographs stay ignored; the public clone builds with placeholders.

## AI connection

Copy `.env.example` to `.env.local`, add `GROQ_API_KEY`, and optionally `SERPAPI_API_KEY`. Restart the server after editing credentials. Never use `NEXT_PUBLIC_` for a secret. Keep `.env.local` ignored. See [setup, provider choices and hosting requirements](docs/ai-planner.md).
