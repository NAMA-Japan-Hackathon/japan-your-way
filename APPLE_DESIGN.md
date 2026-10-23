# Japan, Your Way — Apple design refinement

## Direction

This is a responsive Next.js website for visitors building a Japan trip around pace, dates, food needs, and budget. The job is to move from an atmospheric view of Japan into an understandable, editable plan. The signature remains the real 3840-pixel Fuji photograph and quiet scroll-drawn Kintsugi seams. Apple’s accessibility, hierarchy, and interaction principles apply; native macOS menu bars, iOS tab bars, and proprietary system glass do not become web requirements.

Use a floating functional navigation layer over the photograph, opaque surfaces for working content, system UI type for reading and controls, and the established Cormorant display face for the place-led story. Do not add more decoration to the Kintsugi signature. Preserve route contents, illustrative prices, dietary questions, saving, and sharing behavior.

## Tokens planned before layout changes

| Role | Dark website | Light reference variant | Contrast on dark raised surface |
| --- | --- | --- | --- |
| Ground | #070a0c | #f5f5f7 | — |
| Raised content | #151b21 | #ffffff | — |
| Primary text | #f4f0e8 | #16191d | 15.2:1 |
| Secondary text | #b8bec5 | #525a64 | 9.26:1 |
| Primary action | #eee7da | #20272e | 15.17:1 with #101315 action text |
| Gold signature/focus | #b79a5d | #796122 | 6.44:1 |

Light colors are documented reference values; the owner’s explicit dark website remains the shipped appearance. Primary text on the page ground is 17.47:1. Glass is a CSS approximation with an opaque fallback, not native Apple Liquid Glass or an adaptive-luminance system component.

Type roles: body 17px equivalent in rem; controls 15px; captions 13px; working titles 42px; retained fluid serif display. Use 44px or larger hit regions, adjustable content height, and visible keyboard focus. Keep text and controls usable under browser zoom.

Regular layout:

```text
       [brand        Trips / How it works / Help        Plan]
[Fuji photograph + Japan title and supporting sentence         ]
[primary plan action       secondary sample action             ]
[working sample controls       complete day timeline           ]
[place photographs / process / expanding garden / FAQ / form   ]
```

Compact layout:

```text
[brand                                         menu]
[Fuji / title / sentence / primary and secondary actions]
[sample day choices]
[preferences with labelled switches]
[day timeline]
[photographs / process / garden / FAQ / planning form]
```

The orchestrated moment is still the native-scroll Fuji and garden sequence. Frequent UI changes remain short; keyboard input and form navigation do not wait for motion. Reduced motion shows the completed compositions. Reduced transparency, increased contrast, and forced colors get opaque or system-color functional controls.

Plan critique: the floating navigation and system controls are familiar patterns; Japan’s actual photograph, serif title, and edge gold keep the subject identifiable. Glass is restricted to one navigation surface. Content panels stay opaque. This preserves the existing point of view instead of adding another competing signature.

## Guideline grounding

Installed from `dickwu/apple-design-skill` as `apple-hig-design` alongside the pre-existing, different `apple-design` motion skill. The installation will be available for subsequent turns.

- `accessibility.md › Vision`: “Support larger text sizes.” Use rem-based working text and browser zoom; retain pinch zoom.
- `accessibility.md › Mobility`: “Offer sufficiently sized controls.” Use 44px minimum controls and comfortable switch rows.
- `layout.md › Visual hierarchy`: “Differentiate controls from content.” Float navigation above the photograph; keep the trip content opaque.
- `typography.md › Conveying hierarchy`: “Minimize the number of typefaces you use”. Keep one system text stack and one existing display family.
- `materials.md › Liquid Glass`: “Don’t use Liquid Glass in the content layer.” Restrict backdrop blur to navigation; no blurred itinerary cards.
- `toggles.md › Best practices`: “Clearly identify the setting, view, or content the toggle affects.” Use stable labels and native checkbox-backed switches.
- `buttons.md › Best practices`: “Always include a press state for a custom button.” Give controls direct feedback without changing their action.
- `motion.md › Providing feedback`: “Aim for brevity and precision in feedback animations.” Use short input feedback and no added perpetual movement.

These are citations to files in the installed skill; web translations and chosen CSS measurements are implementation judgment, not Apple certification.

## Implemented review

Overall: **Good**. The website keeps the Fuji/Kintsugi identity while applying Apple’s foundations to web controls. This is a web adaptation, not HIG certification or native Apple Liquid Glass.

| Before | After | Reason |
| --- | --- | --- |
| Flat full-width header | Floating, lightly blurred functional bar over the hero | Separate navigation from photography; it scrolls away before reading content |
| Hanken reading/control text | System UI stack with existing serif display | Familiar, legible utility typography while retaining brand personality |
| Different logo marks between landing page and planner | The same 道 mark and wordmark everywhere | Continuity through the flow |
| Tiny decorative switch track and pressed-button semantics | Native checkbox-backed switches; 44×28 visual track in 52px rows; stable labels | Clear on/off state, Space-key operation, comfortable hit area |
| Form progress was hidden from assistive technology | Named progressbar with current step and range | Communicate location in the task |
| Form continued with forced smooth scrolling | Immediate step change and focus on the new heading | Respect keyboard speed and reduce unnecessary motion |
| Dialog teardown tried to focus an opener while the dialog was still modal | Close the native dialog before restoring focus | Fix React development-mode focus return and preserve native modality |
| Duplicate fixed dialog heading ID | Per-instance generated ID | Keep accessible naming reliable |
| No explicit glass fallback for accessibility preferences | Opaque fill for reduced transparency, higher contrast, or reduced motion; forced-color control states | Preserve legibility where the browser exposes these preferences |

The body/control token base is 17px equivalent; inherited content roles still include 16px paragraphs and 13px captions. No claim of full native Dynamic Type support is made. The browser can zoom and the viewport does not disable pinch zoom.

### Validation

- TypeScript passes; all 10 existing planner tests pass.
- Before: 0 failures / 4 design advisories. Final: **0 failures / 5 advisories**, inspected at 1440×900, 768×1024, and 390×844.
- Font-size roles measured on the page reduced from 13 to 11. Both display lines remain intact at every inspected width.
- The added pill-navigation advisory is the deliberate Apple-inspired functional surface requested here. Existing italic emphasis, ivory actions, broad inherited type scale, and no video remain documented choices. No video was added to the native 4K photographic hero.
- Screenshots: `.taste-skill/apple-before`, `.taste-skill/apple-verified`. Scroll sheets: `.taste-skill/apple-scenes-verified`. Reviewed the desktop, tablet, phone, and reduced-motion compositions; no failed reveal or horizontal overflow was found.
- Both Fuji and garden scenes run on desktop and phone. Reduced motion shows the complete flowing content. Rough headless sample: 111 frames, median 16.7ms, none above 34ms; not a real-device performance promise.
- Browser at 320×812: header and hero remain inside the viewport; planner dialog also fits without horizontal overflow.
- Browser behavior: menu supports Enter and Escape; Help reports `aria-current=page`; both switches respond to Space and update the sample itinerary and its customization destination. Switch row height is 52px.
- Dialog keyboard regression verified: open Rename plan with Enter, dismiss with Escape, focus returns to Rename plan.
- Preferences progress exposes step 1, advances to step 2, and focuses the next heading. Sample planner still opens and displays all days, estimates, and outstanding checks. No captured browser console errors.
- Real-phone interaction, OS accessibility settings, and 200% text-only enlargement were not tested on physical hardware. CSS media fallbacks apply only where the browser exposes the relevant preference.

### Final visual critique

Seen in one second: the Fuji silhouette and the large Japan title.

Idea: a calm Japanese journey whose small gold seams echo the details joined into a plan.

Live thing: choose a sample day and adjust pace or food before opening the working planner.

Layouts: full-bleed hero / working split / staggered photographs / portrait process / expanding garden / FAQ / planning form.

Scores: design 8, usability 8, creativity 7, content 8 → 7.8 overall. The category-level travel idea keeps creativity at 7. The serif emphasis and warm actions are owner-established choices; the functional glass navigation follows the newer explicit Apple direction.

Remaining soft spots are the inherited 11-role text scale, varying daylight/night photographic grade, and the brief image-led pause in the requested garden sequence. The navigation is not kept over scrolling text. No new accessory beyond the functional navigation was needed; the existing gold seams remain the signature.
