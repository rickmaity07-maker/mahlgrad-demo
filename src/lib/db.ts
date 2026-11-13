import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;

/**
 * Pooled HTTP client for request-time queries. Always use tagged templates (parameterised).
 * Without DATABASE_URL (e.g. a Vercel preview build) the module still loads so the build
 * succeeds; the first query then fails with a clear message instead.
 */
export const sql: NeonQueryFunction<false, false> = url
  ? neon(url)
  : (new Proxy(() => {}, {
      apply() {
        throw new Error("DATABASE_URL is not configured");
      },
      get() {
        throw new Error("DATABASE_URL is not configured");
      },
    }) as unknown as NeonQueryFunction<false, false>);
