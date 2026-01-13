import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { IPC_CHANNELS } from "./ipcChannels.js";
import { TemplateRegistry } from "./services/templateRegistry.js";
import { ProjectManager } from "./services/projectManager.js";
import { ProcessManager } from "./services/processManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.resolve(__dirname, "../preload/index.js"),
    },
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    win.loadURL(devServerUrl);
  } else {
    win.loadFile(path.resolve(__dirname, "../renderer/index.html"));
  }
};

app.whenReady().then(() => {
  const appRoot = app.getAppPath();
  const templateRegistry = new TemplateRegistry(path.resolve(appRoot, "templates"));
  const processManager = new ProcessManager();
  const projectManager = new ProjectManager({
    templateRegistry,
    processManager,
  });

  createWindow();

  ipcMain.handle(IPC_CHANNELS.listTemplates, () => templateRegistry.listTemplates());
  ipcMain.handle(IPC_CHANNELS.getTemplate, (_event, templateId: string) =>
    templateRegistry.getTemplate(templateId)
  );
  ipcMain.handle(IPC_CHANNELS.createProject, (_event, payload) =>
    projectManager.createProject(payload)
  );
  ipcMain.handle(IPC_CHANNELS.installDependencies, (_event, payload) =>
    projectManager.installDependencies(payload)
  );
  ipcMain.handle(IPC_CHANNELS.startDevServer, (_event, payload) =>
    projectManager.startDevServer(payload)
  );
  ipcMain.handle(IPC_CHANNELS.buildProject, (_event, payload) =>
    projectManager.buildProject(payload)
  );
  ipcMain.handle(IPC_CHANNELS.packageProject, (_event, payload) =>
    projectManager.packageProject(payload)
  );
  ipcMain.handle(IPC_CHANNELS.selectDirectory, async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
