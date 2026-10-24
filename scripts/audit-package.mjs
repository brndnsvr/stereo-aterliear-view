import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const allowed =
	/^(?:src\/[^/]+\.ts|packages\/(?:atelier\/(?:src|extensions)|stereo\/src)\/[\w/-]+\.ts|licenses\/pi-(?:atelier|stereo-view)\.MIT|docs\/(?:architecture|privacy|controls)\.md|(?:package\.json|README\.md|LICENSE|THIRD_PARTY_NOTICES\.md|CHANGELOG\.md))$/;
const sensitive =
	/(?:\/(?:Users|home)\/[\w.-]+\/|-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----|(?:ghp_|github_pat_|npm_)[A-Za-z0-9_]{30,}|AKIA[A-Z0-9]{16}|\bsk-[A-Za-z0-9_-]{30,})/;

assert(allowed.test("packages/atelier/src/split-pane.ts"));
assert(!allowed.test(".env"));
assert(!allowed.test("src/auth.json"));
assert(!allowed.test("tmp/session.jsonl"));
assert(sensitive.test(["", "Users", "example", "private.txt"].join("/")));
assert(!sensitive.test("https://github.com/brndnsvr/stereo-aterliear-view"));

const destination = mkdtempSync(join(tmpdir(), "stereo-aterliear-pack-"));
try {
	const [report] = JSON.parse(
		execFileSync(
			"npm",
			["pack", "--ignore-scripts", "--json", "--pack-destination", destination],
			{
				cwd: root,
				encoding: "utf8",
			},
		),
	);
	const archive = join(destination, report.filename);
	const entries = execFileSync("tar", ["-tzf", archive], { encoding: "utf8" })
		.trim()
		.split("\n");
	for (const entry of entries) {
		assert(entry.startsWith("package/"), `Unexpected archive root: ${entry}`);
		const relative = entry.slice("package/".length);
		assert(allowed.test(relative), `Unexpected publish file: ${relative}`);
		const content = execFileSync("tar", ["-xOf", archive, entry], {
			encoding: "utf8",
		});
		assert(!sensitive.test(content), `Private-looking content in ${relative}`);
	}
	for (const file of [
		"README.md",
		"LICENSE",
		"THIRD_PARTY_NOTICES.md",
		"src/index.ts",
	]) {
		assert(entries.includes(`package/${file}`), `Missing ${file}`);
	}
	for (const [file, author] of [
		["pi-atelier.MIT", "Copyright (c) 2026 Michael"],
		["pi-stereo-view.MIT", "Copyright (c) 2026 Alexander Shpuntenko"],
	]) {
		const entry = `package/licenses/${file}`;
		assert(entries.includes(entry), `Missing ${file}`);
		assert(
			execFileSync("tar", ["-xOf", archive, entry], {
				encoding: "utf8",
			}).includes(author),
		);
	}
	const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
	assert.equal(manifest.name, "stereo-aterliear-view");
	assert.deepEqual(manifest.pi.extensions, ["./src/index.ts"]);
	assert.equal(
		Object.keys(manifest.dependencies ?? {}).length,
		0,
		"No runtime dependencies expected",
	);
	assert(
		!manifest.scripts.preinstall &&
			!manifest.scripts.install &&
			!manifest.scripts.postinstall,
	);
	console.log(
		`Package audit passed: ${entries.length} allowlisted files; ${report.size} packed bytes.`,
	);
	console.log(`Archive integrity: ${report.integrity}`);
} finally {
	rmSync(destination, { recursive: true, force: true });
}
