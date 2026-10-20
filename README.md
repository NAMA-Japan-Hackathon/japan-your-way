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

- A dark, illustrated pagoda and mountain opening with layered, native-scroll animation.
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

The revision takes its dark field, large type, sculptural composition, and staggered photography as inspiration. The original Japanese silhouette, content, controls, and scroll choreography are specific to this product. The night palette supersedes the initial stone palette. The page keeps one Hanken Grotesk family. Pill-shaped public buttons follow the owner's visual reference; the working planner uses tighter controls.

The custom scenes use the Taste Skill shared stage, bundled GSAP 3.15.0, native scrolling, and media-query cleanup. There is no wheel hijacking. Destination photo credits are at `/credits/`; the silhouette is original vector artwork. No ImageGen pictures, fake partner logos, or invented testimonials are used.

A Commons footage search returned a service-busy response. The page uses a moving silhouette and scroll-linked photography rather than an unrelated stock clip.

## Before a live partner pilot

Replace the seed catalogue and verify prices, date windows, meals, access, transport, and source freshness. Connect an actual reviewed supplier workflow and a consented, reliable handoff. Add server-side validation, operational monitoring, privacy/retention policies, and analytics only after those choices are made. Cross-device sharing and collaborative editing remain later work.

See the parent folder's `PRD.md` and `design.md` for product intent. See `QA.md` for checks and visual review of this implementation.
