# GitHub publication

Public repository: https://github.com/NAMA-Japan-Hackathon/japan-your-way

Automatic synchronization is disabled. The five-minute scheduled task was
deleted at the owner's request on 24 October 2026. Push only when the owner
explicitly says to push; ordinary edits remain local until then.

The `github` remote points to the public repository. Website deployment and
access settings are managed separately.

Inspect pending changes without committing or pushing:

```sh
node scripts/github-sync.mjs --dry-run
```

Only after an explicit push request, the helper can publish:

```sh
node scripts/github-sync.mjs --push
```

Running the helper without options also defaults to inspection. It checks
common credential formats and outgoing commit blobs. When pushing source or
dependency changes, it runs the existing tests and production build. It does not
force push or reconcile divergent remote history automatically, and it preserves
staged work.

Commits use Naitik Singhal's configured GitHub identity. No assistant co-author,
byline, or generated-by footer is added. Image and font credits remain intact.

The local GitHub CLI uses the existing macOS keychain sign-in; no authentication
token is saved in project source.
