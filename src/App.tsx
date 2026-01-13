import { useEffect, useMemo, useState } from 'react';
import type { ProcessOutput, TemplateDescriptor } from './shared/ipc';

const defaultDestination = '/path/to/projects';

export const App = () => {
  const [templates, setTemplates] = useState<TemplateDescriptor[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [projectName, setProjectName] = useState('viteforge-app');
  const [destination, setDestination] = useState(defaultDestination);
  const [packageManager, setPackageManager] = useState<'npm' | 'pnpm'>('npm');
  const [logs, setLogs] = useState<ProcessOutput[]>([]);

  const currentTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplate),
    [templates, selectedTemplate]
  );

  useEffect(() => {
    window.viteForge.listTemplates().then((data) => {
      setTemplates(data);
      if (data.length > 0) {
        setSelectedTemplate(data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = window.viteForge.onProcessOutput((output) => {
      setLogs((prev) => [...prev, output]);
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async () => {
    setLogs([]);
    await window.viteForge.createProject({
      templateId: selectedTemplate,
      destination,
      projectName,
      packageManager
    });
  };

  return (
    <div className="app">
      <header>
        <div>
          <p className="eyebrow">ViteForge</p>
          <h1>Vite-Projekte deterministisch erstellen.</h1>
          <p className="subcopy">
            Lokale Templates, offline-fähige Builds und strikt getrennte Prozesse.
          </p>
        </div>
      </header>

      <section className="panel">
        <h2>Projektkonfiguration</h2>
        <div className="grid">
          <label>
            Template
            <select
              value={selectedTemplate}
              onChange={(event) => setSelectedTemplate(event.target.value)}
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Projektname
            <input value={projectName} onChange={(event) => setProjectName(event.target.value)} />
          </label>
          <label>
            Zielordner
            <input value={destination} onChange={(event) => setDestination(event.target.value)} />
          </label>
          <label>
            Paketmanager
            <select
              value={packageManager}
              onChange={(event) => setPackageManager(event.target.value as 'npm' | 'pnpm')}
            >
              <option value="npm">npm</option>
              <option value="pnpm">pnpm</option>
            </select>
          </label>
        </div>
        <button className="primary" type="button" onClick={handleCreate}>
          Projekt erstellen
        </button>
      </section>

      <section className="panel">
        <h2>Template-Details</h2>
        {currentTemplate ? (
          <div className="template-card">
            <div>
              <p className="label">Beschreibung</p>
              <p>{currentTemplate.description}</p>
            </div>
            <div>
              <p className="label">Framework</p>
              <p>{currentTemplate.framework}</p>
            </div>
            <div>
              <p className="label">Sprache</p>
              <p>{currentTemplate.language.toUpperCase()}</p>
            </div>
            <div>
              <p className="label">Ziel</p>
              <p>{currentTemplate.target}</p>
            </div>
            <div>
              <p className="label">Features</p>
              <ul>
                {currentTemplate.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p>Lade Templates …</p>
        )}
      </section>

      <section className="panel">
        <h2>Live-Logs</h2>
        <div className="logs">
          {logs.length === 0 ? (
            <p className="muted">Noch keine Prozessausgabe empfangen.</p>
          ) : (
            logs.map((entry, index) => (
              <div key={`${entry.id}-${index}`} className={`log ${entry.type}`}>
                <span>{entry.id}</span>
                <span>{entry.message}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
