# Stereo Aterliear View

**Conversation, activity, and a live dashboard. One Pi extension.**

Stereo Aterliear View combines [Pi Stereo View](https://github.com/alexshpunt/pi-stereo-view) and [Pi Atelier](https://github.com/michaelmjhhhh/pi-atelier). It keeps their native message rendering and controls, and makes their fullscreen layouts cooperate.

```text
┌ Conversation ─────┬ Activity ───────────────────┬ Dashboard ──────┐
│ You and the agent │ Thinking, tools, results    │ Workspace       │
│                   │                            │ Agent           │
│                   │                            │ Context         │
├───────────────────┴────────────────────────────┤ Tools           │
│ Input and status rail                          │ Activity        │
└────────────────────────────────────────────────┴─────────────────┘
```

The dashboard keeps its own column. Conversation and Activity share the remaining space; the input spans both, not the dashboard. You can also stack Conversation above Activity.

## Install

Requires Pi **1.4.0 or newer**, Node.js **22.19.0 or newer**, and fullscreen mode for split history. The compatibility target for this release is Pi 1.4.0; a changed host layout is rejected with a warning rather than patched blindly.

Install the release from GitHub:

```sh
pi install git:github.com/brndnsvr/stereo-aterliear-view@v0.1.1
```

**Disable or remove standalone `pi-atelier` and `pi-stereo-view` before enabling this package.** Running their renderers alongside the combined fork is unsupported. Other extensions that replace the editor or footer may also compete for those slots.

Explicit `regex:` search also needs ripgrep (`rg`) with PCRE2 support on your `PATH`. Literal and Boolean-literal search do not need it.

Start a new Pi session. Choose fullscreen in `/settings`, or start Pi with `--tui-mode fullscreen`. Regular mode retains combined history and Atelier's regular-mode dashboard behavior.

## Controls

The original names remain, deliberately:

- **F6** or **`/atelier`** — dashboard, status rail, model/tool controls, and display settings.
- **`/stereo-view`** — toggle split history.
- **`/stereo-view layout rows`** — put Conversation above Activity.
- **`/stereo-view layout columns`** — return to side-by-side history.
- **Ctrl+F** — search the active history panel.
- **Ctrl+Alt+T** — toggle split history.
- **Ctrl+Alt+S** — swap history panels.
- **Ctrl+Shift+R** — resize the dashboard in manual mode.

Drag the history divider to resize Conversation and Activity. Each has independent scrolling, text selection, copy buttons, and timestamps. See [all controls](docs/controls.md).

## Settings

This fork does not import or overwrite the standalone extensions' settings.

| Scope | File |
| --- | --- |
| User dashboard | `<Pi agent directory>/stereo-aterliear-view.dashboard.json` |
| Trusted project dashboard | `.pi/stereo-aterliear-view.dashboard.json` |
| User transcript | `<Pi agent directory>/stereo-aterliear-view.transcript.json` |

The default Pi agent directory is `~/.pi/agent`. The dashboard's startup visibility and notification preferences are user-only. Sidebar width and visibility remain session-scoped; transcript layout preferences survive restart.

## Privacy

No analytics, telemetry, or extension-owned network requests. The extension renders local session data, reads read-only Git metadata, and can read local subagent accounting files. Optional desktop notifications can show workspace/session names. Display preferences are saved locally, not conversation text. Pi itself still records sessions normally.

This is **not** a redaction or sandbox extension. Do not publish screenshots or logs containing private conversations, tool output, paths, or hostnames. See [privacy and release checks](docs/privacy.md).

## Credits

This package exists because two other people did the hard work:

- **[Alexander Shpuntenko](https://github.com/alexshpunt)** — [Pi Stereo View](https://github.com/alexshpunt/pi-stereo-view), the conversation/activity split, native history projections, search, copy, timestamps, and controls. Based on **v0.1.5**.
- **[Michael](https://github.com/michaelmjhhhh)** — [Pi Atelier](https://github.com/michaelmjhhhh/pi-atelier), the dashboard, status rail, workspace and usage panels, settings, and sidebar integrations. Based on **v0.16.0**.

Both projects are MIT-licensed. Their copyright and license notices are preserved in [`licenses/`](licenses/) and [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md). This is an independent combined fork, not an official release or endorsement from either upstream. Upstream projects remain the source of their respective designs and features.

Our integration changes are documented in [architecture](docs/architecture.md). The original `/atelier` and `/stereo-view` controls and Atelier sidebar event protocol remain for familiarity and compatibility.

## Development

```sh
pnpm install --frozen-lockfile
pnpm check
```

Tests use temporary agent directories and synthetic conversations, not the developer's live Pi settings or sessions. The release archive uses an explicit allowlist. `pnpm check:package` inspects that archive and rejects unexpected files or private-looking content. See [release checks](docs/privacy.md#release-checks).

## License

MIT. See [LICENSE](LICENSE) and the [upstream notices](THIRD_PARTY_NOTICES.md).
