import fs from "node:fs/promises";
import path from "node:path";
import { CreateProjectRequest, InstallRequest, ProjectActionRequest } from "../../shared/types.js";
import { TemplateRegistry } from "./templateRegistry.js";
import { ensureSafePathSegment } from "./pathUtils.js";
import { ProcessManager } from "./processManager.js";

const SAFE_COMMANDS = new Set(["dev", "build", "package"]);

interface ProjectManagerDeps {
  templateRegistry: TemplateRegistry;
  processManager: ProcessManager;
}

export class ProjectManager {
  constructor(private readonly deps: ProjectManagerDeps) {}

  async createProject(request: CreateProjectRequest) {
    ensureSafePathSegment(request.projectName, "project name");
    const destinationRoot = path.resolve(request.destination);
    const projectPath = path.join(destinationRoot, request.projectName);

    await fs.mkdir(destinationRoot, { recursive: true });
    await this.ensureEmpty(projectPath);

    const templatePath = await this.deps.templateRegistry.getTemplatePath(request.templateId);
    const template = await this.deps.templateRegistry.getTemplate(request.templateId);

    await fs.cp(templatePath, projectPath, { recursive: true });
    await this.replacePlaceholders(projectPath, template.placeholders, {
      PROJECT_NAME: request.projectName,
      PACKAGE_MANAGER: request.packageManager,
      ...request.values,
    });

    return { projectPath, template };
  }

  installDependencies(request: InstallRequest) {
    const projectPath = path.resolve(request.projectPath);
    const command = request.packageManager;
    const args = ["install"];
    return this.deps.processManager.spawnProcess(command, args, { cwd: projectPath });
  }

  startDevServer(request: ProjectActionRequest) {
    return this.runScript(request, "dev");
  }

  buildProject(request: ProjectActionRequest) {
    return this.runScript(request, "build");
  }

  packageProject(request: ProjectActionRequest) {
    return this.runScript(request, "package");
  }

  private runScript(request: ProjectActionRequest, command: string) {
    if (!SAFE_COMMANDS.has(command)) {
      throw new Error(`Command ${command} is not permitted.`);
    }
    const projectPath = path.resolve(request.projectPath);
    if (command !== request.command) {
      throw new Error("Command mismatch.");
    }

    const args = request.args ?? [];
    if (args.some((arg) => arg.includes(".."))) {
      throw new Error("Invalid arguments.");
    }

    return this.deps.processManager.spawnProcess("npm", ["run", command, ...args], {
      cwd: projectPath,
    });
  }

  private async ensureEmpty(projectPath: string) {
    try {
      const contents = await fs.readdir(projectPath);
      if (contents.length > 0) {
        throw new Error("Project destination must be empty.");
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return;
      }
      throw error;
    }
  }

  private async replacePlaceholders(
    projectPath: string,
    placeholderDefaults: Record<string, string>,
    values: Record<string, string>
  ) {
    const placeholders = { ...placeholderDefaults, ...values };
    const files = await this.collectFiles(projectPath);

    for (const file of files) {
      const buffer = await fs.readFile(file);
      if (buffer.includes(0)) {
        continue;
      }
      let content = buffer.toString("utf-8");
      for (const [key, value] of Object.entries(placeholders)) {
        content = content.replaceAll(`__${key}__`, value);
      }
      await fs.writeFile(file, content, "utf-8");
    }
  }

  private async collectFiles(root: string): Promise<string[]> {
    const entries = await fs.readdir(root, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const entryPath = path.join(root, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await this.collectFiles(entryPath)));
      } else if (entry.isFile()) {
        files.push(entryPath);
      }
    }

    return files;
  }
}
