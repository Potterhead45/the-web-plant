"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser, clearAuthError } from "@/store/slices/authSlice";
import { addNotification } from "@/store/slices/uiSlice";
import { Sprout, Loader2, Lock, Mail, ArrowRight, Sparkles } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!email.trim() || !password) {
      setLocalError("Please enter both email and password");
      return;
    }

    try {
      await dispatch(
        loginUser({
          email: email.trim(),
          password,
        })
      ).unwrap();

      dispatch(
        addNotification({
          type: "success",
          message: "Welcome back to PlantBoard!",
        })
      );
      router.push(redirectUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setLocalError(message || "Login failed");
    }
  };

  const handleFillDemo = () => {
    setEmail("demo@plantboard.dev");
    setPassword("Password123!");
    setLocalError("");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-700/20 group-hover:bg-emerald-800 transition-colors">
              <Sprout className="w-7 h-7" />
            </div>
          </Link>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign in to PlantBoard
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          The Web Plant Technical Assessment
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/90 rounded-2xl sm:px-10">
          {/* Demo Account Banner */}
          <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-emerald-900 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Assessment Testing Demo</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline shrink-0 cursor-pointer"
            >
              Autofill
            </button>
          </div>

          {(localError || error) && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {localError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setLocalError("");
                  }}
                  placeholder="e.g., jane@plantboard.dev"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm transition-all placeholder:text-slate-400"
                  required
                  autoComplete="email"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLocalError("");
                  }}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm transition-all placeholder:text-slate-400"
                  required
                  autoComplete="current-password"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/signup"
                className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
