# ViteForge

ViteForge is an Electron-based desktop application for deterministic, offline-capable creation and packaging of Vite projects. It enforces strict separation between renderer and main processes while keeping all template and build logic local to the machine.

## Architecture overview

- **Renderer (React + Vite)**
  - UI rendering, user interactions, status updates.
  - No Node.js, filesystem, or process access.
  - Communicates only via typed IPC.

- **Main process (Electron)**
  - Filesystem access, process execution, template management.
  - Validates paths and inputs.
  - Runs builds and installs via child processes and streams logs back to the renderer.

## Local template registry

All templates live under `templates/`. Each template contains:

- Full Vite project structure
- `package.json` with placeholders (e.g., `{{projectName}}`)
- `vite.config.*`
- Optional Electron integrations
- `template.json` descriptor with schema fields

## IPC boundary

All renderer access is done through the `window.viteForge` API defined in `src/preload/index.ts`.

## Determinism and offline support

- Projects are created from local templates only.
- Dependency installs are executed inside the project directory.
- No global toolchains are required.
- Optional online features can be added as isolated IPC calls.
