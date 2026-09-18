"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/useAuth";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setSubmitting(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (error) {
          setErrorMsg(error.message);
        } else if (data.user && !data.session) {
          setInfoMsg("Account created! Please check your email to verify your account before logging in.");
        } else if (data.session) {
          router.replace("/");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          router.replace("/");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-inkfaint">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-12 bg-webglow">
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-6 sm:p-8 shadow-xl">
        <div className="text-center">
          <h1 className="font-display text-4xl text-ink tracking-wide">
            TIMETABLE PLANNER
          </h1>
          <p className="mt-2 text-sm text-inkfaint">
            {isSignUp
              ? "Create a new account to sync your schedule across devices"
              : "Sign in to manage your college and personal timetable"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 flex rounded-lg border border-line bg-paper p-1">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg("");
              setInfoMsg("");
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              !isSignUp
                ? "bg-college text-white shadow"
                : "text-inkfaint hover:text-ink"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg("");
              setInfoMsg("");
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              isSignUp
                ? "bg-college text-white shadow"
                : "text-inkfaint hover:text-ink"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mt-4 rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            {errorMsg}
          </div>
        )}

        {/* Info Banner */}
        {infoMsg && (
          <div className="mt-4 rounded-md border border-college/40 bg-college/10 p-3 text-sm text-ink">
            {infoMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-inkfaint mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink placeholder-inkfaint/50 focus:border-college focus:outline-none focus:ring-1 focus:ring-college"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-inkfaint mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink placeholder-inkfaint/50 focus:border-college focus:outline-none focus:ring-1 focus:ring-college"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-college py-2.5 text-sm font-semibold text-white shadow-md hover:bg-college/90 disabled:opacity-50 transition"
          >
            {submitting
              ? isSignUp
                ? "Creating account..."
                : "Signing in..."
              : isSignUp
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
