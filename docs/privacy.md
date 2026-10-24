# Privacy and release checks

See [credits](../THIRD_PARTY_NOTICES.md) for the two upstream projects this package derives from.

## Runtime data

This extension runs inside Pi with the same operating-system permissions as Pi. It is not a sandbox or a secret filter.

It reads:

- The current Pi session branch to render conversation, tools, metrics, and TODOs.
- Git status and related metadata after project trust is granted. It does not read untracked file contents.
- Local, session-owned subagent metadata and diagnostic accounting files for cost charts. Numeric cost/time projections are retained; prompt/reply text from those files is discarded.
- Its own display settings. Project-level dashboard configuration is read only for trusted projects.

It writes:

- Local display preferences under the Pi agent directory, with the fork-specific filenames listed in the README.
- Display-only tool timing and subagent accounting references through Pi's session-entry API.
- Clipboard text only when a user invokes copy.

Pi continues to save sessions, tool output, and attachments according to Pi's own settings. This extension does not disable that behavior.

## Network and operating-system actions

There are no extension-owned network requests, analytics, or telemetry. Pi, its model providers, and other extensions can still use the network.

Optional desktop notifications invoke native macOS or Windows notification facilities. They can show workspace or session names and completion counts; disable completion notifications in `/atelier` if those names are sensitive. Regex search invokes local ripgrep with a bounded deadline. Git reads invoke the local Git executable.

Preferences are not session transcripts. This repository and its package do not include the developer's live settings, sessions, memory stores, workspaces, or credentials.

## Release checks

Before any public push or package upload:

1. Run the type checks, lint, combined tests, and upstream unit tests.
2. Run `pnpm check:package`. It creates the exact npm archive in a temporary directory, checks its allowlisted paths, inspects text contents, and checks that upstream licenses are intact.
3. Run a secret scanner against the working tree and staged Git snapshot. Inspect any findings instead of assuming every high-entropy string is a credential.
4. Search the Git file list for credentials, local settings, session data, private paths, and internal identifiers. Test artifacts and screenshots must use synthetic data.
5. Review the complete staged diff before the first public commit. Do not copy private repository history into the public repository.
6. After publication, verify the public Git commit/tag and release archive digest. npm publication additionally requires an authenticated publisher; never put a publishing token in this repository.

The archive allowlist excludes tests, test runs, local agent configuration, lockfiles, CI files, and development tooling. The public Git repository includes synthetic tests and its dependency lockfile for reproducibility, but not local test artifacts.

Automated checks reduce risk; they cannot prove arbitrary source code or screenshots contain no private information. Keep manual review in the release process.
