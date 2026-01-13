import type { ViteForgeApi } from "../preload/index.js";

declare global {
  interface Window {
    viteForge: ViteForgeApi;
  }
}

export {};
