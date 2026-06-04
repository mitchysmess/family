import { spawn, spawnSync } from "node:child_process";

const serverUrl = "http://localhost:3000";
const nextArgs = ["node_modules/next/dist/bin/next", "dev"];
const server = spawn(process.execPath, nextArgs, {
  stdio: "inherit",
  shell: false,
});

let exitCode = 1;

try {
  await waitForServer(serverUrl, 120_000);

  const result = spawnSync(
    process.execPath,
    ["node_modules/playwright/cli.js", "test", ...process.argv.slice(2)],
    {
      stdio: "inherit",
      shell: false,
    },
  );

  if (result.error) {
    console.error(result.error);
  }

  exitCode = result.status ?? 1;
} finally {
  stopProcessTree(server.pid);
}

process.exit(exitCode);

async function waitForServer(url, timeoutMs) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (server.exitCode !== null) {
      throw new Error("Next dev server stopped before Playwright could run.");
    }

    try {
      const response = await fetch(url);

      if (response.ok || response.status < 500) {
        return;
      }
    } catch {
      // Server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Next dev server did not start within ${timeoutMs}ms.`);
}

function stopProcessTree(pid) {
  if (!pid) {
    return;
  }

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(pid), "/T", "/F"], {
      stdio: "ignore",
    });
    return;
  }

  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    process.kill(pid, "SIGTERM");
  }
}
