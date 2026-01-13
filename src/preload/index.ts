import { contextBridge, ipcRenderer } from "electron";
import type { CreateProjectRequest, IpcApi, ProcessOutput } from "@shared/ipc";
import { IPC_CHANNELS } from "@shared/ipc";

const api: IpcApi = {
  listTemplates: async () => ipcRenderer.invoke(IPC_CHANNELS.listTemplates),
  createProject: async (request, onOutput) => {
    const handler = (_: unknown, output: ProcessOutput) => {
      onOutput(output);
    };
    ipcRenderer.on(IPC_CHANNELS.createProjectOutput, handler);
    try {
      return await ipcRenderer.invoke(IPC_CHANNELS.createProject, request);
    } finally {
      ipcRenderer.removeListener(IPC_CHANNELS.createProjectOutput, handler);
    }
  }
};

contextBridge.exposeInMainWorld("viteForge", api);

declare global {
  interface Window {
    viteForge: IpcApi;
  }
}
