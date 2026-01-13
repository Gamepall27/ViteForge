import { ipcMain } from "electron";
import type { CreateProjectRequest } from "@shared/ipc";
import { IPC_CHANNELS } from "@shared/ipc";
import { createProject } from "../projects/createProject";
import { loadTemplateRegistry } from "../templates/registry";

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.listTemplates, async () => {
    const templates = await loadTemplateRegistry();
    return templates.map(({ rootDir, ...descriptor }) => descriptor);
  });

  ipcMain.handle(
    IPC_CHANNELS.createProject,
    async (event, request: CreateProjectRequest) => {
      return createProject(request, (output) => {
        event.sender.send(IPC_CHANNELS.createProjectOutput, output);
      });
    }
  );
}
