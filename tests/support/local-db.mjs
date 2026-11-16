// Local stand-in for Neon, for end-to-end tests only. Runs Postgres in-process (PGlite, in memory)
// behind a tiny HTTP server that speaks the same JSON protocol as Neon's /sql endpoint, so the real
// app and scripts/setup-db.mjs run unchanged against a throwaway database. Nothing leaves this machine.
//
//   node tests/support/local-db.mjs [port]     -> prints "local-db ready" once seeded
//
// The app points at it with DATABASE_URL=postgres://test:test@localhost/neondb and
// NEON_LOCAL_ENDPOINT=http://127.0.0.1:<port>/sql (read in src/lib/db.ts and scripts/setup-db.mjs).
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { PGlite } from "@electric-sql/pglite";

const port = Number(process.argv[2] ?? process.env.LOCAL_DB_PORT ?? 5490);
const db = await PGlite.create();

// Neon returns every value as Postgres text ("Neon-Raw-Text-Output") and the driver parses it,
// so hand PGlite's raw text straight through instead of letting PGlite parse it first.
const raw = (x) => x;
const parsers = {};
for (let oid = 0; oid < 20000; oid++) parsers[oid] = raw;

const shape = (r) => ({
  fields: r.fields.map((f) => ({ name: f.name, dataTypeID: f.dataTypeID })),
  rows: r.rows,
  command: "",
  rowCount: r.affectedRows ?? r.rows.length,
});
// The driver also sends every parameter as text ("false", "12", "{...}"); pass it on untouched
// and let Postgres cast it, exactly as Neon does.
const serializers = {};
for (let oid = 0; oid < 20000; oid++) serializers[oid] = (x) => (x === null || x === undefined ? x : String(x));
const opts = { rowMode: "array", parsers, serializers };

const ERROR_FIELDS = ["severity", "code", "detail", "hint", "position", "schema", "table", "column", "dataType", "constraint"];

const server = createServer((req, res) => {
  if (req.method !== "POST" || !req.url?.startsWith("/sql")) {
    res.writeHead(404).end();
    return;
  }
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", async () => {
    try {
      const payload = JSON.parse(body);
      const out = Array.isArray(payload.queries)
        ? {
            results: await db.transaction(async (tx) => {
              const results = [];
              for (const q of payload.queries) results.push(shape(await tx.query(q.query, q.params ?? [], opts)));
              return results;
            }),
          }
        : shape(await db.query(payload.query, payload.params ?? [], opts));
      res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(out));
    } catch (e) {
      const err = { message: e?.message ?? String(e) };
      for (const k of ERROR_FIELDS) if (e?.[k] !== undefined) err[k] = e[k];
      res.writeHead(400, { "content-type": "application/json" }).end(JSON.stringify(err));
    }
  });
});

await new Promise((ok) => server.listen(port, "127.0.0.1", ok));

// Seed with the project's own setup script (schema + demo menu + demo stamp cards).
const env = {
  ...process.env,
  DATABASE_URL: "postgres://test:test@localhost/neondb",
  DATABASE_URL_UNPOOLED: "postgres://test:test@localhost/neondb",
  NEON_LOCAL_ENDPOINT: `http://127.0.0.1:${port}/sql`,
};
const code = await new Promise((ok) => {
  const p = spawn(process.execPath, ["scripts/setup-db.mjs", "--reset-orders"], { env, stdio: "inherit" });
  p.on("exit", ok);
});
if (code !== 0) {
  console.error("local-db: seeding failed");
  process.exit(1);
}
console.log(`local-db ready on http://127.0.0.1:${port}/sql`);
