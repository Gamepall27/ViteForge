import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import type { ProcessOutput, ProcessStartRequest } from '../../src/shared/ipc.js';
import { assertSafePath } from './validation.js';

type OutputHandler = (output: ProcessOutput) => void;

class ProcessManager {
  private processes = new Map<string, ChildProcessWithoutNullStreams>();
  private allowedCommands = new Set(['npm', 'pnpm', 'node', 'npx', 'vite', 'electron-builder']);

  start(request: ProcessStartRequest, onOutput: OutputHandler) {
    if (this.processes.has(request.id)) {
      throw new Error(`Process already running: ${request.id}`);
    }
    if (!this.allowedCommands.has(request.command)) {
      throw new Error(`Command not allowed: ${request.command}`);
    }
    if (!Array.isArray(request.args) || request.args.some((arg) => typeof arg !== 'string')) {
      throw new Error('Invalid process arguments.');
    }

    const cwd = assertSafePath(request.cwd);
    const child = spawn(request.command, request.args, { cwd });
    this.processes.set(request.id, child);

    child.stdout.on('data', (data) => {
      onOutput({ id: request.id, type: 'stdout', message: data.toString() });
    });

    child.stderr.on('data', (data) => {
      onOutput({ id: request.id, type: 'stderr', message: data.toString() });
    });

    child.on('exit', (code) => {
      onOutput({ id: request.id, type: 'exit', message: `exit:${code ?? 'unknown'}` });
      this.processes.delete(request.id);
    });
  }

  stop(id: string) {
    const child = this.processes.get(id);
    if (child) {
      child.kill();
      this.processes.delete(id);
    }
  }
}

export const processManager = new ProcessManager();
