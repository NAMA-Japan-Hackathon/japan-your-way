# Adaptive Japan planner

`/plan/` uses Groq to conduct an adaptive interview. There is no five-step form for new trips. The first broad prompt leads into a conversation; each model turn receives the previous answers and the current profile. The user can skip questions, correct answers, create a draft before everything is known, or keep refining. For bounded context and cost, each request accepts up to 80 messages / 65,000 characters; itineraries support up to 60 days per draft.

The itinerary includes daily activities, transit guidance, meals, overnight bases, estimated group allowances in INR and unresolved checks. Estimates are not live quotes. Updates to the interview mark an existing draft as needing revision and clear its old price checks. The persistent assistant uses active AI trip context across routes and stays focused on Japan travel. It suggests edits; it does not silently mutate a saved itinerary.

## Credentials and local operation

Use Node 22+. Copy `.env.example` to `.env.local` and fill in:

| Variable | Purpose |
| --- | --- |
| `GROQ_API_KEY` | Required for interview, generation and chat |
| `GROQ_MODEL` | Defaults to `openai/gpt-oss-120b`; must support strict JSON schema outputs |
| `SERPAPI_API_KEY` | Optional Google Flights and Hotels searches |
| `LITEAPI_KEY` | Optional direct hotel rates; `sand_` credentials always produce explicitly labeled test results |
| `APP_ORIGIN` | Canonical public HTTPS origin in production |
| `TRAVEL_SESSION_SECRET` | Long random secret shared by production server instances |
| `TRAVEL_HOURLY_LIMIT` | Per-process global request allowance; defaults to 160 |

Restart the server after credentials change. Never prefix provider credentials with `NEXT_PUBLIC_`. `.env.local` is ignored by Git; `.env.example` contains placeholders only. Credentials go only to the corresponding official service. Responses and errors never echo credentials.

Run `npm run dev` at `http://127.0.0.1:3000/`. The hosted build uses `npm run build` to package the existing app with Vinext for Cloudflare Workers. The tracked `.openai/hosting.json` preserves the existing Site identity and intentionally omits `static`; an old `out/` directory cannot serve the AI routes. `npm run build:next` followed by `npm start` remains available for a conventional Next.js server.

Production provider credentials are configured through the Sites private runtime environment, injected into the Cloudflare Worker with Node compatibility. The browser calls only same-origin `/api/travel/` endpoints. The Worker reads `GROQ_API_KEY`, `SERPAPI_API_KEY` and `LITEAPI_KEY` at runtime and calls their official services. No endpoint returns key values. A separate random `TRAVEL_SESSION_SECRET` signs browser session cookies, and `APP_ORIGIN` restricts calls to the canonical HTTPS website. Runtime secrets are not stored in GitHub, deployment manifests or build artifacts. Changing a hosted value requires deploying a saved version for it to take effect.

Use `npm run dev:cloudflare` for the Cloudflare development runtime or `npm run preview:cloudflare` after a Worker build. The original `npm run dev` stays available for Next.js development. Local `.env.local` credentials remain private and are not uploaded as source. GitHub pushes remain manual; hosting publication uses the separate Site source repository and preserves its existing audience.

## Server routes

- `GET /api/travel/`: connection flags only; issues an HttpOnly same-site signed session cookie.
- `POST /api/travel/`: bounded, validated interview / generation / chat requests. System instructions and Groq endpoint are server controlled; callers cannot add a system role. Strict JSON schema output is validated again before it reaches the UI. Timeouts, truncation and provider errors preserve the user's previous work.
- `POST /api/travel/availability/`: uses explicit dates, airports and occupancy to search sources independently of the LLM. It does not make reservations, prebook or take payment.

POST routes require the same origin and a signed cookie. Bodies are limited even without Content-Length. In-memory per-session and per-process hourly limits reduce accidental use. They are not a distributed abuse-control system: before a broad public launch, add a shared rate limiter and configure spending limits with the providers. Configure the canonical origin and HTTPS on the runtime host.

## What price checks mean

With SerpApi enabled, one check requests an economy return-flight search plus hotel searches for the first four overnight bases, in INR with `gl=in`. Server requests disable SerpApi caching. Results are attributed to Google Travel via SerpApi, with the exact search scope and attempt time. They are search snapshots, not independent MakeMyTrip/Agoda verification or guaranteed bookable offers. Source-returned hotel totals with missing tax information stay explicitly uncertain. Independent hotel-base searches run concurrently within the four-base cap so timeouts do not add up across the whole itinerary. Flight fare scope, baggage and final passenger total require a booking-provider check. API credentials and provider pagination URLs are never returned.

The current adapter supports same-airport return itineraries, explicit adult/child composition, no infant seating assumptions and single-room hotels. Unsupported multi-city flights, multi-room occupancy, missing dates, unknown airports and unconfirmed party details remain “More details needed”. Dates must be future and hotel nights must fall within the confirmed trip. More than four bases are explicitly marked unchecked.

When LiteAPI is connected, the same overnight bases are also searched directly with `countryCode=JP`, exact dates, one-room occupancy and the voluntarily supplied guest nationality. Nationality is not inferred from origin. Only INR amounts associated with matched hotel metadata are displayed. A sandbox key or response is always “Sandbox test data”, excluded from real-price claims and totals; its amounts cannot establish availability. No prebook or booking endpoint is called. Production hotel rates still require reconfirmation before purchase.

Manual MakeMyTrip, Agoda, JAL and ANA links are comparison links only. No official MakeMyTrip/Agoda partner access is configured. Groq cannot verify prices from its training data.

## Privacy and state

Conversation and trip context are stored in this browser and sent to Groq to respond. Price checks send route/dates/occupancy to SerpApi and, when enabled, relevant hotel search details to LiteAPI; they do not send the full chat. No conversation database, account, analytics integration or third-party tracking script has been added.

Saved AI trips use their own versioned storage keys, leaving earlier saved fixture plans intact. Users can save, reopen, delete a saved copy, clear chat, start a fresh trip or download a text itinerary. Downloads may include dietary/access notes in the itinerary; the help page tells travelers to review before sharing. Local deletion cannot erase content already processed by an external provider. Storage failures are visible and do not pretend a save succeeded.

## Provider references

- [Groq strict structured output](https://console.groq.com/docs/structured-outputs)
- [SerpApi plans](https://serpapi.com/pricing), [Flights](https://serpapi.com/google-flights-api), [Hotels](https://serpapi.com/google-hotels-api)
- [LiteAPI rates](https://docs.liteapi.travel/reference/post_hotels-rates), [access and sandbox](https://docs.liteapi.travel/docs/faq), [usage pricing](https://docs.liteapi.travel/reference/api-pricing-usage-costs)

Free access is not the same as unlimited production inventory. LiteAPI's core hotel workflow has reasonable-use conditions; some endpoints are billed. Booking.com, Agoda and Skyscanner require partner approval. The chosen initial connections do not require those accounts.
