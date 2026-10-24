# GitHub synchronization

Public repository: https://github.com/NAMA-Japan-Hackathon/japan-your-way

The NAMA team has repository access. The local `github` remote points to this
repository. Website publishing remains a separate operation and keeps its existing
access settings.

The owner requested automatic publication of project changes. A recurring task
in this chat checks the project every five minutes. It runs:

```sh
node scripts/github-sync.mjs
```

The sync waits for 90 seconds without edits, scans source and outgoing commit
blobs for common credential formats, checks whitespace, and runs the existing
tests and production build when code or dependency files changed. It then makes
a normal commit and pushes `main`. It does not force push or reconcile remote
changes automatically. It leaves staged work to the current editing session.
If checks modify a source file or editing continues during checks, it waits for
the next run. This is periodic synchronization, not an instant upload on every
keystroke.

Commits use Naitik Singhal's configured GitHub identity. No assistant co-author,
byline, or generated-by footer is added. Image and font attribution stays intact.

To inspect pending changes without committing or pushing:

```sh
node scripts/github-sync.mjs --dry-run
```

The GitHub command-line tool is installed locally outside the repository. It
uses the existing macOS keychain sign-in; no authentication token is saved in
project source. Other machines should install and authenticate the official
GitHub CLI and configure Git authentication before running the sync.

Local scheduled work requires the Mac to be awake and the desktop app running.
See [scheduled task requirements](https://learn.chatgpt.com/docs/automations?surface=app).
