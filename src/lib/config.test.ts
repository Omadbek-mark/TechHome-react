import { beforeEach, expect, it, vi } from "vitest";

beforeEach(() => vi.resetModules());

it("normalizes the configured API base without changing its path", async () => {
  vi.stubEnv("VITE_API_URL", " https://example.invalid/api/// ");
  expect((await import("./config")).serverApi).toBe("https://example.invalid/api");
});

it.each(["", "   ", "javascript:alert(1)", "not-a-url"])("rejects an invalid API configuration: %s", async (url) => {
  vi.stubEnv("VITE_API_URL", url);
  await expect(import("./config")).rejects.toThrow();
});


it.each([
  ["http://127.0.0.1:3002", "localhost", true, "http://localhost:3002"],
  ["http://localhost:3002/api/", "127.0.0.1", true, "http://127.0.0.1:3002/api"],
  ["http://127.0.0.1:3002", "127.0.0.1", true, "http://127.0.0.1:3002"],
  ["http://127.0.0.1:3002", "[::1]", true, "http://[::1]:3002"],
  ["http://127.0.0.1:3002", "localhost", false, "http://127.0.0.1:3002"],
  ["https://api.example.invalid/api", "localhost", true, "https://api.example.invalid/api"],
  ["http://127.0.0.1:3002", "shop.example.invalid", true, "http://127.0.0.1:3002"],
])("resolves development cookie host without changing remote or production API: %s, %s", async (value, host, dev, expected) => {
  vi.stubEnv("VITE_API_URL", "http://api.test.invalid");
  expect((await import("./config")).resolveApiUrl(value, host, dev)).toBe(expected);
});
