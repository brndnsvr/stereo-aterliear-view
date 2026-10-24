import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { stripTerminalSequences } from "@earendil-works/pi-tui";
import {
	assistantMessage,
	PiIntegrationTest,
	text,
	toolCall,
} from "pi-coding-agent-test";
import { expect, test } from "vitest";

test("the exact npm archive runs without development dependencies or a second Pi", async () => {
	await mkdir("tmp", { recursive: true });
	const root = await mkdtemp(path.resolve("tmp/packed-"));
	try {
		const [report] = JSON.parse(
			execFileSync(
				"npm",
				["pack", "--ignore-scripts", "--json", "--pack-destination", root],
				{ encoding: "utf8" },
			),
		);
		const consumer = path.join(root, "consumer");
		const agent = path.join(root, "agent");
		const cwd = path.join(root, "demo-project");
		for (const dir of [consumer, agent, cwd]) await mkdir(dir);
		await writeFile(
			path.join(consumer, "package.json"),
			JSON.stringify({ private: true }),
		);
		execFileSync(
			"npm",
			[
				"install",
				"--ignore-scripts",
				"--omit=dev",
				"--legacy-peer-deps",
				"--no-audit",
				"--no-fund",
				"--package-lock=false",
				path.join(root, report.filename),
			],
			{ cwd: consumer },
		);
		const installed = path.join(consumer, "node_modules/stereo-aterliear-view");
		await expect(
			readFile(
				path.join(consumer, "node_modules/@earendil-works/pi-tui/package.json"),
			),
		).rejects.toMatchObject({ code: "ENOENT" });
		await writeFile(
			path.join(agent, "settings.json"),
			JSON.stringify({
				quietStartup: true,
				tuiMode: "fullscreen",
				hideThinkingBlock: false,
			}),
		);
		await writeFile(
			path.join(agent, "stereo-aterliear-view.dashboard.json"),
			JSON.stringify({ nerdFont: false, completionNotifications: false }),
		);
		await new PiIntegrationTest({
			testName: "installed-archive",
			artifactsDir: path.resolve("tmp/test-runs"),
			cwd,
			piCommand: path.resolve("tests/pi-host.sh"),
			isolateUserResources: false,
			environment: { PI_CODING_AGENT_DIR: agent },
			rawMode: false,
			tuiSize: { cols: 180, rows: 45 },
			extensions: [
				path.join(installed, "src/index.ts"),
				path.resolve("tests/fixtures/combined-probe.ts"),
			],
			tools: ["write"],
			conversation: [
				assistantMessage(
					[
						toolCall({
							id: "packed-write",
							name: "write",
							arguments: { path: "effect.txt", content: "PACKED EFFECT" },
						}),
					],
					{ stopReason: "toolUse" },
				),
				assistantMessage([text("PACKED_ANSWER")]),
			],
		}).run("PACKED_USER");
		const frames = JSON.parse(
			await readFile(path.join(cwd, "frames.json"), "utf8"),
		);
		const screen = (frames.initial as string[])
			.map(stripTerminalSequences)
			.join("\n");
		for (const marker of [
			"Conversation",
			"Activity",
			"WORKSPACE",
			"PACKED_ANSWER",
			"TOOL_RESULT_MARKER",
		])
			expect(screen).toContain(marker);
		expect(screen).not.toContain("split is unavailable");
		expect(await readFile(path.join(cwd, "effect.txt"), "utf8")).toBe(
			"PACKED EFFECT",
		);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});
