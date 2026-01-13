import path from "node:path";

export function ensureAbsolutePath(targetPath: string): string {
  if (!path.isAbsolute(targetPath)) {
    throw new Error(`Path must be absolute: ${targetPath}`);
  }
  return path.normalize(targetPath);
}

export function ensureInsideBase(basePath: string, targetPath: string): string {
  const normalizedBase = ensureAbsolutePath(basePath);
  const normalizedTarget = ensureAbsolutePath(targetPath);
  const relative = path.relative(normalizedBase, normalizedTarget);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Path escapes base directory: ${targetPath}`);
  }
  return normalizedTarget;
}
