# Cinematic UI and Kintsugi revision — 21 October 2026

The owner supplied a Stitch export, then requested animation throughout the page, a high-quality hero, and small gold-filled cracks that appear with scrolling. Those explicit preferences replace the previous geometric hero and take precedence over the skill's default restrictions on ornament and italic display type.

## Implemented direction

Retained direction: **The product performs**, seed **1154879022**; working app style **Achromatic ledger**, seed **554352894**. No random direction redraw. The supplied reference sets Cormorant Garamond display type, warm ivory actions, blue-black surfaces, and a photographic hero. The planner remains in the existing Next.js/React stack.

Idea: the imagined possibility of Japan opens into the specific choices of a checkable day; small Kintsugi seams connect the chapters without competing with them.

Live thing: four sample days, pace and food toggles. The closing form transfers pace and food preference into the working planner. A No restriction starting selection clears the default fish-stock constraint, while manually entered ingredient requirements remain supported.

The reference's testimonials, bookings-open claims, guaranteed restaurant arrangements, concierge service claims, and email submission are not asserted by this demo. All price and supplier limitations remain visible.

## Motion

- Hero: native-scroll photo movement and scale, with a gentle title shift.
- Itinerary: independent panel entrances and a short state transition when changing a day.
- Collection: staggered arrivals and quiet photo movement.
- Process: image movement and separate heading, paragraph, and step entrances.
- Garden: a clipped photograph opens to full width on the shared Taste stage.
- Questions and closing: row and form entrances; photo movement behind the close.
- Kintsugi: six small asymmetric, branched SVG cracks in the page margins. Dark underlines receive narrow muted-gold strokes, drawn according to scroll progress. They are pointer-transparent, hidden from assistive technology, and kept outside text and control areas. Phone seams narrow to 21 pixels.
- Reduced motion: ordinary readable sections, still pictures, completed gold seams. No wheel interception or custom cursor. Animation contexts revert on navigation. Content already visible during page restoration is not hidden to replay its entrance.

## Hero quality

The supplied image is **512 × 286**. The built-in image generator produced a new **1672 × 940** mood image; it is retained as an unused concept in `output/imagegen/fuji-dusk-concept.png`, not presented as 4K. Its brief requested an exceptionally detailed, text-free, blue-hour Fuji landscape with a pagoda to the right and quiet space to the left.

The deployed hero instead uses a genuine **3840 × 2371** source photograph. It is served as 960, 1920, and 3840-pixel WebP variants; portrait `sizes` accounts for the full-height crop so phones do not receive a tiny source stretched vertically. No artificial enlargement is used. The original JPEG is retained for download.

Hero photograph: **Arakurayama Sengen park morning & evening from Flickr 8656223105 (cropped)**, **tzuyaya**, **CC BY 2.0**, [source](https://commons.wikimedia.org/wiki/File:Arakurayama_Sengen_park_morning_%26_evening_from_Flickr_8656223105_(cropped).jpg), [license](https://creativecommons.org/licenses/by/2.0/). WebP encoding, responsive sizing, CSS color treatment, and layout cropping are disclosed on `/credits/`.

The five existing Commons destination images and their individual titles, creators, source pages, and CC BY-SA 4.0 licenses remain in `public/images/credits.json` and on `/credits/`; their placement and full list also appear in `QA.md`. Cormorant Garamond and Hanken Grotesk are served locally with their SIL Open Font License files.

## Verification

Before: `.taste-skill/stitch-before/report.json`: 0 FAIL, 1 WARN at 1440, 768, and 390 pixels.

After: `.taste-skill/stitch-verified/report.json`, at 1440×900, 768×1024, and 390×844. Headings fit at most two lines, no small-text failures, no overflow or collision failures. All listed screenshots reviewed. Source lint: 0 FAIL, 0 WARN; inline exceptions describe allowed neutral photographic scrims.

Scenes: `.taste-skill/stitch-scenes-final/` includes both scenes at every 10% of their progress, desktop and phone, and the reduced-motion page. Both scenes run. A headless timing sample recorded a 16.7ms median and no frame over 34ms; this is a rough check, not a device benchmark.

The native-browser journey checked sample-day selection, pace and food toggles, FAQ expansion, and closing-form handoff to the planner. Balanced and No restriction were carried through correctly. The existing ten domain tests and the production build remain release checks.

Retained visual warnings: italic serif display and warm ivory follow the supplied design; additional sizes occur in the real working timeline alongside editorial type; no video is used because the requested photographic and Kintsugi motion is driven directly by scrolling. The gold edge detail is explicitly requested by the owner.

## Final critique

ROUND 3

Seen in one second: an ivory Japan title against a sharp night view of Fuji and a lit pagoda.

Idea: a quiet destination scene becomes an editable, checkable day, joined by small gold seams.

Live thing: sample day, pace, food choice, and the working planner handoff.

Layout words: hero=photographic stage / itinerary=working two-pane timeline / collection=staggered photographs / process=portrait and narrative / garden=opening window / questions=accordion / closing=landscape and form.

Scores: design 8.0 · usability 8.1 · creativity 7.7 · content 8.0 → overall 8.0. These are the author's review scores, not an external award or research result.

Three corrections: replaced the soft 512-pixel backdrop with native 3840-pixel photography; moved the itinerary and page labels to readable sizes; corrected inherited hero-route width and the closing photo/scrim to span their intended area.

Remaining limits: the night photograph is a different composition from the supplied mood image; its shadows intentionally stay dark. The underlying catalogue, allowances, and provider handoff remain demo content and require reviewed operational data before commercial launch.
