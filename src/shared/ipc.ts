export type TemplateTarget = 'web' | 'desktop';

export interface TemplateDescriptor {
  id: string;
  name: string;
  description: string;
  framework: string;
  language: 'js' | 'ts';
  target: TemplateTarget;
  features: string[];
  placeholders: string[];
}

export interface ProjectRequest {
  templateId: string;
  destination: string;
  projectName: string;
  packageManager: 'npm' | 'pnpm';
}

export interface ProcessStartRequest {
  id: string;
  command: string;
  args: string[];
  cwd: string;
}

export interface ProcessOutput {
  id: string;
  type: 'stdout' | 'stderr' | 'exit';
  message: string;
}

export interface ViteForgeAPI {
  listTemplates: () => Promise<TemplateDescriptor[]>;
  createProject: (request: ProjectRequest) => Promise<void>;
  startProcess: (request: ProcessStartRequest) => Promise<void>;
  stopProcess: (id: string) => Promise<void>;
  onProcessOutput: (handler: (output: ProcessOutput) => void) => () => void;
}
