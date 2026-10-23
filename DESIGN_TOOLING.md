# Design and motion polish — 23 October 2026

The owner asked to install and apply Taste, Emil Kowalski's skills, Impeccable, and Libraries.dev. This is a refinement of the existing Japan, Your Way website. The Fuji photograph, dark silhouette, Cormorant typography, native scroll, edge-only gold Kintsugi, product copy, and planner behavior remain the visual and functional authority.

## Installed tools

- Taste: existing `design-taste-frontend` retained.
- Emil Kowalski: all 15 skills installed globally from the canonical `emilkowalski/skills` repository. Web design engineering, animation performance, and mobile guidance were applied here; unrelated native Swift/Expo/toast tools remain available for suitable future work.
- Impeccable: global Codex skill and local hook configuration installed using its official installer. Its existing-surface polish guidance informed focus, selection contrast, responsive behavior, and state feedback. Hook trust is managed by Codex; installation alone does not establish that automatic hooks are active in this conversation.
- Libraries.dev: skill installed; `border-beam@1.4.1` integrated into one real planning action. Voice visualizers, bot avatars, thinking orbs, and liquid metal effects have no justified role in this travel planner and were not added.

## Before / after / why

| Before | After | Why |
| --- | --- | --- |
| Mobile menu had only an expanded toggle | Connected disclosure, focus to first link, Escape returns focus, outside pointer dismisses, desktop resize closes | Predictable keyboard navigation and dismissal |
| Sample-day changes animated for 450 ms | 220 ms, 6 px travel for pointer changes; keyboard changes are immediate | Faster, less repetitive feedback |
| Hover styling also applied to touch | Hover rules require a fine pointer that supports hover | Avoid sticky touch hover states |
| White text selection on an ivory accent | Gold selection with dark text | Preserve selection legibility |
| Some phone fields used text below 16 px | Coarse-pointer input text is at least 16 px | Avoid automatic focus zoom on iOS |
| No explicit safe-area viewport configuration | Dark browser theme, cover viewport, safe-area-aware home header/hero/footer and bounded dialogs | Better browser and phone ergonomics without disabling pinch zoom |
| Hero copy faded to 48% while scrolling | Ends at 72% | Keep supporting content more readable during the hold |
| Held scenes could clip on short landscape screens | At heights at or below 600 px, ordinary flowing compositions; scenes return in portrait | Keep every action reachable in short viewports |
| Plain final planning action | Subtle monochrome inner glow on actual mouse hover, with an outside keyboard focus ring | A restrained Libraries.dev accent that fits the existing material palette |

The beam uses only free documented options, keeps a native submit button, and is inactive for reduced motion, coarse pointers, or a hidden tab. The package pauses offscreen instances. There is no fabricated loading state or WebGL renderer.

## Verification

- TypeScript: passes.
- Existing planner tests: all 10 pass.
- Desktop/tablet/phone inspection at 1440×900, 768×1024, 390×844: **0 failures, 4 warnings before and after**. Saved to `.taste-skill/tools-before` and `.taste-skill/tools-final`.
- Source lint: 0 failures; 10 existing advisories about outlined controls, functional “Unlock” labels, and ISO date padding. Those are working interface semantics, not decorative marketing devices.
- Impeccable source detection: no source-pattern findings in the six changed UI files. It reported regex-only coverage; this is not a full browser accessibility audit.
- Both held scenes run on desktop and phone. Reduced motion shows the complete flowing compositions. Sheets in `.taste-skill/tools-scenes-final` were visually reviewed.
- Rough headless animation sample: 110 frames, 16.7 ms median, none above 34 ms. This is a local diagnostic, not a guarantee on real devices.
- Browser interaction: keyboard menu opening focuses Trips; Escape closes and restores the trigger. Keyboard Day 2 updates immediately with no content animation. Final form carries Balanced / No restriction into all five planner steps and successfully generates the 7-day trip. No captured browser console errors.
- Browser landscape 844×390: no held scenes and no horizontal overflow; portrait 390×844 restores both scenes without horizontal overflow.
- Phone sizes were emulated. Touch feel, notches, and browser chrome still warrant real-phone verification.

The four unchanged visual warnings are intentional serif italic emphasis, the owner-approved warm ivory actions, 13 existing type sizes, and no video. Existing photography is the requested 4K hero and keeps the download lighter than added footage; no asset is represented as higher resolution than its source.

## Screenshot critique — round 1

Seen in one second: Fuji and the illuminated pagoda, answered by the large Japan title.

Idea: an unhurried journey through Japan, with quiet gold seams joining the details.

Live thing: the visitor changes a sample day, pace, and food requirements before building an editable trip.

Layout words by section: hero=full-bleed / sample=interactive split / trips=staggered photographic columns / process=portrait split / garden=expanding window / FAQ=disclosures / close=photo-backed form.

Scores: design 8 · usability 8 · creativity 7 · content 8 → overall 7.8. Creativity is capped at 7 because the broad travel concept also fits nearby competitors.

Three remaining soft spots, preserved within this refinement:

1. The inherited type scale is broad (desktop fold and itinerary sheet). A later full typography pass could consolidate small roles without changing the display face.
2. The photographic grade varies between the night hero and daytime route stories (desktop page 1–2). These are real place photographs; keep their credits and avoid flattening useful detail with stronger filters.
3. The tall garden reveal includes a short image-led pause (scene sheets). It is an owner-requested scroll moment; phone hold is already shorter and landscape/reduced-motion layouts do not hold.

No new overlap, clipped controls, blank failed reveal, or broken mobile wrap was found in the reviewed sheets. No bookings, provider messages, payments, or public access changes were introduced.
