"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerUser, clearAuthError } from "@/store/slices/authSlice";
import { addNotification } from "@/store/slices/uiSlice";
import {
  Sprout,
  Loader2,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  Circle,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Password requirement checks
  const rules = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const passedCount = Object.values(rules).filter(Boolean).length;
  const allRulesMet = Object.values(rules).every(Boolean);

  const getStrength = () => {
    if (password.length === 0) {
      return { label: "", color: "bg-slate-200", textColor: "text-slate-400", width: "0%" };
    }
    if (passedCount <= 2) {
      return { label: "Weak", color: "bg-rose-500", textColor: "text-rose-600", width: "33%" };
    }
    if (passedCount <= 4) {
      return { label: "Medium", color: "bg-amber-500", textColor: "text-amber-600", width: "66%" };
    }
    return { label: "Strong", color: "bg-emerald-600", textColor: "text-emerald-700", width: "100%" };
  };

  const strength = getStrength();
  const passwordsMismatch = Boolean(confirmPassword && password !== confirmPassword);
  const passwordsMatch = Boolean(confirmPassword && password === confirmPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setLocalError("Full name is required.");
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setLocalError("Email address is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    if (!allRulesMet) {
      setLocalError("Please ensure your password satisfies all security requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    try {
      await dispatch(
        registerUser({
          name: trimmedName,
          email: trimmedEmail,
          password,
        })
      ).unwrap();

      dispatch(
        addNotification({
          type: "success",
          message: "Account created! Welcome to PlantBoard.",
        })
      );
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setLocalError(message || "Registration failed");
    }
  };

  const handleGoogleSignUp = () => {
    setGoogleLoading(true);
    setLocalError("");
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const googleAuthUrl = apiBase.startsWith("http")
      ? `${apiBase}/auth/google`
      : `${window.location.origin}${apiBase}/auth/google`;
    window.location.assign(googleAuthUrl);
  };

  const displayError = localError || error;

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
          Create your PlantBoard account
        </h2>
        <p className="mt-1.5 text-center text-sm text-slate-500">
          Get started with your collaborative project management workspace.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/90 rounded-2xl sm:px-10">
          {displayError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setLocalError("");
                  }}
                  placeholder="e.g., Alex Morgan"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm transition-all placeholder:text-slate-400"
                  required
                  autoFocus
                  autoComplete="name"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Email Address */}
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
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm transition-all placeholder:text-slate-400"
                  required
                  autoComplete="email"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLocalError("");
                  }}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm transition-all placeholder:text-slate-400"
                  required
                  autoComplete="new-password"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Password Strength:</span>
                    <span className={`font-semibold ${strength.textColor}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                </div>
              )}

              {/* Real-time Requirements Checklist */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  Password Requirements
                </p>
                <ul className="space-y-1.5 text-xs">
                  <li
                    className={`flex items-center gap-2 transition-colors ${
                      rules.minLength ? "text-emerald-700 font-medium" : "text-slate-500"
                    }`}
                  >
                    {rules.minLength ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                    <span>At least 8 characters</span>
                  </li>
                  <li
                    className={`flex items-center gap-2 transition-colors ${
                      rules.hasUpper ? "text-emerald-700 font-medium" : "text-slate-500"
                    }`}
                  >
                    {rules.hasUpper ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                    <span>At least one uppercase letter (A-Z)</span>
                  </li>
                  <li
                    className={`flex items-center gap-2 transition-colors ${
                      rules.hasLower ? "text-emerald-700 font-medium" : "text-slate-500"
                    }`}
                  >
                    {rules.hasLower ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                    <span>At least one lowercase letter (a-z)</span>
                  </li>
                  <li
                    className={`flex items-center gap-2 transition-colors ${
                      rules.hasNumber ? "text-emerald-700 font-medium" : "text-slate-500"
                    }`}
                  >
                    {rules.hasNumber ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                    <span>At least one number (0-9)</span>
                  </li>
                  <li
                    className={`flex items-center gap-2 transition-colors ${
                      rules.hasSpecial ? "text-emerald-700 font-medium" : "text-slate-500"
                    }`}
                  >
                    {rules.hasSpecial ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                    <span>At least one special character (!@#$%^&amp;*...)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setLocalError("");
                  }}
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    passwordsMismatch
                      ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                      : passwordsMatch
                      ? "border-emerald-300 focus:ring-emerald-700/20 focus:border-emerald-700"
                      : "border-slate-200 focus:ring-emerald-700/20 focus:border-emerald-700"
                  }`}
                  required
                  autoComplete="new-password"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Real-time Inline Password Match Feedback */}
              {passwordsMismatch && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">
                  Passwords do not match.
                </p>
              )}
              {passwordsMatch && (
                <p className="mt-1.5 text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Passwords match.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading || !allRulesMet || passwordsMismatch || !confirmPassword}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Account
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* OR Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                OR
              </span>
            </div>
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading || googleLoading}
            className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-sm font-semibold shadow-xs transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 disabled:opacity-50 cursor-pointer"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
