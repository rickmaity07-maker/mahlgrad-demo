"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";
import { useLang } from "@/components/LangProvider";
import { fill } from "@/lib/i18n";

export function LoginForm({ demoPassword }: { demoPassword: string | null }) {
  const { t } = useLang();
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: null });
  return (
    <form action={action} className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{t.admin.login}</h1>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t.admin.password}</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "login-err" : undefined}
          className="field"
        />
      </label>
      {state.error ? (
        <p id="login-err" role="alert" className="text-sm font-medium text-danger">
          {state.error === "locked" ? t.admin.locked : t.admin.wrong}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="btn btn-primary">
        {t.admin.signIn}
      </button>
      {demoPassword ? (
        <p className="text-sm opacity-70">{fill(t.admin.demoHint, { pw: demoPassword })}</p>
      ) : null}
    </form>
  );
}
