import fs from "node:fs/promises";
import path from "node:path";
import type { TemplateDescriptor } from "@shared/ipc";
import type { TemplateRegistryEntry } from "./types";

const TEMPLATE_DIR = path.join(process.cwd(), "templates");
const TEMPLATE_MANIFEST = "template.json";

export async function loadTemplateRegistry(): Promise<TemplateRegistryEntry[]> {
  const entries = await fs.readdir(TEMPLATE_DIR, { withFileTypes: true });
  const templates = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const rootDir = path.join(TEMPLATE_DIR, entry.name);
        const manifestPath = path.join(rootDir, TEMPLATE_MANIFEST);
        const manifestRaw = await fs.readFile(manifestPath, "utf-8");
        const descriptor = JSON.parse(manifestRaw) as TemplateDescriptor;
        return {
          ...descriptor,
          rootDir
        } satisfies TemplateRegistryEntry;
      })
  );

  return templates.sort((a, b) => a.name.localeCompare(b.name));
}

export async function findTemplateById(
  templateId: string
): Promise<TemplateRegistryEntry> {
  const templates = await loadTemplateRegistry();
  const match = templates.find((template) => template.id === templateId);
  if (!match) {
    throw new Error(`Template not found: ${templateId}`);
  }
  return match;
}
