import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { expect, test, vi } from "vitest";

const { stereo, dashboard } = vi.hoisted(() => ({
	stereo: vi.fn(),
	dashboard: vi.fn(),
}));
vi.mock("../packages/atelier/extensions/index.js", () => ({
	default: dashboard,
	registerSidebarPanel: vi.fn(),
}));
vi.mock("../packages/stereo/src/index.js", () => ({ default: stereo }));

import extension from "../src/index.js";

test("waits for transcript registration before the extension loader continues", async () => {
	let finish = (): void => {};
	stereo.mockReturnValue(
		new Promise<void>((resolve) => {
			finish = resolve;
		}),
	);
	const pi = {} as ExtensionAPI;
	let loaded = false;
	const loading = extension(pi).then(() => {
		loaded = true;
	});
	await Promise.resolve();
	expect(dashboard).toHaveBeenCalledExactlyOnceWith(pi);
	expect(stereo).toHaveBeenCalledExactlyOnceWith(pi);
	expect(loaded).toBe(false);
	finish();
	await loading;
	expect(loaded).toBe(true);
});
