"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const vite_1 = require("vite");
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    test: {
        coverage: {
            all: true,
            provider: "v8",
            reporter: process.env.CI ? ["lcov"] : ["text", "json", "html"],
            include: ["**/permissionless/**"],
            exclude: [
                "**/errors/utils.ts",
                "**/*.test.ts",
                "**/permissionless-test/**",
                "**/_cjs/**",
                "**/_esm/**",
                "**/_types/**"
            ]
        },
        sequence: {
            concurrent: false
        },
        fileParallelism: true,
        environment: "node",
        testTimeout: 60_000,
        hookTimeout: 45_000,
        include: [(0, node_path_1.join)(__dirname, "./**/*.test.ts")],
        env: (0, vite_1.loadEnv)("test", process.cwd())
    }
});
//# sourceMappingURL=vitest.config.js.map