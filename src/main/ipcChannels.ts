export const IPC_CHANNELS = {
  listTemplates: "templates:list",
  getTemplate: "templates:get",
  createProject: "projects:create",
  installDependencies: "projects:install",
  startDevServer: "projects:dev",
  buildProject: "projects:build",
  packageProject: "projects:package",
  selectDirectory: "dialog:select-directory",
  processLog: "process:log",
  processExit: "process:exit",
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
