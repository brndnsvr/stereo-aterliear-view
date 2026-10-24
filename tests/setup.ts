import { chmodSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

export default function setup(): void {
	if (process.platform !== "darwin") return;
	const testRequire = createRequire(
		realpathSync(
			new URL(
				"../node_modules/pi-coding-agent-test/package.json",
				import.meta.url,
			),
		),
	);
	const root = dirname(testRequire.resolve("node-pty/package.json"));
	// shortcut: node-pty 1.1.0 ships its macOS helper without execute permission; remove after upgrading it.
	chmodSync(
		join(root, "prebuilds", `darwin-${process.arch}`, "spawn-helper"),
		0o755,
	);
}
