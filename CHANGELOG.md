# Changelog

## 0.1.1

- Use pnpm 12's `allowBuilds` policy so clean development installs can build the pinned terminal test helper. Other dependency build scripts remain denied.
- Disable automatic linking of dependency-provided agent skills in development installs.
- No extension runtime changes from 0.1.0.

## 0.1.0

- Combine Pi Stereo View v0.1.5 and Pi Atelier v0.16.0 in one extension.
- Coordinate fullscreen main-pane ownership so split history and the dashboard can coexist across resize, hide/show, and reload.
- Preserve upstream controls, native message/tool rendering, and sidebar integrations.
- Keep fork-specific display settings separate from the standalone extensions.
- Add combined layout and real-Pi integration tests, an allowlisted package audit, and upstream MIT notices.
