export type TemplateTarget = "web" | "desktop";

export type TemplateFeature =
  | "routing"
  | "state-management"
  | "electron"
  | "packaging";

export interface TemplateDescriptor {
  id: string;
  name: string;
  version: string;
  framework: string;
  language: "js" | "ts";
  target: TemplateTarget;
  features: TemplateFeature[];
  placeholders: Record<string, string>;
  description: string;
}

export interface CreateProjectRequest {
  templateId: string;
  destination: string;
  values: Record<string, string>;
  packageManager: "npm" | "pnpm";
}

export interface ProcessOutput {
  stream: "stdout" | "stderr";
  message: string;
}

export interface CreateProjectResponse {
  success: boolean;
  message: string;
}

export interface IpcApi {
  listTemplates: () => Promise<TemplateDescriptor[]>;
  createProject: (
    request: CreateProjectRequest,
    onOutput: (output: ProcessOutput) => void
  ) => Promise<CreateProjectResponse>;
}

export const IPC_CHANNELS = {
  listTemplates: "templates:list",
  createProject: "projects:create",
  createProjectOutput: "projects:create:output"
} as const;
