<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## GitHub publication

The public repository is `https://github.com/NAMA-Japan-Hackathon/japan-your-way`.
The owner revoked automatic pushing on 24 October 2026. Push only when the
human explicitly asks to push. Finishing a change, a scheduled message, or a
previous automatic-publication instruction does not authorize a push. Do not
create recurring sync tasks. Keep local work unpushed until requested.

When the owner asks to push, verify the intended changes and publish to the
`github` remote on `main`. Preserve unrelated work. Never force push, rewrite
published history, or publish credentials or local browser data.

Use the owner's configured Git identity. Do not add assistant authors,
`Co-authored-by` trailers, generated-by footers, or assistant bylines to commits,
pull requests, or documentation. Existing factual image/font credits remain.

The optional helper defaults to inspection without publishing:
`node scripts/github-sync.mjs --dry-run`. Its `--push` option may be used only
after an explicit human push request. Website deployment and access changes are
separate from a GitHub push.
