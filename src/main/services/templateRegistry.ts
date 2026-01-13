import fs from "node:fs/promises";
import path from "node:path";
import { TemplateDescription, TemplateSummary } from "../../shared/types.js";
import { ensureSafePathSegment } from "./pathUtils.js";

const TEMPLATE_DESCRIPTOR = "template.json";

export class TemplateRegistry {
  constructor(private readonly registryRoot: string) {}

  async listTemplates(): Promise<TemplateSummary[]> {
    const entries = await fs.readdir(this.registryRoot, { withFileTypes: true });
    const templates: TemplateSummary[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const templateId = ensureSafePathSegment(entry.name, "template id");
      const descriptorPath = path.join(this.registryRoot, templateId, TEMPLATE_DESCRIPTOR);
      const description = await this.readDescription(descriptorPath);
      templates.push({
        id: description.id,
        name: description.name,
        version: description.version,
        framework: description.framework,
        language: description.language,
        target: description.target,
      });
    }

    return templates;
  }

  async getTemplate(templateId: string): Promise<TemplateDescription> {
    const safeId = ensureSafePathSegment(templateId, "template id");
    const descriptorPath = path.join(this.registryRoot, safeId, TEMPLATE_DESCRIPTOR);
    return this.readDescription(descriptorPath);
  }

  async getTemplatePath(templateId: string): Promise<string> {
    const safeId = ensureSafePathSegment(templateId, "template id");
    const templatePath = path.join(this.registryRoot, safeId);
    await fs.access(templatePath);
    return templatePath;
  }

  private async readDescription(filePath: string): Promise<TemplateDescription> {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as TemplateDescription;

    if (!parsed.id || !parsed.name || !parsed.version) {
      throw new Error(`Invalid template descriptor at ${filePath}`);
    }

    return parsed;
  }
}
