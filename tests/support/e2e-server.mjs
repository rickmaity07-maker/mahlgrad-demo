// Starts the whole site for end-to-end tests against a throwaway in-memory database:
// local-db (PGlite, seeded with db/seed.json) -> next build -> next start on E2E_PORT.
// Real env vars beat .env.local in Next, and NEON_LOCAL_ENDPOINT reroutes every query,
// so the live Neon database is never touched.
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";

const dbPort = 5490;
const appPort = Number(process.env.E2E_PORT ?? 3100);

export const E2E_ENV = {
  DATABASE_URL: "postgres://test:test@localhost/neondb",
  DATABASE_URL_UNPOOLED: "postgres://test:test@localhost/neondb",
  NEON_LOCAL_ENDPOINT: `http://127.0.0.1:${dbPort}/sql`,
  ADMIN_PASSWORD: process.env.E2E_ADMIN_PASSWORD ?? "e2e-admin-pass",
  ADMIN_SECRET: randomBytes(32).toString("hex"),
  DEMO_MODE: "1",
  CRON_SECRET: "",
  NEXT_TELEMETRY_DISABLED: "1",
};
const env = { ...process.env, ...E2E_ENV };

const children = [];
const stop = () => children.forEach((c) => c.kill());
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
process.on("exit", stop);

function run(cmd, args, opts = {}) {
  // npx is a .cmd shim on Windows and needs a shell; node itself must not go through one
  // (its path contains a space: "C:\Program Files\nodejs\node.exe").
  const shell = process.platform === "win32" && cmd === "npx";
  const c = spawn(shell ? `npx ${args.join(" ")}` : cmd, shell ? [] : args, {
    env,
    stdio: opts.pipe ? ["ignore", "pipe", "inherit"] : "inherit",
    shell,
  });
  children.push(c);
  return c;
}

// 1) database, wait for "ready"
await new Promise((ok, fail) => {
  const db = run(process.execPath, ["tests/support/local-db.mjs", String(dbPort)], { pipe: true });
  db.stdout.on("data", (d) => {
    process.stdout.write(d);
    if (String(d).includes("local-db ready")) ok();
  });
  db.on("exit", (code) => fail(new Error(`local-db exited (${code})`)));
});

// 2) production build, 3) serve it
if (!process.env.E2E_SKIP_BUILD) {
  const code = await new Promise((ok) => run("npx", ["next", "build"]).on("exit", ok));
  if (code !== 0) process.exit(code ?? 1);
}
run("npx", ["next", "start", "-p", String(appPort)]);
