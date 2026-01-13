import { useEffect, useMemo, useState } from "react";
import type { ProcessExitEvent, ProcessLogEvent, TemplateSummary } from "../shared/types.js";

const useProcessLogs = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const removeLog = window.viteForge.onProcessLog((event: ProcessLogEvent) => {
      setLogs((prev) => [...prev, `[${event.processId}] ${event.source}: ${event.message}`]);
    });
    const removeExit = window.viteForge.onProcessExit((event: ProcessExitEvent) => {
      setLogs((prev) => [...prev, `[${event.processId}] exited with ${event.code ?? "signal"}`]);
    });
    return () => {
      removeLog();
      removeExit();
    };
  }, []);

  return logs;
};

export const App = () => {
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [projectName, setProjectName] = useState("");
  const [destination, setDestination] = useState<string | null>(null);
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const logs = useProcessLogs();

  useEffect(() => {
    window.viteForge.listTemplates().then((data) => {
      setTemplates(data);
      if (data.length > 0) {
        setSelectedTemplate(data[0].id);
      }
    });
  }, []);

  const canCreate = useMemo(() => {
    return Boolean(selectedTemplate && projectName && destination && !busy);
  }, [selectedTemplate, projectName, destination, busy]);

  const handleSelectDestination = async () => {
    const selected = await window.viteForge.selectDirectory();
    if (selected) {
      setDestination(selected);
    }
  };

  const handleCreate = async () => {
    if (!canCreate || !destination) return;
    setBusy(true);
    try {
      const result = await window.viteForge.createProject({
        templateId: selectedTemplate,
        destination,
        projectName,
        packageManager: "npm",
        values: {},
      });
      setProjectPath(result.projectPath);
    } finally {
      setBusy(false);
    }
  };

  const runProjectAction = async (command: "dev" | "build" | "package") => {
    if (!projectPath) return;
    setBusy(true);
    try {
      if (command === "dev") {
        await window.viteForge.startDevServer({
          projectPath,
          command,
          args: [],
        });
      }
      if (command === "build") {
        await window.viteForge.buildProject({
          projectPath,
          command,
          args: [],
        });
      }
      if (command === "package") {
        await window.viteForge.packageProject({
          projectPath,
          command,
          args: [],
        });
      }
    } finally {
      setBusy(false);
    }
  };

  const handleInstall = async () => {
    if (!projectPath) return;
    setBusy(true);
    try {
      await window.viteForge.installDependencies({
        projectPath,
        packageManager: "npm",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1>ViteForge</h1>
      <p>
        Offline-first Vite project builder. Select a template, choose a destination, and generate a new
        project without using the command line.
      </p>

      <section style={{ display: "grid", gap: 12, maxWidth: 640 }}>
        <label>
          Template
          <select
            value={selectedTemplate}
            onChange={(event) => setSelectedTemplate(event.target.value)}
            style={{ display: "block", width: "100%", marginTop: 4 }}
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.framework} {template.language})
              </option>
            ))}
          </select>
        </label>

        <label>
          Project name
          <input
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            placeholder="my-vite-app"
            style={{ display: "block", width: "100%", marginTop: 4 }}
          />
        </label>

        <label>
          Destination
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input
              value={destination ?? ""}
              readOnly
              placeholder="Select a folder"
              style={{ flex: 1 }}
            />
            <button type="button" onClick={handleSelectDestination}>
              Browse
            </button>
          </div>
        </label>

        <button type="button" onClick={handleCreate} disabled={!canCreate}>
          Create project
        </button>
      </section>

      {projectPath && (
        <section style={{ marginTop: 24, display: "grid", gap: 8 }}>
          <h2>Project Actions</h2>
          <p>Project path: {projectPath}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={handleInstall} disabled={busy}>
              Install dependencies
            </button>
            <button type="button" onClick={() => runProjectAction("dev")} disabled={busy}>
              Start dev server
            </button>
            <button type="button" onClick={() => runProjectAction("build")} disabled={busy}>
              Build
            </button>
            <button type="button" onClick={() => runProjectAction("package")} disabled={busy}>
              Package
            </button>
          </div>
        </section>
      )}

      <section style={{ marginTop: 24 }}>
        <h2>Process Logs</h2>
        <pre
          style={{
            background: "#0f172a",
            color: "#e2e8f0",
            padding: 12,
            minHeight: 160,
            maxHeight: 320,
            overflowY: "auto",
          }}
        >
          {logs.length === 0 ? "No logs yet." : logs.join("")}
        </pre>
      </section>
    </div>
  );
};
