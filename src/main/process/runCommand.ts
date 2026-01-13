import { spawn } from "node:child_process";

export interface RunCommandOptions {
  cwd: string;
  env?: Record<string, string>;
  onOutput?: (stream: "stdout" | "stderr", chunk: string) => void;
}

export async function runCommand(
  command: string,
  args: string[],
  options: RunCommandOptions
): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: {
        ...process.env,
        ...options.env
      },
      stdio: ["ignore", "pipe", "pipe"]
    });

    child.stdout.on("data", (data) => {
      options.onOutput?.("stdout", data.toString());
    });

    child.stderr.on("data", (data) => {
      options.onOutput?.("stderr", data.toString());
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      resolve(code ?? 0);
    });
  });
}
