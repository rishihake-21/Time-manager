"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) setError(err.message);
      else router.push("/");
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) setError(err.message);
      else
        setMessage(
          "Account created. Check your inbox to confirm your email, then sign in."
        );
    }
    setBusy(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Ledger
        </h1>
        <p className="mt-1 text-sm text-inkfaint">
          College and personal, on one page.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-ink focus-visible:outline-none"
              placeholder="you@college.edu"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-ink focus-visible:outline-none"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          {message && <p className="text-sm text-college">{message}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-ink px-4 py-2 font-medium text-paper transition-opacity disabled:opacity-60"
          >
            {busy
              ? "Please wait…"
              : mode === "signin"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setMessage(null);
          }}
          className="mt-4 text-sm text-inkfaint underline underline-offset-2"
        >
          {mode === "signin"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
