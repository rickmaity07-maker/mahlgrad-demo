// Admin session: a signed, expiring token in an httpOnly cookie.
// Web Crypto only, so the same code runs in proxy.ts and in server code.
export const SESSION_COOKIE = "mahlgrad_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

const enc = new TextEncoder();

function secret() {
  const s = process.env.ADMIN_SECRET;
  if (!s || s.length < 32) throw new Error("ADMIN_SECRET must be set (32+ chars)");
  return s;
}

function toBase64Url(buf: ArrayBuffer) {
  let bin = "";
  for (const b of new Uint8Array(buf)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  return toBase64Url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken() {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `admin.${exp}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySessionToken(token: string | undefined | null) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "admin") return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(parts[2], await hmac(`${parts[0]}.${parts[1]}`));
}

/** Constant-time password check (HMAC both sides so lengths always match). */
export async function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const [a, b] = await Promise.all([hmac(`pw:${input}`), hmac(`pw:${expected}`)]);
  return safeEqual(a, b);
}

/** IPs are only stored as keyed hashes (rate limiting), never in clear text. */
export async function hashIp(ip: string) {
  return (await hmac(`ip:${ip}`)).slice(0, 24);
}
