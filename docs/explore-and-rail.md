# Reviews, nationwide discovery and rail atlas

24 October 2026. These features extend the existing static-export Next.js site.

## Routes and architecture

- `/reviews/`: Food and Shopping, query-string filters and place deep links. The Reviews pill immediately follows the wordmark, including on mobile.
- `/metro/`: national overview, lazy-loaded city networks and complete server-rendered station lists. Query strings select a city or station. No-JS readers can expand every line list.
- `/explore/`: all 47 prefectures in ten JNTO tourism regions, with official regional guides and links to supported city maps.
- `src/lib/explore.ts`: pure filters, deterministic sorting, URL and local-note parsing.
- `src/lib/metro.ts`: station search, graph, fitting, geometry and collision-aware labels.
- `src/lib/data-validation.ts`: sources, dates, references, images, geometry and nationwide coverage validation.
- `src/data/`: sourced static records. Review regions and city network geometry load separately. Results use bounded pages of 24 records, rather than mounting the full catalogue.

Native dialogs trap focus, close on Esc and restore focus. Your note is device-local text and score, with storage errors shown. No public reviews or backend were added. Map controls support drag, pinch, keyboard pan/zoom and Ctrl/Command-wheel zoom. A normal wheel scrolls the page. Trace a line dims context and fits its stops.

## Data coverage

153 real restaurants: Tokyo 58, Kyoto 48, Osaka 47. Worth visiting means cited current recognition or a clearly dated historical JNTO signal. Recognition is independent of ingredient evidence. There are no fabricated customer ratings: numeric rating arrays are empty, so unsupported numeric minima return no results. Eight vegan policies and one further vegetarian policy are verified; most dish ingredients and cross-contact remain Needs check. Historical JNTO references date to March 2017 and never establish current menus or hours.

32 shopping places: 14 districts, 8 malls, 5 markets, 5 specialty destinations. Unknown hours and closures remain Needs check. Editorial visit suggestions are not live crowd data.

| City | Systems | Stations |
|---|---:|---:|
| Sapporo | 3 | 46 |
| Sendai | 2 | 29 |
| Tokyo | 13 + Marunouchi branch | 216 |
| Yokohama | 2 | 40 |
| Nagoya | 6 | 87 |
| Kyoto | 2 | 31 |
| Osaka | 9, including New Tram | 109 |
| Kobe | 2 | 26 |
| Fukuoka | 3 | 36 |
| Naha | 1, Yui Rail | 19 |

Total: 639 stations, 43 systems plus one branch record. The national view has 65 selected hubs and 28 major rail corridors. It does not include every Japanese station or operator. It is not a timetable, a fare or a promise of a direct train. Okinawa has a separate island network and no mainland rail link. Full nationwide scheduling, expanded local rail coverage and restaurants beyond the three researched cities remain future work. Three original editable itinerary fixtures remain sample routes.

## Artwork and photographs

Connected city schematics use shared interchange nodes and original octilinear paths. Layout is approximate, informed by individual factual coordinates, rounded and interpolated where absent. The coordinate reference has no explicit database license; its source data file is not redistributed. Natural Earth country outlines are public domain. Sources are linked on the credits page and attached to data records.

Seven open-licensed image assets and 51 individually selected personal-use assets are credited. Twenty-three restaurant records have verified named storefronts: Tokyo 12/58, Kyoto 8/48 and Osaka 3/47. All 32 shopping records have a matching location image; 25 were individually sourced for this catalogue pass. The remaining 130 restaurants use typographic placeholders. A public clone uses placeholders for the ignored personal-use files. Smaller sources are not enlarged. The existing Fuji hero retains a native 3840-pixel variant. Full missing-photo list and individual credits: [image-fallbacks.md](image-fallbacks.md).

## Allergens

CAA 1 April 2026, checked 24 October 2026: nine mandatory and twenty recommended packaged-food allergens. Original SVG icons support contains, may-contain, free-verified and unknown, with symbols and text. This list is not restaurant safety certification. Confirm recipe and cross-contact with the venue.

[CAA source](https://www.caa.go.jp/policies/policy/food_labeling/food_sanitation/allergy/assets/food_labeling_cms204_260401_01.pdf).

## Visual direction

The existing dark photographic direction, Cormorant display face, system reading face, ivory controls and muted-gold Kintsugi seams remain. Existing four map inks and patterns distinguish routes; tracing changes emphasis. Native scroll, photo drift, section entrances and one-time rail drawing respect reduced motion and readable static content. No UI or animation dependency was added.
