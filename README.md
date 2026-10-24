# Japan, Your Way

A working concept website and browser-local trip planner for the Tokyo–Kyoto–Osaka pilot.

## Run locally

Use Node 22 or later.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. `npm run build` produces a static Next.js export in `out/`. `npm test` runs the domain tests; `npm run typecheck` checks TypeScript.

## Implemented

- A dark, native 4K Fuji and pagoda photograph with layered, native-scroll animation.
- A second scroll scene expanding a Kyoto garden photograph.
- Reduced-motion and no-script reading layouts; locally served GSAP and font assets.
- Three sample trip routes, month/interest/pace filters, and route details.
- A five-part requirements flow with group, diet, ingredient, access, pace, and budget inputs.
- Deterministic daily scheduling, operating-window/overlap/pace checks, group pricing, and explicit unpriced costs.
- Replacing, moving, adding, removing, and locking items; time edits and undo.
- Local save/reopen/rename/duplicate/delete, a shareable text snapshot, and a simulated provider inquiry.
- Help/privacy information and complete image credits.

A direct sample is available at `/plan/?sample=1`. Saved plans use `/plan/?id=...` on the same browser. These are local identifiers, not cross-device share links.

## Architecture and scope

The implementation uses Next.js static export, React, TypeScript, GSAP, and a pure domain module in `src/lib/planner.ts`. It follows the PRD's permitted seed-data adapter, with browser-local storage. There is no database connection, server API, account system, live inventory, payment processing, real confirmation submission, or behavioral analytics in this version.

All rates, opening windows, meal arrangements, journey durations, and accessibility assumptions are invented demo fixtures. The photographs show real destinations. A “Fits” result means the sample constraints agree, not that a supplier or booking is confirmed. Incomplete estimates show a known subtotal; they cannot establish budget fit.

Meal evidence is deliberately incomplete. A must-have dietary requirement leaves lunch slots open. Soft requirements can show a candidate with explicit pending checks. This is a demonstration of uncertainty handling, not a source of food safety advice.

For strict budgets, known overruns are surfaced as conflicts; the demo does not optimize the route to solve a hard budget. Replacement and move edits preserve the schedule as a draft and expose resulting overlaps and operating-window conflicts. Transport is an illustrative allowance rather than a geographic routing service. The 4–11 age band is the only supported child-price fixture.

## Art direction

The original Taste Skill direction is “The product performs,” seed 1154879022; the app style is “Achromatic ledger,” seed 554352894. After the first preview, the owner requested dark silhouettes and strong scroll motion, then supplied https://floria-landing-page.vercel.app/ as a reference.

The revision takes its dark field, large type, sculptural composition, and staggered photography as inspiration. The original Japanese silhouette, content, controls, and scroll choreography are specific to this product. The night palette supersedes the initial stone palette. The page uses the device system UI font for controls and reading, with Cormorant Garamond for display typography. Pill-shaped public buttons follow the owner's visual reference; the working planner uses tighter controls.

The custom scenes use the Taste Skill shared stage, bundled GSAP 3.15.0, native scrolling, and media-query cleanup. There is no wheel hijacking. Destination photo credits are at `/credits/`; the hero is a credited native 3,840-pixel Wikimedia Commons photograph, and the edge-only Kintsugi seams are vector artwork. No ImageGen pictures, fake partner logos, or invented testimonials are used.

A Commons footage search returned a service-busy response. The page uses scroll-linked photography rather than an unrelated stock clip.

## Before a live partner pilot

Replace the seed catalogue and verify prices, date windows, meals, access, transport, and source freshness. Connect an actual reviewed supplier workflow and a consented, reliable handoff. Add server-side validation, operational monitoring, privacy/retention policies, and analytics only after those choices are made. Cross-device sharing and collaborative editing remain later work.

See [PRD.md](PRD.md) and [design.md](design.md) for product intent. See `QA.md` for checks and visual review of this implementation.


## Latest UI revision

The homepage now follows the supplied cinematic Stitch reference: Cormorant display type, native 3,840-pixel night photography, a working four-day sample, all-section motion, and subtle scroll-drawn Kintsugi seams. See [UI_REVIEW.md](UI_REVIEW.md) for verification, image sources, motion behavior, and remaining demo limits.

## GitHub synchronization

The public source repository is https://github.com/NAMA-Japan-Hackathon/japan-your-way.
The `github` remote is separate from the private website publishing workflow.
See [GITHUB_SYNC.md](GITHUB_SYNC.md) for automatic synchronization behavior.
