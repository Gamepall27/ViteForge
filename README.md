# ViteForge

ViteForge is an Electron-based desktop application that generates, configures, and builds Vite projects without requiring users to interact with a terminal. The UI runs in a renderer-only React + Vite bundle, while the Electron main process owns all filesystem and process orchestration.

## Architecture

- **Renderer (React + Vite)**: UI-only, no Node APIs or filesystem access.
- **Preload**: Explicit IPC bridge exposed via `window.viteForge`.
- **Main (Electron)**: Handles templates, project creation, dependency installs, builds, and packaging.

Templates live in the local `templates/` registry and ship with full Vite project skeletons plus a machine-readable `template.json` descriptor.
