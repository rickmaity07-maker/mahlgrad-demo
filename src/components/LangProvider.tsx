"use client";

import { createContext, use, useTransition } from "react";
import { useRouter } from "next/navigation";
import { dictionaries, type Dict } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { setLang } from "@/app/actions";

const LangContext = createContext<{ lang: Lang; t: Dict } | null>(null);

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext value={{ lang, t: dictionaries[lang] }}>{children}</LangContext>;
}

export function useLang() {
  const ctx = use(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}

export function LangToggle({ className = "" }: { className?: string }) {
  const { lang } = useLang();
  const router = useRouter();
  const [pending, start] = useTransition();
  const next: Lang = lang === "de" ? "en" : "de";
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await setLang(next);
          router.refresh();
        })
      }
      className={`rounded-[var(--radius-m)] border border-line px-3 py-1.5 text-sm font-semibold hover:border-ink ${className}`}
      aria-label={next === "en" ? "Switch to English" : "Auf Deutsch umschalten"}
    >
      <span className={lang === "de" ? "" : "text-muted"}>DE</span>
      <span className="px-1 text-muted">/</span>
      <span className={lang === "en" ? "" : "text-muted"}>EN</span>
    </button>
  );
}
