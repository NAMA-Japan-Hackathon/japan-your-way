# Shared Cloudflare travel API

The public API-only gateway serves the AI and price-search routes for clean GitHub checkouts. It does not expose the private website, arbitrary upstream paths, provider credentials or its service credential.

Public origin: `https://japan-your-way-api-nama.satinyshell1.chatgpt.site`

- `GET /api/travel/` returns connection flags and a signed upstream session cookie.
- `POST /api/travel/` accepts the validated interview, itinerary and chat contracts.
- `POST /api/travel/availability/` accepts validated trip details for price checks.
- All other paths are rejected, apart from a non-sensitive service description at `/`.

`worker/index.js` is the deployed Worker source. `UPSTREAM_SITE_TOKEN` is a private Cloudflare runtime secret, accepted only by the existing travel website. Its value is never committed here. Groq, SerpApi and LiteAPI credentials remain on the existing Cloudflare backend. The gateway forwards only the three listed operations and only the travel session cookie; it never relays a caller's authorization header or other cookies.

The web application's `src/lib/travel-backend.server.ts` talks to this gateway server-to-server and keeps the upstream cookie in process memory. Browsers continue using same-origin `/api/travel/` routes, avoiding cross-site cookie and CORS requirements. The local session and upstream session remain separate.

The gateway enforces bounded JSON bodies, timeouts, no redirects and per-process/per-IP request allowances. The original backend also enforces its existing validation and global/session allowances. Shared use can exhaust these limits. These in-memory controls are appropriate for the current hackathon service, not a guaranteed distributed spending cap; configure provider spending limits before a larger public launch.

Run its isolated checks with:

```sh
node --test services/travel-api/tests/gateway.test.mjs
```

Deploy this source as a separate API-only Worker. Do not change the private website's audience, publish any service token, or set `TRAVEL_API_MODE=shared` on the original upstream backend: it must continue using its private provider bindings directly.
