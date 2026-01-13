import type { ViteForgeAPI } from './ipc';

declare global {
  interface Window {
    viteForge: ViteForgeAPI;
  }
}

export {};
