# Third-party notices

Stereo Aterliear View is an independent combined fork of two MIT-licensed Pi extensions. It is not affiliated with or endorsed by the upstream maintainers.

## Pi Stereo View

- Author: Alexander Shpuntenko (`alexshpunt`)
- Source: https://github.com/alexshpunt/pi-stereo-view
- Base release: v0.1.5
- Base commit: `3fe684791f1aded9e78475913787ab96213cda96`
- Copyright: Copyright (c) 2026 Alexander Shpuntenko
- License: MIT, preserved verbatim in [`licenses/pi-stereo-view.MIT`](licenses/pi-stereo-view.MIT)
- Source location: `packages/stereo/src/`
- Derived tests: `packages/stereo/test/`, `tests/fixtures/emitted-frame.ts`, and `tests/fixtures/reload-probe.ts`

The history projection, split layout, native render-cache integration, panel search, selection and copy controls, preferences, and timestamp handling originate here.

Fork changes: use the cooperative main-pane layout API and a fork-specific settings filename. Regex cancellation only signals a child with a valid PID, including when ripgrep is missing. A regression test covers that failure path. Additional combined-package tests live in `tests/`.

## Pi Atelier

- Author credited by the upstream license: Michael (`michaelmjhhhh`)
- Source: https://github.com/michaelmjhhhh/pi-atelier
- Base release: v0.16.0
- Base commit: `3b42825eb08f062db76b72a6ab988e47261866ea`
- Copyright: Copyright (c) 2026 Michael
- License: MIT, preserved verbatim in [`licenses/pi-atelier.MIT`](licenses/pi-atelier.MIT)
- Source locations: `packages/atelier/src/`, `packages/atelier/extensions/`
- Derived tests and development helper: `packages/atelier/tests/`, `packages/atelier/scripts/npm-run.mjs`

The dashboard, custom editor/status rail, Git workspace metadata, session/activity metrics, subagent accounting, sidebar integration protocol, settings, and optional desktop notifications originate here.

Fork changes: expose cooperative main-pane ownership to the transcript layout, forward Pi 1.4 overlay bounds, and use fork-specific settings filenames. Test expectations are updated for those filenames. The retained development-only npm helper validates `npm_execpath` before using it so pnpm's native executable is not passed to Node as JavaScript.

## Integration

New integration code and documentation are MIT-licensed under the root [LICENSE](LICENSE). Upstream notices apply to all copied and modified upstream code. Keep this file and both license notices with redistributed copies.
