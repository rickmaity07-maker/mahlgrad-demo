"use client";

import { useActionState } from "react";
import { useLang } from "@/components/LangProvider";

type Result = { ok: boolean } | null;

/** Wraps a server action form and shows "Saved" / error inline next to the button. */
export function SaveForm(props: {
  action: (form: FormData) => Promise<{ ok: boolean }>;
  className?: string;
  label?: string;
  children: React.ReactNode;
}) {
  const { t } = useLang();
  const [state, run, pending] = useActionState<Result, FormData>((_prev, form) => props.action(form), null);
  return (
    <form action={run} className={props.className}>
      {props.children}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-ghost px-4 py-2 text-sm">
          {props.label ?? t.admin.menu.save}
        </button>
        <span aria-live="polite" className="text-sm font-medium">
          {state?.ok ? <span className="text-ok">{t.admin.menu.saved}</span> : null}
          {state && !state.ok ? <span className="text-danger">!</span> : null}
        </span>
      </div>
    </form>
  );
}
