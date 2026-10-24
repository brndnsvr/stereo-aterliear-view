import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import atelier from "../packages/atelier/extensions/index.js";
import stereoView from "../packages/stereo/src/index.js";

export { registerSidebarPanel } from "../packages/atelier/extensions/index.js";

export default async function stereoAterliearView(
	pi: ExtensionAPI,
): Promise<void> {
	atelier(pi);
	await stereoView(pi);
}
