import path from "node:path";

export const ensureInsideRoot = (root: string, target: string) => {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  if (!resolvedTarget.startsWith(resolvedRoot + path.sep)) {
    throw new Error(`Target path must be inside ${resolvedRoot}`);
  }
  return resolvedTarget;
};

export const ensureSafePathSegment = (value: string, label: string) => {
  if (!value || value.includes("..") || value.includes(path.sep)) {
    throw new Error(`Invalid ${label} provided.`);
  }
  return value;
};
