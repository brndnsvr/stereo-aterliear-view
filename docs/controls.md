# Controls

The upstream command names are preserved to credit their origin and keep familiar muscle memory. See [Pi Stereo View and Pi Atelier credits](../THIRD_PARTY_NOTICES.md).

## History — Pi Stereo View

| Action | Command or shortcut |
| --- | --- |
| Toggle split | `/stereo-view` or Ctrl+Alt+T |
| Columns / rows | `/stereo-view layout columns` / `/stereo-view layout rows` |
| Swap panels | `/stereo-view swap` or Ctrl+Alt+S |
| Conversation width | `/stereo-view width 40` |
| Conversation height | `/stereo-view height 12` |
| Automatic height | `/stereo-view height auto` |
| Zoom / restore | `/stereo-view zoom chat` / `/stereo-view zoom activity` |
| Scroll | `/stereo-view scroll chat -10` / `/stereo-view scroll activity -10` |
| Switch active panel | Ctrl+Alt+Up or Ctrl+Alt+Down |
| Resize Conversation | Ctrl+Alt+Left / Ctrl+Alt+Right, or drag its divider |
| Search active panel | Ctrl+F or the panel's search button |
| Next / previous search match | Enter / Shift+Enter |
| Close search | Escape |
| Copy a block by keyboard | `/stereo-view copy` |
| Timestamps and copy-button settings | `/stereo-view settings` |
| Help | `/stereo-view help` |

Search supports literal phrases, `AND`, `OR`, `NOT`, parentheses, and a `regex:` prefix. Regex needs local ripgrep (`rg`) with PCRE2 support on your `PATH`. Search is branch-local; it does not search other sessions or files. Unknown custom output stays in Conversation unless its metadata links it to a known tool call.

Turning split off combines history; it does not remove the dashboard. Zoom applies to the history area, not the dashboard or input.

## Dashboard — Pi Atelier

| Action | Command or shortcut |
| --- | --- |
| Control center | `/atelier` or F6 (possibly Fn+F6) |
| Display settings | `/atelier display` |
| Cost graph | `/atelier usage` |
| Toggle dashboard | `/atelier sidebar` |
| Show / hide | `/atelier sidebar on` / `/atelier sidebar off` |
| Automatic / manual width | `/atelier sidebar auto` / `/atelier sidebar manual` |
| Tool names | `/atelier sidebar tools` |
| Dashboard/status-rail component state | `/atelier enable` / `/atelier disable` |
| Manual resize | Ctrl+Shift+R, then arrows or divider drag; Enter accepts, Escape cancels |

Manual-mode dashboard visibility returns at 92 terminal columns; auto mode uses additional room and hysteresis. Transcript columns also require enough space for both history panels. At small widths the dashboard can disappear and history can temporarily combine, preserving preferences.

Atelier's enable/disable command controls the dashboard/status-rail feature; the transcript has its own split toggle. Neither command uninstalls this package.

## Sidebar panels from other extensions

The `pi-atelier:sidebar-panels` event protocol and payload limits are retained. Other extensions can use that protocol or import `registerSidebarPanel` from `stereo-aterliear-view/src/index.ts`. Panels still start hidden and can be enabled in Display settings.

Do not load standalone Pi Atelier just to use its sidebar protocol; this fork already includes it.
