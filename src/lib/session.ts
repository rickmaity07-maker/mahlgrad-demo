import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, hashIp, verifySessionToken } from "./auth";

export async function isAdmin() {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

/** Call at the top of every admin page and server action (proxy.ts is only the first line of defence). */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function clientIpHash() {
  const h = await headers();
  // x-real-ip is set by the platform (Vercel); the first x-forwarded-for entry can be forged
  // by the client, so it is only a fallback for local development.
  const ip = h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",").pop()?.trim() || "local";
  return hashIp(ip);
}
