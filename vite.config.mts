import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { host: "127.0.0.1", port: 3000, strictPort: true },
  preview: { host: "127.0.0.1", port: 3000, strictPort: true },
  // Keep the existing output directory for the future static hosting image.
  build: { outDir: "build" },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    restoreMocks: true,
    env: { VITE_API_URL: "http://api.test.invalid" },
  },
});
