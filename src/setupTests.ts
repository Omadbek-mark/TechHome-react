import { setLanguage } from './lib/i18n';
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import axios from "axios";

// jsdom has no layout/media engine. Keep real Swiper imports while supplying
// the browser API it needs; responsive behavior is checked separately in-browser.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Tests must explicitly mock each API call. An accidental real request is a failure.
axios.defaults.adapter = async () => {
  throw new Error("Unmocked API request in an isolated test");
};
beforeEach(() => { localStorage.clear(); setLanguage("en"); });
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});
