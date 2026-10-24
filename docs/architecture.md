# Layout ownership

Stereo Aterliear View is a combined fork, not a new renderer. See [upstream credits and exact revisions](../THIRD_PARTY_NOTICES.md).

## Why the standalone extensions conflict

Pi Stereo View expects Pi's fullscreen root to be a `VStack` with a native history `ScrollView` and a dock `VStack`. Pi Atelier wraps that root in an `HStack` to reserve sidebar columns. Stereo View correctly rejects that wrapper as an unsupported layout.

Loading one first is not enough. Stereo View checks ownership again during updates, and Atelier can rebuild its wrapper when sidebar dimensions change.

## Cooperative main-pane ownership

The entrypoint loads the dashboard and transcript features once and awaits the transcript's asynchronous registration before returning to Pi. There is one Pi package and one declared extension.

The dashboard module exports two internal functions:

- `getMainLayoutRoot(tui)` returns the root inside the dashboard's owned wrapper, or the native root if no owned wrapper is active.
- `setMainLayoutRoot(tui, root)` updates that main pane and rebuilds the dashboard wrapper while retaining its width, visibility, and component. Without an owned wrapper, it delegates to Pi.

Stereo View uses these functions when checking, mounting, searching, and restoring its history layout. It still validates Pi's native history structure and leaves the input dock intact.

Resulting fullscreen tree, simplified logical view:

```text
Dashboard HStack
├── Main pane
│   └── Transcript VStack
│       ├── History controls
│       ├── Conversation + Activity (columns, rows, or one zoomed panel)
│       └── Original input dock and Atelier status rail
└── Dashboard panels
```

The sidebar wrapper can be resized or removed without losing the transcript root. Either feature can detach first on reload or shutdown. Restoration only happens while a feature still owns the matching root; an unrelated extension's later layout is not overwritten.

## Preserved behavior

- Native Pi message and tool renderers, tool execution, and saved session order.
- Conversation/activity projection, copy, literal/Boolean/regex search, timestamps, zoom, rows/columns, and independent scroll positions.
- Atelier's status rail, settings, sidebar event protocol, Git metadata, usage panels, and optional desktop notifications.
- Combined-history fallback for regular mode, small terminals, and unsupported host structures.

This fork does not add model tools, change prompts, or route model requests. It does not add a network client or runtime dependencies.

## Verification boundaries

The test suite exercises real Pi 1.4.0 with scripted synthetic responses and real tool execution. Layout tests cover both attachment orders, sidebar resize/hide/show, both disposal orders, and foreign-root preservation. An entrypoint regression test ensures Pi waits for asynchronous registration. Upstream unit tests are retained. The inherited standalone integration fixtures remain in the repository as reference; the release check runs the combined integration suite, not every standalone upstream integration test.

A changed Pi layout is a compatibility risk despite the minimum-version declaration. Terminal font appearance, macOS notification delivery, and image protocols still need hardware-specific checks.
