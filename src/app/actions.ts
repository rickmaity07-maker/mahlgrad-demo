"use server";

import { cookies } from "next/headers";
import { LANG_COOKIE } from "@/lib/lang";

export async function setLang(lang: string) {
  const value = lang === "en" ? "en" : "de";
  const jar = await cookies();
  jar.set(LANG_COOKIE, value, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}
