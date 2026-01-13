import fs from 'node:fs/promises';
import path from 'node:path';
import type { TemplateDescriptor } from '../../src/shared/ipc.js';

const registryPath = path.join(process.cwd(), 'templates', 'registry.json');

export const listTemplates = async (): Promise<TemplateDescriptor[]> => {
  const raw = await fs.readFile(registryPath, 'utf-8');
  const data = JSON.parse(raw) as TemplateDescriptor[];
  return data;
};
