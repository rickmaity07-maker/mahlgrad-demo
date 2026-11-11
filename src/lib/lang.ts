import "server-only";
import { cookies } from "next/headers";
import { dictionaries } from "./i18n";
import type { Lang } from "./types";

export const LANG_COOKIE = "lang";

export async function getLang(): Promise<Lang> {
  const jar = await cookies();
  return jar.get(LANG_COOKIE)?.value === "en" ? "en" : "de";
}

export async function getDict() {
  const lang = await getLang();
  return { lang, t: dictionaries[lang] };
}
