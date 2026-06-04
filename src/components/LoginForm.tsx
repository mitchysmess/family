"use client";

import { FormEvent, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";

type LoginFormProps = {
  error?: string;
  isSubmitting: boolean;
  message?: string;
  onSubmit: (password: string) => Promise<void>;
};

export function LoginForm({
  error,
  isSubmitting,
  message,
  onSubmit,
}: LoginFormProps) {
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!password) {
      setValidationError("Vul het algemene wachtwoord in.");
      return;
    }

    setValidationError("");
    await onSubmit(password);
  }

  return (
    <main className="min-h-screen bg-transparent px-6 py-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-8 flex items-center gap-4">
          <BrandLogo />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#347468]">
              Familie Hoekstra
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[#183b35]">
              Gezinslogin
            </h1>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-[#d7e3ce] bg-white/95 p-5 shadow-[0_18px_55px_rgba(36,79,69,0.08)] sm:p-6"
        >
          <p className="text-sm font-medium leading-6 text-[#5e6656]">
            Log in met het gedeelde familiewachtwoord.
          </p>

          <label className="mt-5 grid gap-2 text-sm font-semibold text-[#183b35]">
            Wachtwoord
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(validationError || error)}
              className="h-11 rounded-full border border-[#b9cdb7] px-4 text-sm outline-none transition focus:border-[#e66d35] focus:ring-2 focus:ring-[#e66d35]/15"
              autoComplete="current-password"
            />
          </label>

          {validationError ? (
            <p className="mt-3 text-sm text-red-700">{validationError}</p>
          ) : null}

          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

          {message ? (
            <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 h-11 w-full rounded-full bg-[#244f45] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(36,79,69,0.18)] transition hover:-translate-y-0.5 hover:bg-[#347468] disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {isSubmitting ? "Inloggen..." : "Inloggen"}
          </button>
        </form>
      </section>
    </main>
  );
}
