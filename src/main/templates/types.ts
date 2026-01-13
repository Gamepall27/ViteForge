import type { TemplateDescriptor } from "@shared/ipc";

export interface TemplateRegistryEntry extends TemplateDescriptor {
  rootDir: string;
}
