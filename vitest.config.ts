import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig } from "vitest/config";

const agentDir = mkdtempSync(join(tmpdir(), "stereo-aterliear-test-"));
process.once("exit", () => rmSync(agentDir, { recursive: true, force: true }));

export default defineConfig({
	test: {
		include: ["tests/**/*.test.ts"],
		globalSetup: ["./tests/setup.ts"],
		env: { PI_CODING_AGENT_DIR: agentDir, PI_OFFLINE: "1" },
		testTimeout: 60_000,
		hookTimeout: 60_000,
		fileParallelism: false,
	},
});
