import { contextBridge, ipcRenderer } from "electron";
import {
  CreateProjectRequest,
  InstallRequest,
  ProcessExitEvent,
  ProcessLogEvent,
  ProjectActionRequest,
  TemplateDescription,
  TemplateSummary,
} from "../shared/types.js";
import { IPC_CHANNELS } from "../main/ipcChannels.js";

const api = {
  listTemplates: () => ipcRenderer.invoke(IPC_CHANNELS.listTemplates) as Promise<TemplateSummary[]>,
  getTemplate: (templateId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.getTemplate, templateId) as Promise<TemplateDescription>,
  selectDirectory: () => ipcRenderer.invoke(IPC_CHANNELS.selectDirectory) as Promise<string | null>,
  createProject: (payload: CreateProjectRequest) =>
    ipcRenderer.invoke(IPC_CHANNELS.createProject, payload) as Promise<{
      projectPath: string;
      template: TemplateDescription;
    }>,
  installDependencies: (payload: InstallRequest) =>
    ipcRenderer.invoke(IPC_CHANNELS.installDependencies, payload) as Promise<string>,
  startDevServer: (payload: ProjectActionRequest) =>
    ipcRenderer.invoke(IPC_CHANNELS.startDevServer, payload) as Promise<string>,
  buildProject: (payload: ProjectActionRequest) =>
    ipcRenderer.invoke(IPC_CHANNELS.buildProject, payload) as Promise<string>,
  packageProject: (payload: ProjectActionRequest) =>
    ipcRenderer.invoke(IPC_CHANNELS.packageProject, payload) as Promise<string>,
  onProcessLog: (handler: (event: ProcessLogEvent) => void) => {
    const listener = (_: unknown, payload: ProcessLogEvent) => handler(payload);
    ipcRenderer.on(IPC_CHANNELS.processLog, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.processLog, listener);
  },
  onProcessExit: (handler: (event: ProcessExitEvent) => void) => {
    const listener = (_: unknown, payload: ProcessExitEvent) => handler(payload);
    ipcRenderer.on(IPC_CHANNELS.processExit, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.processExit, listener);
  },
};

contextBridge.exposeInMainWorld("viteForge", api);

export type ViteForgeApi = typeof api;
