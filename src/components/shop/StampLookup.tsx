"use client";

import Link from "next/link";
import { useState } from "react";
import { useLang } from "@/components/LangProvider";
import { fill } from "@/lib/i18n";
import type { StampCard } from "@/lib/types";
import { StampGrid } from "./StampGrid";

type State = { kind: "idle" } | { kind: "loading" } | { kind: "card"; card: StampCard | null } | { kind: "error"; msg: string };

export function StampLookup() {
  const { t } = useLang();
  const [state, setState] = useState<State>({ kind: "idle" });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const phone = String(new FormData(e.currentTarget).get("phone") ?? "").trim();
    if (phone.replace(/\D/g, "").length < 6) return setState({ kind: "error", msg: t.card.invalid });
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (res.status === 429) return setState({ kind: "error", msg: t.card.rate });
      if (!json.ok) return setState({ kind: "error", msg: t.card.invalid });
      setState({ kind: "card", card: json.card });
    } catch {
      setState({ kind: "error", msg: t.checkout.errors.generic });
    }
  }

  return (
    <div className="mt-8">
      <form onSubmit={submit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-2">
          <span className="font-medium">{t.card.phone}</span>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="field"
            aria-invalid={state.kind === "error" ? true : undefined}
            aria-describedby={state.kind === "error" ? "lookup-err" : undefined}
          />
        </label>
        <button type="submit" disabled={state.kind === "loading"} className="btn btn-primary">
          {t.card.check}
        </button>
      </form>

      <div aria-live="polite" className="mt-8">
        {state.kind === "error" ? (
          <p id="lookup-err" className="font-medium text-[#c2412d]">
            {state.msg}
          </p>
        ) : null}
        {state.kind === "card" && state.card === null ? (
          <div className="flex flex-col items-start gap-4">
            <p className="text-lg">{t.card.none}</p>
            <Link href="/menu" className="btn btn-ghost">
              {t.hero.cta}
            </Link>
          </div>
        ) : null}
        {state.kind === "card" && state.card ? (
          <div className="rounded-[var(--radius-m)] bg-cobalt p-6 text-cobalt-ink sm:p-8">
            <p className="display mb-6 text-2xl">mahlgrad</p>
            <StampGrid filled={Math.min(state.card.progress, state.card.perReward)} total={state.card.perReward} animate />
            <p className="mt-6 text-lg font-semibold">
              {fill(t.card.progress, { n: Math.min(state.card.progress, state.card.perReward), total: state.card.perReward })}
            </p>
            {state.card.rewards > 0 ? <p className="mt-1">{fill(t.card.reward, { n: state.card.rewards })}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
