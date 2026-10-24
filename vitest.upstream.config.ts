import { defineConfig } from "vitest/config";
import config from "./vitest.config.js";

export default defineConfig({
	...config,
	test: {
		...config.test,
		include: [
			"packages/atelier/tests/**/*.test.ts",
			"packages/stereo/test/**/*.test.ts",
		],
		exclude: ["**/*.integration.test.ts", "**/rendering.profile.ts"],
	},
});
