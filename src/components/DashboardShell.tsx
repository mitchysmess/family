"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { LoginForm } from "@/components/LoginForm";
import { TaskDayOverview } from "@/components/TaskDayOverview";

export function DashboardShell() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | undefined>();

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session");
        const body = await response.json();
        setIsAuthenticated(Boolean(body.authenticated));
      } catch {
        setAuthError("Sessie controleren is mislukt.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, []);

  async function signIn(password: string) {
    setIsSubmitting(true);
    setAuthError(undefined);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      const body = await response.json();

      if (!response.ok) {
        setAuthError(body.error ?? "Inloggen is mislukt.");
        return;
      }

      setIsAuthenticated(true);
    } catch {
      setAuthError("Inloggen is mislukt. Probeer het opnieuw.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function signOut() {
    setIsLoading(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f7f1] px-6">
        <div className="rounded-lg border border-neutral-200 bg-white px-5 py-4 text-sm text-neutral-600 shadow-sm">
          Thuisbasis laden...
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginForm
        error={authError}
        isSubmitting={isSubmitting}
        onSubmit={signIn}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f1]">
      <AppHeader
        currentUser={{ name: "Familie", email: "Gedeelde gezinslogin" }}
        onSignOut={signOut}
      />
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <TaskDayOverview />
      </section>
    </main>
  );
}
