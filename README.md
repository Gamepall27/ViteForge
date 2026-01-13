# ViteForge

ViteForge ist eine offline-fähige Electron-Anwendung zur deterministischen Erstellung und Verwaltung von Vite-Projekten.

## Architektur

- **Renderer (React + Vite)**: UI, Statusanzeigen, Log-Streaming. Kein Zugriff auf Node-APIs.
- **Main (Electron)**: Dateisystemzugriff, Template-Management, Prozess-Orchestrierung, IPC-Validierung.

Die Kommunikation erfolgt ausschließlich über explizite IPC-Schnittstellen in `src/shared/ipc.ts`.

## Templates

Lokale Templates liegen in `templates/` und werden über `templates/registry.json` beschrieben. Jedes Template enthält eine maschinenlesbare Beschreibung (`template.json`) sowie eine vollständige Projektstruktur.

## Entwicklung

```bash
npm install
npm run dev
```
