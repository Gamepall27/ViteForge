import { contextBridge, ipcRenderer } from 'electron';

const api = {
  listTemplates: () => ipcRenderer.invoke('templates:list'),
  createProject: (request) => ipcRenderer.invoke('project:create', request),
  startProcess: (request) => ipcRenderer.invoke('process:start', request),
  stopProcess: (id) => ipcRenderer.invoke('process:stop', id),
  onProcessOutput: (handler) => {
    const listener = (_event, data) => {
      handler(data);
    };
    ipcRenderer.on('process:output', listener);
    return () => ipcRenderer.removeListener('process:output', listener);
  }
};

contextBridge.exposeInMainWorld('viteForge', api);
