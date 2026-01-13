import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import type { ProcessOutput, ProjectRequest } from '../../src/shared/ipc.js';
import { listTemplates } from './templateRegistry.js';
import { assertSafePath, ensureEmptyDir, replacePlaceholdersInTree } from './validation.js';

const templateRoot = path.join(process.cwd(), 'templates');

type OutputHandler = (output: ProcessOutput) => void;

export const createProject = async (request: ProjectRequest, onOutput: OutputHandler): Promise<void> => {
  if (!request.projectName.trim()) {
    throw new Error('Project name is required.');
  }

  const templates = await listTemplates();
  const template = templates.find((entry) => entry.id === request.templateId);
  if (!template) {
    throw new Error(`Unknown template: ${request.templateId}`);
  }

  const destination = assertSafePath(request.destination);
  await ensureEmptyDir(destination);

  const templateDir = path.join(templateRoot, request.templateId);
  await fs.cp(templateDir, destination, { recursive: true });

  await replacePlaceholdersInTree(destination, {
    '{{projectName}}': request.projectName
  });

  await runInstall(destination, request.packageManager, onOutput);
};

const runInstall = async (
  cwd: string,
  packageManager: ProjectRequest['packageManager'],
  onOutput: OutputHandler
) => {
  const command = packageManager === 'pnpm' ? 'pnpm' : 'npm';
  const args = packageManager === 'pnpm' ? ['install', '--frozen-lockfile'] : ['install'];

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { cwd });
    const id = `install:${packageManager}`;

    child.stdout.on('data', (data) => {
      onOutput({ id, type: 'stdout', message: data.toString() });
    });

    child.stderr.on('data', (data) => {
      onOutput({ id, type: 'stderr', message: data.toString() });
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        onOutput({ id, type: 'exit', message: 'exit:0' });
        resolve();
      } else {
        onOutput({ id, type: 'exit', message: `exit:${code ?? 'unknown'}` });
        reject(new Error(`Install failed with code ${code}`));
      }
    });
  });
};
