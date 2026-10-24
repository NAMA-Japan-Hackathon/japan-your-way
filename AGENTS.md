<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## GitHub publication

The owner has explicitly authorized this project to be public at
`https://github.com/NAMA-Japan-Hackathon/japan-your-way` and requested automatic
pushes for future project changes. After finishing and verifying an authorized
change, commit and push the project to the `github` remote on `main` without
asking for the same permission again. Preserve any unrelated work. Never force
push, rewrite published history, or publish credentials or local browser data.

Use the owner's configured Git identity. Do not add assistant authors,
`Co-authored-by` trailers, generated-by footers, or assistant bylines to commits,
pull requests, or documentation. Existing factual image/font credits remain.

The recurring sync runs `node scripts/github-sync.mjs`. It waits for a quiet
working tree, checks credentials and source for accidental secrets, runs the
existing test suite, and pushes only a normal fast-forward update. Do not change
website access or deploy the hosted site as a side effect of a GitHub-only sync.
