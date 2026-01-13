export type TemplateTarget = "web" | "desktop";

export interface TemplateDescription {
  id: string;
  name: string;
  version: string;
  framework: string;
  language: "js" | "ts";
  target: TemplateTarget;
  features: string[];
  placeholders: Record<string, string>;
}

export interface TemplateSummary {
  id: string;
  name: string;
  version: string;
  framework: string;
  language: "js" | "ts";
  target: TemplateTarget;
}

export interface CreateProjectRequest {
  templateId: string;
  destination: string;
  projectName: string;
  packageManager: "npm" | "pnpm";
  values: Record<string, string>;
}

export interface ProjectActionRequest {
  projectPath: string;
  command: string;
  args?: string[];
}

export interface InstallRequest {
  projectPath: string;
  packageManager: "npm" | "pnpm";
}

export interface ProcessLogEvent {
  processId: string;
  message: string;
  source: "stdout" | "stderr";
}

export interface ProcessExitEvent {
  processId: string;
  code: number | null;
}
