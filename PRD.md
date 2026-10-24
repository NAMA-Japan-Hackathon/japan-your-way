# Japan, Your Way — Product Requirements

Version: 0.1  
Date: 20 October 2026  
Status: Proposed specification for a hackathon MVP  
Companion: [Design specification](design.md)

## 1. Product definition

Japan, Your Way helps first-time Indian couples and families decide whether a Japan trip fits their dates, food requirements, preferred pace, access needs, and spending range before they commit to a provider.

The product connects seasonal discovery, an editable itinerary, requirement checks, and a transparent estimate. Its primary outcome is an understandable trip decision with a clear next step: save, share, change the plan, or ask a partner to resolve outstanding questions.

### Source and decision boundaries

The source is `Japan_Your_Way_Visual_Deck.pdf`, supplied by the user, at `/Users/naitik/Downloads/Japan_Your_Way_Visual_Deck.pdf`. All six pages informed this document.

| Source | Requirements carried forward |
| --- | --- |
| Page 1: The problem | Indian couples and families; seasonal fit, food confidence, daily practicality, cost clarity |
| Page 2: The solution | Discover Trips; Plan My Japan; editable routes; compare, local save, share; Fits / Needs check / Conflict |
| Page 3: Differentiation | Explainable choices; source freshness; meals, journeys, and activities checked together |
| Page 4: User journey | Free exploration; visible tradeoffs; partner confirmation before booking |
| Page 5: Technical design | Next.js, API, PostgreSQL proposal; deterministic rules; three sample trips; simulated inventory and handoff |
| Page 6: Validation and value | Tokyo–Kyoto–Osaka pilot; interviews; usability comparison; partner validation; business-model experiments |

The deck is a concept proposal, not evidence of operating partners, live inventory, confirmed prices, customer traction, or validated demand. Concrete limits, schemas, acceptance criteria, and targets below are proposed implementation decisions. They require product-owner review before a commercial launch.

## 2. Problem and hypothesis

Travelers can find attractive Japan destinations without knowing whether the whole trip works for their group. A suitable activity may be in the wrong season, a meal may have unclear ingredients, or a route may combine too much transit with an ambitious day.

**Hypothesis:** showing these requirements together, with uncertainty and costs visible, helps travelers reach a more confident decision and send more suitable inquiries to providers.

Validate this against other causes of hesitation, including affordability, time, and visa constraints. Do not assume missing information is always the cause.

### Jobs to be done

- “Before I commit, show me which parts of this trip fit my family and which still need checking.”
- “Help me choose experiences for my dates without making promises about seasonal timing.”
- “Let me change a busy day and understand how the change affects travel and cost.”
- “Give my travel companion a clear plan we can discuss together.”
- “Let me ask a provider specific questions without starting planning again.”

## 3. Audience

| User | Primary need | Product response |
| --- | --- | --- |
| First-time couple | Balance interests, cost, and time | Editable route with reasons and comparable estimates |
| Family planner | Manage mixed ages, meals, breaks, and access requirements | Group-aware planning, explicit constraints, visible daily burden |
| Travel companion | Understand the proposal and its tradeoffs | Readable, shareable plan with exclusions and open questions |
| Japan partner, later pilot | Receive a useful, qualified inquiry | Structured requirements and item-specific confirmation questions |
| Catalogue operator | Publish trustworthy information | Reviewed data records, evidence, freshness, and publication state |

English is the proposed MVP interface language. INR is the default estimate display. Japanese place names can accompany English names when useful for identification. Do not infer religion, diet, mobility, or spending preference from nationality.

## 4. Goals, non-goals, and scope

### MVP goals

1. Let someone explore three sample trips without registration.
2. Collect enough requirements to produce a checkable itinerary.
3. Explain fit, uncertainty, and conflicts at item, day, and trip level.
4. Recompute schedule checks and costs after edits.
5. Save a plan on the current device and share a readable snapshot.
6. Demonstrate a partner-confirmation handoff without implying a real submission.

### Scope tiers

| Tier | Included |
| --- | --- |
| P0: hackathon MVP | Landing page; three sample trips; filters; trip details; preference form; deterministic generation; day editor; cost breakdown; evidence details; local save; text sharing; simulated confirmation |
| P1: after core flow | Compare two plans; shareable hosted snapshots; additional content; richer route visualization; print layout |
| Pilot readiness | Verified catalogue; real partner contacts and consented handoff; operating freshness policies; privacy and retention review; reliable analytics |
| Later exploration | Accounts and cross-device sync; partner portal; live supplier integrations; multilingual interface; referral attribution |

Comparison is part of the concept, but a dedicated side-by-side screen is P1. P0 supports comparison by opening saved plans individually, using the same cost categories and labels.

### Explicitly out of scope for the MVP

- Booking, payment, ticket issuance, or a claim of reserved inventory.
- Real-time flight, hotel, transport, or restaurant availability.
- Visa eligibility decisions, medical suitability decisions, or guarantees about food safety.
- A general-purpose conversational travel assistant.
- National coverage beyond the proposed Tokyo–Kyoto–Osaka pilot.
- Collaborative editing, user reviews, or fabricated endorsements.

## 5. Main journey and information architecture

```text
Home
├── Discover Trips → Trip detail → Use this trip
└── Plan My Japan → Requirements → Review → Generate
                                              ↓
                                    Editable itinerary
                                    ├── Inspect evidence
                                    ├── Replace / move / remove
                                    ├── Review estimate
                                    ├── Save / share
                                    └── Request confirmation
```

| Route | Purpose | Main action |
| --- | --- | --- |
| `/` | Explain the proposition through a working example | Plan my Japan |
| `/trips` | Browse seasonal sample routes | View trip |
| `/trips/[slug]` | Show route, inclusions, constraints, and estimate | Use this trip |
| `/plan` | Capture and review requirements | Build my plan |
| `/plan/[id]` | Edit a locally stored plan | Review questions |
| `/saved` | Reopen and delete local plans | Open plan |
| `/how-it-works` | Explain matching, estimates, and confirmations | Plan my Japan |
| `/help` | Explain terminology and limitations | Return to plan |

`/plan/[id]` identifies a plan on the current browser, not a public share link. When opened on another device without local data, show “This plan is saved on another device” with a path to begin planning. Hosted sharing is a separate P1 capability.

## 6. Functional requirements

### FR-01: Seasonal discovery

Show three distinct sample trips, each with destination sequence, duration, travel window, interests, pace, estimated per-person and group costs, inclusions, exclusions, and data status.

- Filter by month, interest, and pace; calculate result counts from visible results.
- Explain why a travel window may suit the experience.
- Distinguish a recurring seasonal pattern from a confirmed event date.
- Offer an indoor or less weather-dependent alternative where the catalogue supports one.
- Preserve filter values when returning from a trip.
- Empty results explain which filters removed the options and allow individual filters to be cleared.

**Acceptance:** changing the month removes a fixed-date event outside its validity window. Unknown future dates produce “Needs check,” never an invented confirmed date.

### FR-02: Requirements form

Use four short sections with a final review. Preserve completed values when navigating backward.

| Section | Fields | Validation and behavior |
| --- | --- | --- |
| Dates and group | Arrival/departure dates in Japan, adults, child age bands, entry/exit city | Departure follows arrival; at least one adult; age bands rather than birth dates |
| Interests and pace | Culture, food, anime, nature, shopping; relaxed/balanced/active | Multiple interests; explain what the chosen pace changes |
| Food and access | Diet, ingredient exclusions, cross-contact concern, walking tolerance, step-free requirement | Each can be a preference or must-have; “Not sure” is valid |
| Spending | Group or per-person range, strict maximum toggle, scope acknowledgment | Convert explicitly to group budget; distinguish included Japan costs from exclusions |

Proposed demo coverage: 5–10 days, 1–6 travelers, and the three pilot cities. Show these limits before generation. Do not silently clip unsupported dates, group sizes, or needs.

Diet presets may include vegetarian, vegan, Jain, halal, and no restriction, but expand each selected preset into editable requirements. A label is insufficient evidence of suitability. Explain what is and is not checked, especially ingredient and cross-contact questions.

**Acceptance:** a user can review and change every answer without losing the others. No payment, email, or account is required to generate a plan.

### FR-03: Generate an explainable plan

The planning engine must:

1. Validate supported inputs.
2. Exclude known violations of hard constraints.
3. Separate unknown hard-constraint evidence from verified matches.
4. Rank eligible candidates by interests, seasonal relevance, and lower travel burden.
5. Schedule visits, meals, journeys, and breaks.
6. Calculate an estimate from the scheduled items and shared costs.
7. Return the plan, explanations, outstanding checks, and catalogue/rule versions.

For demo reproducibility, identical inputs and catalogue versions return the same result with a stable tie-breaker.

Unknown hard requirements must not pass as matches. The engine may return a visibly incomplete draft with an unfilled meal or activity slot and suggested candidates under “Needs check.” It must not silently relax the requirement.

**Acceptance:** when no feasible plan exists, show the blockers and optional changes the user can choose. Preserve their requirements.

### FR-04: Fit and evidence model

Keep requirement fit separate from evidence provenance.

| Fit state | Meaning | Behavior |
| --- | --- | --- |
| Fits | Available evidence satisfies the stated requirement within its scope | Show reason and evidence; never imply booking confirmation |
| Needs check | A relevant fact is absent, stale, conditional, or unconfirmed | State the exact question and its owner |
| Conflict | A known fact violates the requirement | Explain the mismatch and offer a replacement or user-approved change |

Provenance values: `provider_confirmed`, `self_reported`, `official_source`, `unknown`, and `demo_fixture`. Include source reference, checked date, validity period, and the specific fact supported.

Aggregate rule: any relevant conflict makes the day/trip “Conflict”; otherwise any unresolved required check makes it “Needs check”; otherwise “Fits.” Show the counts and reasons beside the aggregate. Excluded optional suggestions do not affect the active plan.

Demo fixtures must remain labeled “Sample data.” They may demonstrate all three fit states but cannot be presented as real provider confirmation.

**Acceptance:** a dining venue with a vegetarian label but no ingredient evidence cannot be shown as satisfying an explicit no-fish-stock requirement.

### FR-05: Editable itinerary

Each day shows date, city, activities, meal slots, transit legs, breaks, total scheduled time, estimated walking burden, and cost.

- Replace or remove an activity; add a compatible catalogue item.
- Move an item to another day with an accessible menu; dragging is optional.
- Preserve user-locked items during regeneration.
- Recheck affected days and the overall estimate after every change.
- Show a concise change summary and allow undo of the last edit.
- Keep a conflicting edit as a clearly flagged draft, or offer to undo it; do not hide it.
- If a locked item prevents a feasible plan, explain the blocker rather than moving it silently.

**Acceptance:** moving an activity into a closed period creates a conflict. Removing a priced activity updates its day total, group total, per-person average, and budget status together.

### FR-06: Schedule feasibility

Use Japan local dates and `Asia/Tokyo` for itinerary times, independent of the viewer’s timezone.

- Model operating intervals, closed dates, visit duration, transit time, arrival buffer, and breaks.
- Require `next.start >= previous.end + transit + buffer`.
- Include intercity travel and accommodation check-in constraints when known.
- Leave unknown opening times or travel estimates visibly provisional.
- A relaxed pace uses fewer scheduled hours and explicit breaks; it must not merely change a label.
- Proposed demo pace ceilings: relaxed 6, balanced 8, active 10 scheduled hours per day, including transit and breaks. These are product defaults, not health or accessibility recommendations.

**Acceptance:** no generated day contains an unflagged overlap. An activity that ends after closing is rejected or flagged, even if its start time is valid.

### FR-07: Transparent estimate

The estimate covers the configured Japan land arrangement: accommodation, included meals, activities, local transport, intercity transport, and explicit service charges. Display international flights, visas, insurance, personal shopping, and any unspecified meals as exclusions unless a later verified package explicitly includes them.

Every price record needs currency, amount or range, charging unit, quantity, adult/child applicability, validity dates, provenance, and whether taxes or fees are included.

```text
line total = applicable unit price × quantity
group estimate = sum(included line totals) + explicit fees
per-person average = group estimate ÷ traveler count
budget difference = group budget − group estimate
```

- Room costs use rooms × nights, not travelers × nights.
- Child prices require a rule; unknown child prices remain unresolved.
- Prevent double counting of included meals, pass-covered journeys, or bundled activities.
- Use decimal arithmetic or integer minor units. Round displayed line amounts consistently and sum those displayed amounts.
- INR conversions identify their exchange-rate source and date. A fixed demo rate is labeled as a sample assumption.
- Unknown costs are “Not priced,” never ₹0. Show a known subtotal and “Estimate incomplete.”
- Ranges sum lower and upper bounds separately; show what makes the range vary.
- For a strict budget, the upper bound must fit and required costs must be known before budget can be “Fits.” A lower bound above the limit is “Conflict”; a range crossing the limit or incomplete costs is “Needs check.”
- Per-person average is not an individual child or adult quote.

**Acceptance:** a family with two adults and one child sees a group total based on the actual price rules, plus the labeled average. No unknown cost is silently omitted from a claimed complete total.

### FR-08: Save and share

- Save a versioned plan locally with a name and “Saved on this device” timestamp.
- Persist confirmed edits automatically after initial save; show storage failures without discarding the in-memory plan.
- Allow rename, duplicate, reopen, and delete.
- Warn before deleting a saved plan; offer undo when feasible.
- P0 sharing uses a readable text summary through the native share sheet, with a Copy fallback.
- Share preview includes dates, group size, route, estimates, exclusions, and open questions.
- Detailed dietary/access notes are excluded by default; the user can explicitly include them.
- Display “Copied” or “Share sheet opened,” not a claim that a recipient received it.

**Acceptance:** reopening the browser restores a saved plan. Denied storage or clipboard access produces a useful fallback.

### FR-09: Confirmation handoff

Prepare an inquiry containing the selected plan version, requested travel dates, group composition, estimated scope, unresolved questions, and contact details supplied for that purpose.

For the hackathon, show the full inquiry preview and a clear “Demo request — nothing will be sent” notice. The result says “Demo request prepared.” Do not collect real contact details unnecessarily or claim a provider has received a request.

Before a real pilot, require a configured partner, permission to share the selected details, a reliable submission endpoint, a receipt identifier, and retry protection. A request is not availability, a quote, a booking, or payment.

**Acceptance:** demo mode cannot call a live partner endpoint. A future network failure cannot produce a successful-submission screen.

## 7. Content and demo dataset

Proposed seed content, not existing travel offers:

| Trip | Purpose | Required variation |
| --- | --- | --- |
| Culture at your pace | Relaxed couple route | Temple/culture visits, breaks, lower daily transit |
| A family route | Family tradeoffs | Child pricing rules, shorter days, unresolved meal evidence |
| City interests | Anime, shopping, urban culture | Timed activity, optional alternatives, budget tradeoff |

All three use the pilot geography where feasible; not every itinerary must visit all three cities. Suggested seed size: 18 activities, 9 dining candidates, 6 accommodation records, and a small transit matrix. This is a proposed demo content budget.

Include fixtures for: a closed attraction, a fixed-date event outside the selected dates, unknown food ingredients, missing access evidence, an unpriced meal, an expensive replacement, and a stale price.

Destination names may be real; invented supplier claims, timings, rates, and availability must be labeled as sample content. Obtain and verify factual content and image rights before launch.

## 8. Data and technical specification

Follow the deck’s proposed Next.js + API + PostgreSQL architecture. Use TypeScript as the proposed implementation language. Package and hosting versions should be chosen and verified during implementation.

| Entity | Important fields |
| --- | --- |
| TravelerPreferences | Dates, group age bands, interests, pace, hard/soft requirements, budget and scope |
| Experience / Dining / Stay | ID, city, coordinates if verified, duration, operating windows, requirement facts, supplier ID |
| Evidence | Subject/fact, provenance, source, checkedAt, validFrom/Until, review status |
| PriceRecord | Subject, currency, bounds, unit, applicability, validity, inclusion scope, evidence ID |
| TransitLeg | From/to, mode, estimated minutes/cost, access evidence, validity |
| TripTemplate | Destination order, sample duration, seasonal context, seed items |
| Plan | Local ID, schema version, preferences, days, locks, estimate, checks, catalogue/rule version |
| PlanItem | Subject ID, start/end, quantity, pricing references, fit results |
| ConfirmationDraft | Plan version, questions, allowed shared fields, demo/live mode |

Keep planning, fit checking, and cost calculation as pure domain functions, independent of UI rendering. API responses are authoritative for server-derived results; client previews use the same domain rules.

Proposed API boundaries:

- `GET /api/trips` and `GET /api/trips/:slug`: published catalogue.
- `POST /api/plans/generate`: validated inputs → draft plan, checks, estimate.
- `POST /api/plans/recalculate`: edited draft → checked and versioned result.
- `POST /api/confirmation/preview`: structured inquiry only in demo mode.

Seed JSON may back the same repository interface for a local demo if PostgreSQL is unavailable. Document the adapter choice; do not pretend a database is connected.

A language model is optional and limited to explaining structured results. It must not invent prices, facts, availability, or suitability. A deterministic explanation fallback is required.

## 9. Data operations, privacy, and reliability

- Publication flow: supplier submission → operator review → published version. The MVP may use reviewed seed files instead of an admin interface.
- Only published records enter discovery. Retired records remain identifiable in saved plans.
- Use configurable freshness windows by fact type. Proposed starting policy: prices 7 days, food/access arrangements 30 days, opening hours 30 days, and event dates valid only for the named event year. Partners must approve these policies.
- Freshness expiry changes affected checks to “Needs check”; it does not erase the previous source.
- On reopening a saved plan, compare catalogue versions and flag changes. Do not silently replace a saved estimate.
- Collect age bands, not names or birth dates of children. Avoid passport information entirely.
- Local plans can contain sensitive preferences. Explain device-local storage and provide deletion. Do not include those details in analytics or URL parameters.
- Validate inputs on both client and server; limit request sizes and generation frequency; escape user-entered text.
- Public browsing should work with server-rendered content. Planner failures preserve input and expose retry.

## 10. Quality requirements

| Area | Proposed target or requirement |
| --- | --- |
| Accessibility | WCAG 2.2 AA target; keyboard completion; labeled controls; visible focus; status meaning beyond color |
| Responsive behavior | Verify 390px, 768px, 1440px; also check 320px and 200% text zoom for overflow |
| Performance | Target LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at the 75th percentile after launch; lab proxies during demo |
| Generation | Seed-data plan generation target under 3 seconds on the agreed demo environment |
| Recalculation | Target under 500ms for the small catalogue; show progress if slower |
| Reliability | Deterministic fixtures; preserved input; explicit storage, network, and stale-data states |
| Content trust | No invented testimonials, partner logos, real availability, or unsupported “verified” labels |

Targets are desired acceptance thresholds, not measured results.

## 11. Measurement and validation

The primary metric is **decision-ready plan rate**: completed plans whose users can correctly identify their fit, estimate scope, and unresolved questions during a research task.

Instrument anonymous funnel events: `trip_viewed`, `planner_started`, `requirements_completed`, `plan_generated`, `item_changed`, `evidence_opened`, `plan_saved`, `share_initiated`, `confirmation_previewed`, and later `confirmation_submitted`. A native share action is not proof of receipt.

Use plan/session IDs and coarse event properties, not free-text notes or detailed food/access requirements. Consent and analytics configuration must be settled before the pilot.

Validation from the deck:

1. Interview 15–20 travelers about an actual recent destination decision.
2. Run 8–10 usability sessions against a basic trip-list experience, counterbalancing order.
3. Pilot with partners to validate catalogue information and measure inquiry quality.

Proposed research success criteria: at least 80% of participants finish the core task without intervention, distinguish an estimate from a confirmed quote, and locate an unresolved requirement. Record time, errors, price comprehension, and before/after confidence. These are directional research thresholds, not statistically proven uplift.

Future partner metrics: qualified inquiry rate, unresolved-question resolution time, mismatch rate, and completed bookings attributable to consented follow-up. Assess referral/subscription revenue against support and acquisition costs. Paid placement must never silently override fit ranking.

## 12. Delivery sequence and release checks

| Milestone | Deliverable | Exit check |
| --- | --- | --- |
| Foundations | Schemas, seeded catalogue, shared calculation rules | Known fixtures yield expected totals and statuses |
| Exploration | Landing, discovery, details, preferences | Complete browse-to-form flow on phone and desktop |
| Planning | Generation, schedule editing, evidence, estimate | Wrong-season, dietary-gap, overlap, and recalculation tests pass |
| Decision | Save, share, demo inquiry | Persistence and failure paths work; simulation is unmistakable |
| Polish | Responsive design, accessibility, content review | Browser and visual checks completed; no unapproved factual claims |

Critical acceptance scenarios:

1. Wrong-season event cannot appear as a confirmed fit.
2. Unknown ingredient information remains “Needs check.”
3. Known hard dietary conflict is excluded from generated choices.
4. Travel plus activity duration cannot create an unflagged overlap.
5. Removing or replacing an item updates every visible total.
6. Missing costs prevent a complete-total claim and a strict-budget pass.
7. Group pricing correctly distinguishes rooms, adults, and children.
8. A saved plan survives reload; storage failure preserves the current draft.
9. Sharing excludes sensitive notes by default.
10. Demo confirmation produces no external submission.
11. Keyboard and mobile users can edit a day without dragging.
12. Stale evidence changes affected fit checks without changing historical records.

## 13. Open decisions

Defaults above allow the MVP to begin. Resolve these before the partner pilot:

- Who owns catalogue verification and supplier follow-up?
- Which partners, contact destinations, and response commitments actually exist?
- What land-arrangement costs must every estimate include?
- Which dietary/access facts can providers confirm, and how are exceptions represented?
- Are the proposed trip-duration and group-size limits appropriate?
- What source and refresh policy will support currency conversion?
- Which imagery and deck illustrations are licensed for public reuse?
- Should monetization test subscriptions, disclosed referrals, or both?

An initial static website and browser-local planner have since been implemented in `japan-your-way/`. See its README and QA report for delivered scope and verification; no user research or live partner validation is claimed.
