import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { CreateProjectRequest, ProcessOutput, TemplateDescriptor } from "@shared/ipc";

function App(): JSX.Element {
  const [templates, setTemplates] = useState<TemplateDescriptor[]>([]);
  const [logs, setLogs] = useState<ProcessOutput[]>([]);
  const [status, setStatus] = useState<string>("Idle");

  useEffect(() => {
    window.viteForge
      .listTemplates()
      .then(setTemplates)
      .catch((error) => {
        setStatus(`Template load failed: ${String(error)}`);
      });
  }, []);

  const handleCreateProject = async (templateId: string) => {
    setLogs([]);
    setStatus("Creating project...");
    const request: CreateProjectRequest = {
      templateId,
      destination: "/tmp/viteforge-project",
      values: {
        projectName: "viteforge-demo"
      },
      packageManager: "npm"
    };

    const response = await window.viteForge.createProject(request, (output) => {
      setLogs((prev) => [...prev, output]);
    });

    setStatus(response.message);
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", padding: "2rem" }}>
      <h1>ViteForge</h1>
      <p>{status}</p>
      <section>
        <h2>Templates</h2>
        <ul>
          {templates.map((template) => (
            <li key={template.id} style={{ marginBottom: "1rem" }}>
              <strong>{template.name}</strong>
              <div>{template.description}</div>
              <button type="button" onClick={() => handleCreateProject(template.id)}>
                Create Project
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Logs</h2>
        <pre
          style={{
            background: "#111",
            color: "#f5f5f5",
            padding: "1rem",
            height: "200px",
            overflow: "auto"
          }}
        >
          {logs.map((log, index) => `${log.stream}: ${log.message}`).join("")}
        </pre>
      </section>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
