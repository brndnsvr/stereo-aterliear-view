#!/bin/sh
set -eu
ROOT=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
export PI_OFFLINE=1
exec node "$ROOT/node_modules/@earendil-works/pi-coding-agent/dist/cli.js" --offline --tui-mode "${SAV_TEST_MODE:-fullscreen}" "$@"
