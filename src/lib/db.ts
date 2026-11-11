import "server-only";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not configured");

/** Pooled HTTP client for request-time queries. Always use tagged templates (parameterised). */
export const sql = neon(url);
