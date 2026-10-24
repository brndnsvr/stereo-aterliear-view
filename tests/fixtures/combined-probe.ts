import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { setImmediate } from "node:timers/promises";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Text, type TUI } from "@earendil-works/pi-tui";

type Host = TUI & {
	getScreenLines(): string[];
	handleTerminalInput(data: string): void;
	copyTextToClipboard(text: string): Promise<boolean>;
	copyActiveSelectionToClipboard(): Promise<boolean>;
	resetTextSelection(): void;
};

export default function probe(pi: ExtensionAPI): void {
	let tui: Host;
	const capture = async (): Promise<string[]> => {
		tui.requestRender(true);
		await setImmediate();
		return tui.getScreenLines();
	};
	const command = async (value: string): Promise<string[]> => {
		for (const character of value) tui.handleTerminalInput(character);
		tui.handleTerminalInput("\r");
		await setImmediate();
		return capture();
	};
	pi.registerToolRenderer((name, next) =>
		name === "write"
			? {
					renderCall: () => new Text("TOOL_CALL_MARKER", 0, 0),
					renderResult: () => new Text("TOOL_RESULT_MARKER", 0, 0),
				}
			: next(),
	);
	pi.on("message_end", (event) => {
		if (event.message.role !== "assistant") return;
		return {
			message: {
				...event.message,
				content: [
					{ type: "thinking" as const, thinking: "THINKING_MARKER" },
					...event.message.content,
				],
			},
		};
	});
	pi.on("session_start", async (_event, ctx) => {
		if (ctx.mode !== "tui") return;
		let finish = (): void => {};
		await ctx.ui.custom<void>(
			(host, _theme, _keys, done) => {
				tui = host as Host;
				finish = done;
				return new Text("", 0, 0);
			},
			{
				overlay: true,
				overlayOptions: { visible: () => false, nonCapturing: true },
				onHandle: () => finish(),
			},
		);
	});
	pi.on("agent_before_settle", async (_event, ctx) => {
		const frames: Record<string, string[]> = { initial: await capture() };
		if (process.env.SAV_TEST_CONTROLS === "1") {
			const copied: string[] = [];
			const originalCopy = tui.copyTextToClipboard;
			tui.copyTextToClipboard = async (value) => {
				copied.push(value);
				return true;
			};
			try {
				for (const marker of ["ANSWER_MARKER", "TOOL_CALL_MARKER"]) {
					const lines = await capture();
					const row = lines.findIndex((line) => line.includes(marker));
					if (row < 0) throw new Error(`Missing copy marker: ${marker}`);
					// Selection coordinates use plain terminal columns, not ANSI string indices.
					const { stripTerminalSequences } = await import(
						"@earendil-works/pi-tui"
					);
					const column = stripTerminalSequences(lines[row]).indexOf(marker);
					for (const [button, x, suffix] of [
						[0, column, "M"],
						[32, column + marker.length - 1, "M"],
						[0, column + marker.length - 1, "m"],
					] as const) {
						tui.handleTerminalInput(
							`\x1b[<${button};${x + 1};${row + 1}${suffix}`,
						);
						await setImmediate();
					}
					await tui.copyActiveSelectionToClipboard();
					tui.resetTextSelection();
				}
			} finally {
				tui.copyTextToClipboard = originalCopy;
			}
			await writeFile(join(ctx.cwd, "copied.json"), JSON.stringify(copied));
			tui.handleTerminalInput("\x1b[1;7A");
			tui.handleTerminalInput("\x06");
			for (const character of "ANSWER_MARKER")
				tui.handleTerminalInput(character);
			await setImmediate();
			frames.search = await capture();
			tui.handleTerminalInput("\x1b");
			frames.rows = await command("/stereo-view layout rows");
			frames.zoom = await command("/stereo-view zoom chat");
			await command("/stereo-view zoom chat");
			frames.columns = await command("/stereo-view layout columns");
			frames.combined = await command("/stereo-view");
			frames.restored = await command("/stereo-view");
			frames.hidden = await command("/atelier sidebar off");
			frames.shown = await command("/atelier sidebar on");
			frames.menu = await command("/atelier");
			tui.handleTerminalInput("\x1b");
			await setImmediate();
			const width = process.stdout.columns;
			try {
				process.stdout.columns = 80;
				process.stdout.emit("resize");
				frames.narrow = await capture();
				process.stdout.columns = 50;
				process.stdout.emit("resize");
				frames.tiny = await capture();
			} finally {
				process.stdout.columns = width;
				process.stdout.emit("resize");
			}
			frames.wide = await capture();
		}
		await writeFile(join(ctx.cwd, "frames.json"), JSON.stringify(frames));
	});
}
