import fs from 'node:fs/promises';
import path from 'node:path';

const allowedTextExtensions = new Set(['.json', '.ts', '.tsx', '.js', '.jsx', '.md', '.html', '.css']);

export const assertSafePath = (target: string): string => {
  const resolved = path.resolve(target);
  if (!resolved || resolved === path.parse(resolved).root) {
    throw new Error('Invalid destination path.');
  }
  return resolved;
};

export const ensureEmptyDir = async (target: string) => {
  await fs.mkdir(target, { recursive: true });
  const entries = await fs.readdir(target);
  if (entries.length > 0) {
    throw new Error('Destination directory must be empty.');
  }
};

export const replacePlaceholdersInTree = async (root: string, replacements: Record<string, string>) => {
  const entries = await fs.readdir(root, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(root, entry.name);
      if (entry.isDirectory()) {
        await replacePlaceholdersInTree(fullPath, replacements);
        return;
      }
      if (!allowedTextExtensions.has(path.extname(entry.name))) {
        return;
      }
      const content = await fs.readFile(fullPath, 'utf-8');
      const updated = Object.entries(replacements).reduce(
        (acc, [key, value]) => acc.replaceAll(key, value),
        content
      );
      if (updated !== content) {
        await fs.writeFile(fullPath, updated, 'utf-8');
      }
    })
  );
};
