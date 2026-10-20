# Implementation review — 21 October 2026

## Verification

- TypeScript check passes.
- Production static build succeeds for all public routes and the three trip detail pages.
- 10 domain tests pass: season/diet constraints, route feasibility, hours/overlap detection, rooms/group arithmetic, missing prices, budget state, replacement/move behavior, privacy of shared summaries, input validation, determinism, and ingredient constraints without a dietary preset.
- Browser journey checked: requirements → review → generated plan → save → remove activity → updated subtotal → undo → demo request preview → prepared request → saved plan navigation → reopen.
- Native validation caught a spending-input step mismatch; corrected to permit any positive whole-rupee amount.
- Removing a ₹2,800 activity changed the known group subtotal from ₹1,21,000 to ₹1,18,200. Undo restored it. The saved plan reopened with the restored total.
- No real provider submission, payment, or contact collection occurs.

## Visual measurements

Homepage: `.taste-skill/verified-home/report.json` records **0 FAIL** at 1440×900, 768×1024, and 390×844. Every screenshot listed by that inspection was reviewed. The final mobile moon is moved above the title to preserve text contrast.

Planner: `.taste-skill/verified-planner/report.json` records **0 FAIL** at the same widths. The phone uses a full-width day selector, estimate summary, and tabs. Tablet day choices wrap rather than clipping at the screen edge.

Two warnings are retained with explicit reasons:

- Homepage `no-footage`: the requested original silhouette moves in layers and the garden photograph expands with scroll. A Commons footage search returned a busy response; an unrelated clip would weaken the specific scene.
- Planner `ragged-row`: the chronological schedule and independent estimate/questions rail have different content lengths. They stay top-aligned at their actual heights rather than stretching a panel over empty space. This is a functional three-pane workspace, not a row of peer metric cards.

Source lint has 0 FAIL. The remaining warnings identify real form-control outlines, the functional “Unlock item” action, and zero-padded clock times. Those are intentional controls/data. Inline exceptions are limited to modal-overlay shadows and real form/table/journey structure, with reasons in the source.

A supplementary 320px run exposed the inspector's default height calculation: it uses a 200px-high landscape window for unlisted widths. That run is not represented as a normal phone verification. Short landscape windows now use the ordinary reading layout rather than clipping content into a pinned stage. The release's primary measured sizes are listed above.

## Animation verification

`.taste-skill/verified-scenes/` contains desktop and phone contact sheets for `japan-silhouette` and `japan-window`, plus reduced motion. Both scenes run with native scrolling. The stage supports reduced motion and cleanup on navigation; a failed animation initialization falls back to ordinary content.

The original silhouette is drawn in SVG. It is illustrative, not a geographic view or a claim that the pagoda and mountain stand together in this composition. Real destination photographs provide the factual visual context elsewhere.

## Final visual critique

ROUND 3

Seen in one second: a large Japan title and a pagoda silhouette against a moonlit mountain.

Idea (one sentence): an imagined Japan landscape opens into an Indian traveler's checkable day, with food questions and group costs visible.

Live thing: change the sample day's pace or food check, then carry that choice into the planner.

Layout words by section: hero=layered stage / introduction=statement strip / trips=staggered photographs / fit=photograph and argument / garden=opening window / evidence=working status sheet / questions=accordion / close=photograph and invitation.

Scores: design 7.8 · usability 7.8 · creativity 7.0 · content 8.0 → overall 7.7.

These are the author's visual review scores, not external jury scores or research results. No failure cap applies at the three release viewports. The concept is an adaptation of a known editorial approach, so creativity is conservatively scored.

Top three problems reviewed and corrected:

1. The first mobile silhouette crop placed a pale moon behind white headline text (`release-home/mobile-fold.jpg`). The final moon geometry sits above the headline.
2. The planner's mobile summary and tabs inherited cross-axis start alignment from the desktop grid (`final-planner/mobile-fold.jpg`). Mobile now stretches both to the available width.
3. The tablet day navigation clipped partial place names (`release-planner/tablet-fold.jpg`). The tablet wraps day choices and the phone uses a native selector.

Remaining limits: supporting photography repeats the garden view, the working catalogue is small and synthetic, and real user research is outstanding. The implementation README identifies the demo's technical and partner limitations.

## Direction record

Original page direction: The product performs, seed 1154879022. App style: Achromatic ledger, seed 554352894. The original intro, proof, and footer redraws are recorded in the parent design specification. The owner then requested dark silhouettes, strong scroll animation, and the Floria reference. The night palette, pill public actions, original landscape, and two custom scenes implement that explicit revision.

## Image credits

All five photographs are from Wikimedia Commons and are distributed under CC BY-SA 4.0. The site credits page links each source and license, names the creator, states the resizing/WebP/layout-crop treatment, and offers the adapted file. Full metadata is in `public/images/credits.json`.

| File          | Work and creator                                                                                                      | Placement                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `kyoto.webp`  | Yasaka-dori early morning with street lanterns and the Tower of Yasaka (Hokan-ji Temple), Kyoto, Japan — Basile Morin | Culture trip and trip detail              |
| `gion.webp`   | Wooden and bamboo facades of dwellings with sudare in a cobbled street of Gion, Kyoto — Basile Morin                  | Fit section and requirements context      |
| `garden.webp` | Dry-sand Zen garden at Higashiyama Jisho-ji / Ginkaku-ji, Kyoto — Basile Morin                                        | Expanding photo scene and closing section |
| `tokyo.webp`  | Nakamise, Asakusa, Tokyo from the Asakusa Culture Tourist Information Center — DXR                                    | Family trip and trip detail               |
| `osaka.webp`  | Dotonbori, Osaka, at night, November 2016 — Martin Falbisoner                                                         | City-interest trip and trip detail        |

Source pages and license links appear individually at `/credits/`. No generic bundled photographs or generated bitmap assets are used. Hanken Grotesk is served locally with its SIL Open Font License in `public/fonts/OFL.txt`.

## Replace before a commercial launch

Replace every invented price, opening window, transit estimate, dietary/access fact, and sample arrangement with reviewed records. Set up real evidence freshness, inventory, provider consent/submission, and operating support. The prototype does not claim that any supplier is affiliated, any arrangement is available, or any customer outcome has been measured.
