# Japan, Your Way — Design Specification

Version: 0.2  
Date: 21 October 2026  
Status: Proposed website and planner design  
Companion: [Product requirements](PRD.md)

## 1. Design intent

Make the trip understandable before asking the traveler to commit.

Japan, Your Way should feel inviting enough to explore and precise enough to trust. Its defining visual material is a day of travel whose meals, journeys, activities, and costs can be checked together. Beautiful destination imagery supports that decision; it does not substitute for it.

This document specifies the design for future implementation. It is not a completed website, measured usability result, or browser-verified design.

### Reading of the supplied deck

The six-page proposal uses black-and-white landmark illustrations, forceful headings, compact information blocks, and repeated decision language. Carry forward its directness, visible evidence, and Japan-specific subject matter.

The deck does not establish a production logo, licensed web photography, font files, or an approved color system. Its slide numbers, all-caps typography, hairlines, and outlined boxes are presentation devices, not mandatory website treatments. Public reuse of its illustrations needs rights confirmation.

## 2. Subject inventory and concept

The source gives this product a specific combination of material:

1. Indian travelers considering their first Japan trip.
2. Couples and families making a shared decision.
3. The Tokyo–Kyoto–Osaka pilot corridor.
4. A choice between discovering a trip and starting from requirements.
5. Seasonal interests tied to actual dates.
6. Ingredient-level food questions rather than diet labels alone.
7. Daily pace, language, access, and transit concerns.
8. INR estimates that distinguish group costs from per-person averages.
9. The three visible states: Fits, Needs check, Conflict.
10. Evidence with source and checked dates.
11. Editable plans that can be saved without an account.
12. Partner confirmation as the bridge to eventual booking.

**Idea sentence:** On this page, an Indian family’s Japan day, including its food questions and group estimate, becomes a working decision sheet.

The distinguishing device is the linked day: changing one requirement changes the route suggestion, meal status, time burden, or estimate in the same visible example. A generic itinerary tool could show attractions; this design foregrounds the combination of requirements and unresolved evidence described in the deck.

**One live thing:** the homepage offers a compact sample-day preview. Choosing “More time to pause” or “Less travel” changes the proposed day and its explanation. A food requirement can reveal a pending check instead of falsely creating certainty. The same preferences carry into the full planner.

## 3. Direction and decision record

The design-taste-frontend draw offered:

- Dressed as something else.
- Loud and flat.
- The product performs.

Choose **The product performs** because the strongest available proof is a visible planning interaction, not testimonials or destination spectacle.

| Decision | Selection |
| --- | --- |
| Public-page direction | The product performs |
| Recorded page seed | `1154879022` |
| Typeface | Hanken Grotesk |
| Palette | Three stones |
| App style | Achromatic ledger, light |
| Recorded app seed | `554352894` |
| App face | Shared stone ground, product wordmark, and a linked daily plan with fit evidence |
| Supporting files | `.taste-skill/direction.json`, `.taste-skill/app/direction.json` |

The public page and planner share type, palette, and language. Their density differs: the page introduces an idea; the planner supports repeated decisions.

### Recorded blueprint changes and adaptations

- Intro redrawn from “Narrow column, empty field” to “Title, note, facts row.” The former leaves an empty field and omits the required section heading; the new geometry supports the four decision dimensions.
- Proof redrawn from “Large marks on tiles” to “Recognition as a table.” There are no supplied customer or partner logos. Use the table geometry for evidence records, never invented recognition.
- Footer redrawn from “A footer of tiles” to “A single quiet line.” No office address, local-time feature, or contact email has been supplied.
- The dealt hero places support text near the bottom and splits the title around a reel. Apply the skill’s higher-priority composition and readability rules: a single readable heading, supporting sentence directly below, and a true-size live fragment. Keep the frame/reel idea only as supporting motion.
- The app draw includes a node-graph builder and analytics-style detail pattern. Apply the style’s neutral surfaces and evidence-first hierarchy to a daily schedule and source detail. The product has neither graph nodes nor analytics KPIs.
- Do not use the optional generic architecture photographs. They do not establish these Japanese destinations. Acquire relevant licensed images during implementation.
- A pinned story may explain how one day changes on desktop. On mobile and reduced motion, it is a normal stacked sequence. It never blocks the form or hides important evidence.

No palette or type redraw was made. These are design specifications and documented content adaptations, not claims that the original blueprints have already been built or passed inspection.

## 4. Page argument and copy

Each section must make a claim and show its proof.

| Section | Claim | Proof on the page |
| --- | --- | --- |
| Hero | You can judge a trip against your needs | Working sample day with a requirement control and an honest status |
| What needs to fit | Dates, meals, pace, and costs belong in one decision | One day’s connected requirements and their consequences |
| Trips for your dates | Start with a route and understand its seasonal assumptions | Three sample routes with travel windows and alternatives |
| How your day changes | Editing has visible consequences | Before/after day fragment with a cost and travel-time change |
| Know what needs checking | Unknowns remain visible | Source/freshness table and a pending meal question |
| Questions | Travelers can understand the product’s scope | Direct answers about estimates, food checks, saves, and booking |
| Start your plan | Requirements are enough to begin | Initial date/group fields linked to the planner |

### Proposed homepage copy deck

**Navigation:** Japan, Your Way · Trips · How it works · Help  
**Primary action:** Plan my Japan  
**Secondary navigation utility:** Saved plans

**Hero heading:** Japan, your way  
**Supporting sentence:** Plan a Japan trip around your dates, food needs, pace, and budget, with the open questions clearly shown.  
**Live preview title:** A day that fits  
**Preview note:** Sample day. Prices and arrangements need confirmation.  
**Alternative path:** Explore trips

**What needs to fit**  
An appealing route still needs workable meals, journeys, and time to pause. See those decisions together before you choose.

**Trips for your dates**  
Start with a sample route, then change it for your group. Seasonal timing and availability still need checking.

**Change the day**  
Replace a stop or slow the pace. See what changes in the schedule and estimate.

**Know what needs checking**  
Every important requirement has a reason, a source when available, and a clear next step when information is missing.

**Questions**

- **Can I explore for free?** Yes. Explore, create a plan, and save it on this device without an account or payment.
- **Is the estimate a quote?** No. It uses the listed assumptions and excludes the costs shown beside it. Providers confirm final availability, prices, and terms.
- **Can you confirm our meals?** The plan shows the information available for your requirements. Missing ingredient or preparation details stay marked “Needs check.”
- **Can I change the route?** Yes. Replace, remove, or move activities, then review the updated time and cost.
- **Where is my plan saved?** On this browser and device. Clearing browser storage may remove it.
- **Can I book here?** The demo prepares a sample confirmation request. Booking and payment are outside this MVP.

**Closing heading:** Start with your dates  
**Supporting sentence:** Add your group and requirements. You can adjust the route before asking a provider to confirm it.  
**Action:** Plan my Japan

Use this copy as a starting deck. Recheck final headlines at real font sizes; every public-page heading must fit within two lines at the target widths. Long FAQ questions are control labels, not oversized headings.

## 5. Visual system

### Color tokens

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#EEECEA` | Main ground; subtle stone tone |
| `--surface` | `#E4E1DD` | Public-page stage or inset |
| `--panel` | `#FFFFFF` | Planner inputs and working panels |
| `--ink` | `#333231` | Primary text and planner action |
| `--muted` | `#6B6763` | Secondary text; verify contrast on each surface |
| `--accent` | `#5C6B54` | Public-page action and selected route data |
| `--accent-ink` | `#FFFFFF` | Text on accent |
| `--field` | `#CDC3B6` | One supporting field, not a repeating decoration |
| `--border` | `#DEDCD9` | Quiet planner structural borders |
| `--control` | `#79746E` | Input boundary where needed for identification |
| `--fit-ink` / `--fit-bg` | `#365142` / `#E7EEE8` | Fits state |
| `--check-ink` / `--check-bg` | `#704A12` / `#F4EBDD` | Needs check state |
| `--conflict-ink` / `--conflict-bg` | `#8B2929` / `#F7E7E7` | Conflict state |

Use full ink for running text. Do not wash the interface in pale gray text. Status colors accompany words and a distinct simple symbol. In dense lists prefer one small status mark and explanatory text to large colored blocks.

The public page uses the accent on its main action and at most one other meaningful element. The planner uses near-black primary buttons and neutral navigation, with color reserved for data and statuses. Its ordinary chrome should remain visually achromatic.

No gradients, glass, glows, tinted icon boxes, or resting-card shadows. Shadows belong only to floating menus and dialogs. Verify text and controls against accessibility targets during implementation; no contrast test is claimed here.

### Typography

Use Hanken Grotesk, weights 400 and 500. Use a system sans-serif fallback while the actual font loads. Confirm the chosen font license and self-host WOFF2 assets during implementation.

| Role | Desktop | Phone | Treatment |
| --- | --- | --- | --- |
| Marketing hero | 64px | 44px | 500, 1.0 line height, −0.04em tracking |
| Marketing section | 44px | 32px | 500, 1.05 line height, −0.03em |
| Lead paragraph | 24px | 20px | 400, 1.45 line height |
| Marketing body | 18px | 16px | 400, 1.55 line height |
| Metadata | 14px | 14px | 400, 1.45 line height |
| Planner title | 24px | 22px | 500, normal reading measure |
| Planner content | 16px | 16px | 400; 500 for emphasis |
| Planner supporting text | 14px | 14px | 400, 20px line height |
| Main estimate | 30px | 28px | 500, tabular figures |

Marketing has five visible size roles. Planner type is a separate functional scale. No decorative monospace. Enable tabular figures for costs, durations, and changing values; verify the font supports them.

Use sentence case and left alignment. Never color, italicize, or change the face of one headline word for emphasis.

### Grid and spacing

- Public page: 12 columns on desktop, 8 on tablet, 4 on phone.
- Equal outer margins: 32px desktop, 24px tablet, 20px phone.
- Standard column gap: 24px desktop, 16px phone.
- Section separation: 120–160px desktop, 64–88px phone, adjusted to actual content.
- Internal spacing scale: 4, 8, 12, 16, 24, 32, 48, 64.
- No blank stretch taller than approximately half a screen.
- Pair text with useful media or evidence across the grid; do not leave every right half empty.
- Public photography has square corners. Public buttons are square-cornered, flat, at least 48px tall.
- Planner panels use 8px corners; planner controls use 6px corners. Touch targets are at least 44px.

## 6. Screen specifications

### Home: “Could this work for us?”

At 1440px, place the headline and supporting sentence in the upper-left portion and a large working sample-day fragment across the remaining stage. It should occupy about half the first screen and remain readable at actual interface scale.

The hero shows one requirement selector, a short day schedule, the affected status, and a labeled sample estimate. The primary action remains visible without interacting.

At 390px, order the content: wordmark/menu, headline, support, action, live preview. Avoid an oversized image pushing the product explanation below the first screen. The preview uses full-width rows rather than a miniature desktop interface.

Below the hero, alternate purposeful compositions: facts row, route imagery and list, input/output split, source table, and question list. Do not repeat an identical feature-card grid.

### Discovery: “Which route is worth exploring?”

Use a short title, an inline filter row, and three generous trip rows. Each row pairs one image with the trip name, route, duration, seasonal explanation, group assumptions, estimate, and unresolved-check summary.

On phones, image and information stack within each result. Filters open in a sheet with a clear Apply action and result count. A chosen filter can be removed individually.

Do not use star ratings, crossed-out prices, urgency timers, or “Best seller” labels without evidence.

### Trip detail: “What exactly am I choosing?”

Show title, destination sequence, duration, sample-data notice, and the primary “Use this trip” action. Follow with itinerary outline, relevant requirements, price breakdown, inclusions/exclusions, and evidence.

Use actual content headings: Route, Food and access, Estimate, What needs checking. A route map is supporting material; a text sequence with travel durations must remain usable without it.

### Requirements: “Have you understood our needs?”

Four sections: Dates and group; Interests and pace; Food and access; Spending. Show a simple text progress indicator such as “Food and access · 3 of 4”; this is functional form progress, not decorative numbering.

- One column of fields, typically 560–640px wide.
- Desktop side summary shows chosen dates, group size, and budget scope.
- Mobile summary is a disclosure, with fields taking priority.
- Labels persist above inputs; examples and help text sit below.
- Explain optional fields and let users say “Not sure.”
- Must-have controls are explicit, with a short explanation of how unknown evidence will be treated.
- Review screen groups answers by section, each with Edit.

On validation failure, focus an error summary linked to the relevant fields. Keep valid answers intact.

### Planner: “Does this day work?”

Use a compact top bar with the product name, plan name, saved state, and utility actions. The main canvas contains a day navigator, daily schedule, and estimate/questions panel.

Desktop geometry at 1440px:

```text
32 outer + 200 day list + 24 gap + 792 main + 24 gap + 336 summary + 32 outer = 1440
```

The 792px schedule is the dominant region. At narrower desktop widths, reduce to two columns and move day navigation into a horizontal selector before compressing the schedule.

```text
Japan, Your Way        Our Japan plan        Saved on this device

Days                  Tuesday in Kyoto             Estimate
Tokyo · arrival       Needs check: lunch details    Group / average
Tokyo · culture                                    Included costs
Kyoto · culture       09:00  Activity               Exclusions
Osaka · city          10:30  Travel                 Incomplete costs
                      11:00  Break
                      12:00  Lunch                  Questions to resolve
                      Ingredients need checking    Review questions
                      Replace · Details
```

This is a structural wireframe, not final typography or a timetable claim.

On the first 1440×900 screen, expose the day heading, first schedule entries, estimate scope, and outstanding-question summary. Avoid KPI tiles that repeat those same facts.

Every schedule entry shows time, name, duration, price basis, and one fit state where relevant. Transit and breaks are real rows, not whitespace. Date labels and city names support orientation.

At 768px, place the day selector above the schedule and the estimate/questions summary beside or below it according to available width. At 390px, use a single column with Day / Estimate / Questions tabs. Keep a compact group estimate and outstanding-check count above the tab content. Switching tabs preserves scroll position.

Editing on phones uses Replace, Move, and Remove actions in a sheet. Do not make drag-and-drop mandatory. Confirm replacement effects before applying when they introduce a hard conflict.

### Evidence detail: “What supports this answer?”

Open a desktop side panel or a mobile full-screen sheet containing:

1. The requirement in the traveler’s own terms.
2. Current fit state and plain explanation.
3. Supported fact, provenance, source, and checked date.
4. What the evidence does not establish.
5. A specific next action: choose an alternative or add the question to the inquiry.

Example copy: “The menu lists vegetarian dishes. Fish stock has not been confirmed. Ask the provider to confirm the ingredients.”

This example explains a data state; it is not a claim about a named restaurant.

### Estimate: “What would we actually spend?”

Show the group estimate first, per-person average second, and the covered scope immediately below. Use category rows with right-aligned amounts and visible charging units.

Synthetic arithmetic fixture for implementation:

| Included item | Calculation | Group amount |
| --- | --- | --- |
| Stay | 1 room × 6 nights × ₹8,000 | ₹48,000 |
| Meals | 2 travelers × 7 days × ₹1,800 | ₹25,200 |
| Intercity travel | 2 travelers × ₹12,000 | ₹24,000 |
| Local transport | 2 travelers × 7 days × ₹800 | ₹11,200 |
| Activities | 2 travelers × ₹8,000 | ₹16,000 |
| **Group estimate** | Sum of displayed rows | **₹1,24,400** |
| **Per-person average** | Group ÷ 2 | **₹62,200** |

These are invented test amounts, not researched prices or an offer. They are INR fixtures with no implied exchange rate. Exclusions: international flights, visas, insurance, personal purchases, and unlisted fees. If any required included cost is missing, replace the complete total with a known subtotal and an incomplete-estimate notice.

A change from ₹16,000 to ₹12,000 in activity costs produces a ₹4,000 group reduction and a ₹2,000 reduction in the average. Show “₹4,000 less than your previous plan,” not an unexplained negative number.

### Confirmation: “What will the partner receive?”

Use a readable preview, not a promotional checkout layout. Summarize the route, dates, group, cost assumptions, and specific questions. Allow sensitive preferences to be reviewed before inclusion.

In the MVP, the primary button is “Prepare demo request.” A persistent note states that nothing will be sent. The completion view presents the prepared request and a route back to editing.

For the later live pilot, replace simulation copy only when a real endpoint, named recipient, consent, and delivery receipt exist.

## 7. Components and states

| Component | Required behavior |
| --- | --- |
| Fit label | Text and symbol; reason available; no reliance on color |
| Requirement control | Visible value, hard/soft distinction, accessible help |
| Trip row | Whole-row reading order; specific View trip link; consistent information |
| Day selector | Selected day announced; keyboard support; no page-level horizontal overflow |
| Schedule row | Time, content, evidence, estimate, edit affordance |
| Estimate breakdown | Shared calculation source; units; exclusions; unknown-cost state |
| Source disclosure | Provenance and checked date; source link when available |
| Change summary | Previous/new values; clear baseline; undo |
| Save status | Saving, saved, storage failed; local-device wording |
| Modal/sheet | Focus containment, Escape/close, focus restoration, scroll management |

### Required non-happy-path copy

| State | Message | Recovery |
| --- | --- | --- |
| No matching trip | “No sample trips match these choices.” | Clear an individual filter |
| Unsupported dates | “The demo covers trips of 5–10 days.” | Change dates |
| No feasible plan | “We could not fit these requirements together.” | Show named blockers and explicit alternatives |
| Missing price | “This cost still needs a price.” | Show known subtotal and add a confirmation question |
| Unknown food evidence | “Ingredients need checking.” | Open evidence or replace |
| Schedule conflict | “This visit overlaps the next journey.” | Move, replace, or undo |
| Stale evidence | “This information needs a fresh check.” | Show last source and ask for confirmation |
| Recalculation failure | “We could not update the estimate. Your edits are still here.” | Retry; preserve previous result with its version |
| Storage unavailable | “This browser could not save your plan.” | Copy summary; retain current draft |
| Clipboard denied | “Copy the summary below.” | Selectable text fallback |
| Demo handoff complete | “Your demo request is ready.” | Read or copy; no sent claim |

Loading uses stable flat placeholders at the final content size, with headings visible. No shimmer. During refresh, retain the previous result and label it as updating rather than replacing the whole page with empty space.

## 8. Imagery and assets

Current asset inventory: the supplied six-page PDF only. No web-ready destination photos, confirmed partner logos, or actual product screenshots have been supplied.

For implementation, prepare:

| Asset | Purpose | Acquisition requirement |
| --- | --- | --- |
| Working sample-day fragment | Hero proof | Build from the actual seeded domain data |
| Route-selection fragment | Show discovery | Real UI with clearly labeled sample routes |
| Estimate fragment | Show transparent arithmetic | Same calculation model as the planner |
| Evidence fragment | Show uncertainty | Real source/status component |
| Tokyo neighborhood image | Ground an urban route | Verified location and commercial-use license |
| Kyoto cultural setting | Ground the culture route | Verified place, season, and caption |
| Osaka street/city image | Ground the final route | Verified location and license |

The four meaningful product fragments satisfy the chosen software direction’s visual substance; destination photographs enrich it. During implementation, verify the skill inspector’s treatment of actual fragments and any raster captures. Never add irrelevant images to satisfy a count.

Use consistent natural color treatment and purposeful crops, generally 4:3 for trip media and 3:2 for a large destination scene. Avoid generic cherry-blossom imagery on an unrelated seasonal route.

Do not generate fictitious photographs of real partner hotels, meals, staff, or facilities. Generated illustration may be used only as clearly illustrative supporting material.

Download selected licensed assets into the project and keep an asset manifest: title, creator, source page, license, attribution text, intended placement, and acquisition date. Put credits in the footer or a linked credits page. No images have been sourced or licensed as part of this specification.

## 9. Motion

The public page can show the same sample day progressing from requirements to a feasible schedule and then to a question for confirmation. This is the signature motion: the plan changes, and the reason remains readable.

- Control feedback: 120–180ms.
- Sheet transitions: 180–240ms.
- Public-page content entrance: 16–24px travel, 60–90ms stagger, once only.
- Animate transform and opacity; content is visible if scripts fail.
- A destination picture may drift subtly where it supports the story.
- Do not animate numerical estimates through misleading intermediate totals.
- Do not move content beneath a user while they are editing.
- The planner has no entrance choreography; motion communicates actions and state changes.

Reduced motion removes travel, pinning, reel movement, and image drift. Content appears in ordinary reading order with the same controls and evidence. The full planner must remain usable independently of all animation.

## 10. Accessibility and responsive acceptance

- One h1 per route; public sections have meaningful headings.
- Complete all core journeys with keyboard only.
- Use native form elements where possible; label every field.
- Make pointer targets at least 44×44px on touch layouts.
- Announce recalculation completion and status changes with restrained live regions.
- Errors identify both the issue and how to fix it.
- Restore focus after closing an edit sheet or evidence detail.
- Provide button-based alternatives to dragging.
- A text route and schedule must work without a map.
- Dates use readable words; time labels clearly refer to Japan local time.
- Color cannot be the only way to distinguish Fits, Needs check, and Conflict.
- Test at 390, 768, and 1440px, plus 320px and zoom; no horizontal page overflow.
- Use visible focus outlines with sufficient contrast. Input identification and control states must meet non-text contrast requirements.

## 11. Build handoff and verification plan

Suggested implementation components:

```text
SiteHeader / SiteFooter
SampleDayPreview / TripList / TripDetail
RequirementsForm / RequirementsReview
PlannerShell / DaySelector / ScheduleList / ScheduleItem
FitStatus / EvidencePanel / EstimateBreakdown
EditItemSheet / ChangeSummary / SavedPlans
SharePreview / ConfirmationPreview
```

Components consume common plan and evidence objects from the PRD. Never type the same total into multiple components. Keep the calculation engine outside presentation components.

Suggested sequence:

1. Implement tokens, actual font loading, and responsive frames.
2. Build the working sample-day preview from a deterministic fixture.
3. Build discovery and requirements at real content density.
4. Build the planner with evidence and cost components.
5. Add edits, persistence, sharing, and simulated confirmation.
6. Add imagery with verified credits and public-page motion.
7. Test unhappy paths and accessibility.
8. Run the design skill’s source lint and browser inspection separately for public pages and app screens.
9. Inspect final screenshots at every viewport, critique them, and fix the three largest visual problems.
10. If scroll scenes are implemented, run their desktop, phone, and reduced-motion checks.

### Definition of design completion

- A five-second view explains what the product does and where to start.
- Each screen answers its primary question before secondary content.
- The itinerary, estimate, and evidence show consistent values.
- The first screen contains meaningful content rather than empty decoration.
- The public-page headings fit in two lines.
- Mobile editing works without a desktop canvas or dragging.
- Sample content and real verified facts are unmistakably distinct.
- All necessary interface states are implemented and checked.
- Final lint/inspection failures are resolved; warnings are fixed or documented.
- Every final screenshot has been reviewed; no fabricated visual score is reported.

## 12. Outstanding inputs

The specification is actionable with labeled seed data. Before publishing, obtain approved brand assets, licensed imagery, verified destination records, provider evidence, price scope, exchange-rate policy, and the actual confirmation workflow.

The saved direction sheets record art-direction choices. Browser inspection, contrast testing, screenshot critique, and user testing are future implementation checks and have not been performed for these Markdown documents.


## 13. Owner-requested implementation revision — 21 October 2026

After the initial preview, the owner requested a dark silhouette and stronger scroll animation, then supplied https://floria-landing-page.vercel.app/ as a visual reference. This revision supersedes the earlier light palette and square public-button treatment.

The implemented public site uses a near-black ground, charcoal panels, off-white Hanken Grotesk type, a pale sage primary action, and original layered pagoda/mountain silhouettes. It draws on the reference's large type, sculptural composition, and staggered image sections. It retains Japan-specific content and the working decision flow.

Two native-scroll scenes run on the Taste Skill shared stage: a silhouette depth sequence that reveals the sample day, and a garden photograph expanding into a chapter. Reduced motion keeps readable ordinary sections. The planner has a quiet dark interface and functional feedback.

Working source is in `japan-your-way/`. The MVP uses the PRD's seed-data adapter with Next.js static export and local storage. Saved-plan routes use `/plan/?id=...`; `/plan/?sample=1` opens a direct example. Live provider submission, API/database integration, and cross-device share links remain outside the delivered demo. The implementation README and QA report record exact checks and limitations.

## Owner-directed cinematic and Kintsugi revision — 21 October 2026

The supplied Stitch UI replaces the geometric hero with a native 3,840-pixel photograph, Cormorant Garamond display type, warm ivory controls, and blue-black panels. A working four-day Kyoto sample leads into three photographic routes, the planning process, an opening garden scene, FAQs, and a preference form that opens the existing planner. Six small asymmetric gold-filled seams stay in the margins and draw with scroll progress; reduced motion shows completed seams and readable static content. Detailed implementation and credit notes are in `japan-your-way/UI_REVIEW.md`.

## Owner revision: nationwide discovery and storefront photography

24 October 2026. Explore Japan now covers all 47 prefectures through official regional guides. The rail atlas opens on Japan, with ten detailed city systems and shared interchange nodes. Trace a line reduces visual competition in dense networks. Existing dark tokens and map patterns are preserved. Food photography shows the named restaurant’s front exterior; unavailable photos use typography. Reviews remains beside the wordmark at every width. [Coverage and implementation](docs/explore-and-rail.md).


## Adaptive conversation workspace — 24 October 2026

Retain the established dark Japan palette, system reading font, Cormorant headings and subtle Kintsugi marketing motion. Remove both sample itinerary presentations from the homepage and replace its preference form with a conversational planning link. Hero discovery links lead to the Japan-wide directory.

The new planner has an aligned conversation surface and a quieter traveler-profile column. Messages remain readable and scroll naturally within the transcript. Each question accepts free text; relevant reply suggestions are optional. Readiness is expressed in words rather than a fabricated percentage. The generated itinerary has daily sections, group estimate ranges, separate source-returned price checks, and unresolved details. Editing preferences marks an old draft as needing revision. On phones the profile follows the conversation, keeping the answer field available early.

The always-available travel launcher opens an opaque, bottom-right chat panel on desktop and an inset sheet on phones. Native dialog semantics provide focus containment and Escape dismissal. Source errors and missing credentials appear as readable local states; no canned text masquerades as a provider response. Keys stay server-side. Sandbox rate cards say test data beside the amounts. [Runtime and privacy notes](docs/ai-planner.md).
