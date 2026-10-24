import type { Theme } from "@earendil-works/pi-coding-agent";
import {
	Container,
	rgbColor,
	ScrollView,
	Text,
	type TUI,
	TuiAltScreen,
	VStack,
} from "@earendil-works/pi-tui";
import { describe, expect, test, vi } from "vitest";
import {
	createSplitPaneController,
	getMainLayoutRoot,
	setMainLayoutRoot,
} from "../packages/atelier/src/split-pane.js";
import { TranscriptLayout } from "../packages/stereo/src/layout.js";
import { defaults } from "../packages/stereo/src/preferences.js";
import { TranscriptTimestamps } from "../packages/stereo/src/timestamps.js";

const theme = {
	fg: (_name: string, value: string) => value,
	style: (value: string) => value,
	colors: {
		customMessageBg: rgbColor(0, 0, 0),
		text: rgbColor(255, 255, 255),
		border: rgbColor(128, 128, 128),
	},
} as unknown as Theme;

function harness() {
	const renderer = new TuiAltScreen({
		columns: 160,
		rows: 40,
		write: vi.fn(),
	} as never);
	renderer.requestRender = vi.fn();
	const document = new Container();
	document.addChild(new Container());
	document.addChild(new Container());
	document.addChild(new Container());
	const dock = new VStack([new Text("INPUT DOCK", 0, 0)]);
	const original = new VStack([
		{ component: new ScrollView(document), basis: 0, grow: 1 },
		{ component: dock, basis: "auto", shrink: 0 },
	]);
	renderer.setLayoutRoot(original);
	const warn = vi.fn();
	const session = { getBranch: () => [], buildContextEntries: () => [] };
	const layout = new TranscriptLayout(
		{ ...defaults },
		() => theme,
		warn,
		vi.fn(),
		new TranscriptTimestamps(session as never),
		vi.fn(),
	);
	const sidebar = createSplitPaneController();
	const tui = renderer as unknown as TUI;
	return { renderer, tui, original, dock, layout, sidebar, warn };
}

describe.each(["sidebar first", "transcript first"])(
	"cooperative ownership: %s",
	(order) => {
		test.each(["sidebar first", "transcript first"])(
			"restores native history; dispose %s",
			(disposeOrder) => {
				const h = harness();
				try {
					if (order === "sidebar first") {
						h.sidebar.attach(h.tui);
						h.layout.attach(h.tui);
					} else {
						h.layout.attach(h.tui);
						h.sidebar.attach(h.tui);
					}
					const mounted = getMainLayoutRoot(h.tui) as Container;
					expect(mounted).not.toBe(h.original);
					expect(mounted.children).toContain(h.dock);
					for (let index = 0; index < 3; index++) {
						h.sidebar.setSidebarWidth(40 + index * 4);
						h.sidebar.show();
						h.layout.attach(h.tui);
						expect(getMainLayoutRoot(h.tui)).toBe(mounted);
						h.sidebar.hide();
						h.layout.attach(h.tui);
					}
					expect(h.layout.searchPane()).toBe("chat");
					expect(h.warn).not.toHaveBeenCalled();
					if (disposeOrder === "sidebar first") {
						h.sidebar.dispose();
						h.layout.dispose();
					} else {
						h.layout.dispose();
						h.sidebar.dispose();
					}
					expect(getMainLayoutRoot(h.tui)).toBe(h.original);
				} finally {
					h.layout.dispose();
					h.sidebar.dispose();
				}
			},
		);
	},
);

test("does not unwrap or restore over an unrelated layout", () => {
	const h = harness();
	try {
		h.sidebar.attach(h.tui);
		const foreign = new Text("OTHER EXTENSION", 0, 0);
		h.renderer.setLayoutRoot(foreign);
		expect(getMainLayoutRoot(h.tui)).toBe(foreign);
		h.sidebar.dispose();
		expect(getMainLayoutRoot(h.tui)).toBe(foreign);
		setMainLayoutRoot(h.tui, h.original);
		expect(getMainLayoutRoot(h.tui)).toBe(h.original);
	} finally {
		h.sidebar.dispose();
	}
});
