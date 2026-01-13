import { BrowserWindow } from "electron";
import { ChildProcess, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { IPC_CHANNELS } from "../ipcChannels.js";

interface ManagedProcess {
  id: string;
  child: ChildProcess;
}

export class ProcessManager {
  private readonly processes = new Map<string, ManagedProcess>();

  spawnProcess(command: string, args: string[], options: { cwd: string; env?: NodeJS.ProcessEnv }) {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const id = randomUUID();
    this.processes.set(id, { id, child });

    child.stdout?.on("data", (data) => {
      this.broadcast(IPC_CHANNELS.processLog, {
        processId: id,
        message: data.toString(),
        source: "stdout",
      });
    });

    child.stderr?.on("data", (data) => {
      this.broadcast(IPC_CHANNELS.processLog, {
        processId: id,
        message: data.toString(),
        source: "stderr",
      });
    });

    child.on("exit", (code) => {
      this.broadcast(IPC_CHANNELS.processExit, {
        processId: id,
        code,
      });
      this.processes.delete(id);
    });

    return id;
  }

  private broadcast(channel: string, payload: unknown) {
    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send(channel, payload);
    }
  }
}
