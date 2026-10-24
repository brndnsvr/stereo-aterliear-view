import { readFile, writeFile } from "node:fs/promises";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Text, type TUI } from "@earendil-works/pi-tui";
import { emittedFrame } from "./emitted-frame.js";

type Host = TUI & {
	getScreenLines(): string[];
	handleTerminalInput(data: string): void;
	getFocusedComponent(): unknown;
};
type State = { reloads: number; frames: string[][] };

export default function reloadProbe(pi: ExtensionAPI): void {
	let tui: Host;
	const file = process.env.RELOAD_FRAMES_FILE;
	if (!file) throw new Error("RELOAD_FRAMES_FILE is required");
	const capture = async (): Promise<string[]> => {
		await emittedFrame(tui, () => tui.requestRender(true));
		return tui.getScreenLines();
	};
	const nativeReload = (): void => {
		for (const character of "/reload") tui.handleTerminalInput(character);
		tui.handleTerminalInput("\r");
	};
	pi.on("session_start", async (event, ctx) => {
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
		if (event.reason !== "reload") return;
		const state: State = JSON.parse(await readFile(file, "utf8"));
		void emittedFrame(
			tui,
			() => tui.requestRender(true),
			() => {
				const screen = tui.getScreenLines().join("\n");
				return (
					screen.includes("Conversation") &&
					screen.includes("WORKSPACE") &&
					!screen.includes("Reloading keybindings")
				);
			},
		).then(async () => {
			state.frames.push(tui.getScreenLines());
			if (state.reloads < 2) {
				state.reloads++;
				await writeFile(file, JSON.stringify(state));
				nativeReload();
			} else {
				await writeFile(file, JSON.stringify(state));
				pi.sendUserMessage("FRESH USER");
			}
		});
	});
	pi.registerCommand("transcript-reload-check", {
		description: "Exercise two native UI reloads",
		handler: async () => {
			await writeFile(
				file,
				JSON.stringify({ reloads: 1, frames: [await capture()] }),
			);
			nativeReload();
		},
	});
	pi.on("agent_before_settle", async () => {
		const state: State = JSON.parse(await readFile(file, "utf8"));
		state.frames.push(await capture());
		await writeFile(file, JSON.stringify(state));
	});
}
