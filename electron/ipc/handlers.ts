import { ipcMain, webContents } from 'electron';
import type { ProcessStartRequest, ProjectRequest } from '../../src/shared/ipc.js';
import { listTemplates } from '../services/templateRegistry.js';
import { createProject } from '../services/projectService.js';
import { processManager } from '../services/processManager.js';

const broadcast = (channel: string, payload: unknown) => {
  for (const contents of webContents.getAllWebContents()) {
    contents.send(channel, payload);
  }
};

export const registerIpcHandlers = () => {
  ipcMain.handle('templates:list', async () => listTemplates());

  ipcMain.handle('project:create', async (_event, request: ProjectRequest) => {
    await createProject(request, (output) => broadcast('process:output', output));
  });

  ipcMain.handle('process:start', async (_event, request: ProcessStartRequest) => {
    processManager.start(request, (output) => broadcast('process:output', output));
  });

  ipcMain.handle('process:stop', async (_event, id: string) => {
    processManager.stop(id);
  });
};
