import { defineConfig } from "@playwright/test";

export default defineConfig({
  // Minimal Playwright config (no extra integrations).
  use: {
    baseURL: "http://localhost:8080",
  },
});
