import fs from "node:fs/promises";
import path from "node:path";
import type {
  CreateProjectRequest,
  CreateProjectResponse,
  ProcessOutput
} from "@shared/ipc";
import { runCommand } from "../process/runCommand";
import { ensureAbsolutePath } from "../validation/paths";
import { findTemplateById } from "../templates/registry";

async function copyDirectory(source: string, destination: string): Promise<void> {
  await fs.mkdir(destination, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const sourcePath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);
      if (entry.isDirectory()) {
        await copyDirectory(sourcePath, destPath);
        return;
      }
      if (entry.isFile()) {
        await fs.copyFile(sourcePath, destPath);
      }
    })
  );
}

async function replacePlaceholders(
  rootDir: string,
  values: Record<string, string>
): Promise<void> {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(rootDir, entry.name);
      if (entry.isDirectory()) {
        await replacePlaceholders(entryPath, values);
        return;
      }
      if (entry.isFile()) {
        const content = await fs.readFile(entryPath, "utf-8");
        const replaced = Object.entries(values).reduce((acc, [key, value]) => {
          return acc.replaceAll(`{{${key}}}`, value);
        }, content);
        await fs.writeFile(entryPath, replaced, "utf-8");
      }
    })
  );
}

function getInstallCommand(packageManager: "npm" | "pnpm"): string[] {
  if (packageManager === "pnpm") {
    return ["pnpm", "install", "--frozen-lockfile"];
  }
  return ["npm", "install", "--ignore-scripts", "--no-audit"];
}

export async function createProject(
  request: CreateProjectRequest,
  onOutput: (output: ProcessOutput) => void
): Promise<CreateProjectResponse> {
  const template = await findTemplateById(request.templateId);
  const destination = ensureAbsolutePath(request.destination);

  await fs.mkdir(destination, { recursive: true });
  await copyDirectory(template.rootDir, destination);
  await replacePlaceholders(destination, request.values);

  const [command, ...args] = getInstallCommand(request.packageManager);
  const exitCode = await runCommand(command, args, {
    cwd: destination,
    onOutput: (stream, message) => {
      onOutput({ stream, message });
    }
  });

  if (exitCode !== 0) {
    return {
      success: false,
      message: `Dependency install failed with exit code ${exitCode}`
    };
  }

  return {
    success: true,
    message: "Project created successfully"
  };
}
