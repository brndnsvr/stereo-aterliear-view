import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { stripTerminalSequences } from "@earendil-works/pi-tui";
import {
	assistantMessage,
	getToolExecution,
	PiIntegrationTest,
	text,
	toolCall,
} from "pi-coding-agent-test";
import { afterEach, expect, test } from "vitest";

const directories: string[] = [];
const clean = (lines: string[]): string =>
	lines.map(stripTerminalSequences).join("\n");

afterEach(async () => {
	await Promise.all(
		directories
			.splice(0)
			.map((dir) => rm(dir, { recursive: true, force: true })),
	);
});

async function workspace() {
	await mkdir("tmp", { recursive: true });
	const root = await mkdtemp(path.resolve("tmp/combined-"));
	directories.push(root);
	const agent = path.join(root, "agent");
	const cwd = path.join(root, "demo-project");
	await mkdir(agent);
	await mkdir(cwd);
	await writeFile(
		path.join(agent, "settings.json"),
		JSON.stringify({
			tuiMode: "fullscreen",
			quietStartup: true,
			hideThinkingBlock: false,
		}),
	);
	await writeFile(
		path.join(agent, "stereo-aterliear-view.dashboard.json"),
		JSON.stringify({
			nerdFont: false,
			completionNotifications: false,
			showSidebarOnStartup: true,
		}),
	);
	await writeFile(
		path.join(agent, "stereo-aterliear-view.transcript.json"),
		JSON.stringify({
			mode: "split",
			side: "left",
			chatWidth: 40,
			layout: "columns",
			chatHeight: 12,
			zoom: null,
		}),
	);
	return { cwd, agent };
}

test("real Pi separates history beside a dashboard; controls, selection, search, and resize survive", async () => {
	const { cwd, agent } = await workspace();
	const result = await new PiIntegrationTest({
		testName: "combined-controls",
		artifactsDir: path.resolve("tmp/test-runs"),
		cwd,
		piCommand: path.resolve("tests/pi-host.sh"),
		isolateUserResources: false,
		environment: { PI_CODING_AGENT_DIR: agent, SAV_TEST_CONTROLS: "1" },
		rawMode: false,
		tuiSize: { cols: 180, rows: 45 },
		extensions: [
			path.resolve("src/index.ts"),
			path.resolve("tests/fixtures/combined-probe.ts"),
		],
		tools: ["write"],
		conversation: [
			assistantMessage(
				[
					text("COMMENT_MARKER", { chunks: { kind: "fixed", size: 3 } }),
					toolCall({
						id: "demo-write",
						name: "write",
						arguments: { path: "effect.txt", content: "SYNTHETIC EFFECT" },
					}),
				],
				{ stopReason: "toolUse" },
			),
			assistantMessage([text("ANSWER_MARKER")]),
		],
	}).run("USER_MARKER");
	const frames: Record<string, string[]> = JSON.parse(
		await readFile(path.join(cwd, "frames.json"), "utf8"),
	);
	const initial = clean(frames.initial);
	expect(initial).toContain("Conversation");
	expect(initial).toContain("Activity");
	expect(initial).toContain("WORKSPACE");
	expect(initial).not.toContain("split is unavailable");
	const divided = frames.initial
		.map(stripTerminalSequences)
		.filter((line) => line.includes("║"));
	const chat = divided.map((line) => line.split("║")[0]).join("\n");
	const activity = divided.map((line) => line.split("║")[1]).join("\n");
	for (const marker of ["USER_MARKER", "COMMENT_MARKER", "ANSWER_MARKER"]) {
		expect(chat).toContain(marker);
		expect(activity).not.toContain(marker);
	}
	for (const marker of [
		"TOOL_CALL_MARKER",
		"TOOL_RESULT_MARKER",
		"THINKING_MARKER",
	]) {
		expect(activity).toContain(marker);
		expect(chat).not.toContain(marker);
	}
	expect(getToolExecution(result, "demo-write").isError).toBe(false);
	expect(await readFile(path.join(cwd, "effect.txt"), "utf8")).toBe(
		"SYNTHETIC EFFECT",
	);
	expect([
		...new Set(
			JSON.parse(await readFile(path.join(cwd, "copied.json"), "utf8")),
		),
	]).toEqual(["ANSWER_MARKER", "TOOL_CALL_MARKER"]);
	for (const name of [
		"rows",
		"zoom",
		"columns",
		"combined",
		"restored",
		"shown",
		"wide",
	]) {
		expect(clean(frames[name]), name).toContain("WORKSPACE");
		expect(clean(frames[name]), name).not.toContain("split is unavailable");
	}
	expect(clean(frames.search)).toContain("ANSWER_MARKER");
	expect(clean(frames.search)).toContain("1/1");
	expect(clean(frames.rows)).toContain("═");
	expect(clean(frames.zoom)).not.toContain("TOOL_CALL_MARKER");
	expect(clean(frames.combined)).not.toContain("║");
	expect(clean(frames.restored)).toContain("║");
	expect(clean(frames.hidden)).not.toContain("WORKSPACE");
	expect(clean(frames.hidden)).toContain("║");
	expect(clean(frames.narrow)).not.toContain("WORKSPACE");
	expect(clean(frames.narrow)).toContain("║");
	expect(clean(frames.tiny)).not.toContain("║");
	expect(clean(frames.wide)).toContain("║");
	expect(clean(frames.menu)).toContain("Atelier");
	const saved = JSON.parse(
		await readFile(
			path.join(agent, "stereo-aterliear-view.transcript.json"),
			"utf8",
		),
	);
	expect(saved).toMatchObject({ mode: "split", layout: "columns", zoom: null });
	expect(result.providerRequests).toHaveLength(2);
});

test("two native reloads retain all three panes and live tool execution", async () => {
	const { cwd, agent } = await workspace();
	const frameFile = path.resolve(
		"tmp/test-runs/combined-reload/reload-frames.json",
	);
	await mkdir(path.dirname(frameFile), { recursive: true });
	await new PiIntegrationTest({
		testName: "combined-reload",
		artifactsDir: path.resolve("tmp/test-runs"),
		cwd,
		piCommand: path.resolve("tests/pi-host.sh"),
		isolateUserResources: false,
		environment: { PI_CODING_AGENT_DIR: agent, RELOAD_FRAMES_FILE: frameFile },
		rawMode: false,
		tuiSize: { cols: 180, rows: 45 },
		extensions: [
			path.resolve("src/index.ts"),
			path.resolve("tests/fixtures/reload-probe.ts"),
		],
		tools: ["write"],
		conversation: [
			assistantMessage(
				[
					toolCall({
						id: "reload-write",
						name: "write",
						arguments: { path: "reload-effect.txt", content: "RELOAD EFFECT" },
					}),
				],
				{ stopReason: "toolUse" },
			),
			assistantMessage([text("AFTER_RELOAD_MARKER")]),
		],
	}).run("/transcript-reload-check");
	const { reloads, frames } = JSON.parse(await readFile(frameFile, "utf8"));
	expect(reloads).toBe(2);
	expect(frames.length).toBeGreaterThanOrEqual(4);
	for (const frame of frames as string[][]) {
		const content = clean(frame);
		expect(content).toContain("Conversation");
		expect(content).toContain("WORKSPACE");
		expect(content).not.toContain("split is unavailable");
	}
	expect(clean(frames.at(-1))).toContain("AFTER_RELOAD_MARKER");
	expect(await readFile(path.join(cwd, "reload-effect.txt"), "utf8")).toBe(
		"RELOAD EFFECT",
	);
});
