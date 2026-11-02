"use client";

import React from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import {
  Sprout,
  ArrowRight,
  Kanban,
  ShieldCheck,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                PlantBoard
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                The Web Plant Assessment
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 flex flex-col items-center text-center">
        {/* Assessment Attribution Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Technical Assessment Submission for The Web Plant
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight sm:leading-tight mb-6">
          Cultivate and Deliver Projects with{" "}
          <span className="text-emerald-700">Clarity & Confidence</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mb-10 leading-relaxed font-normal">
          PlantBoard is a modern, full-stack SaaS Mini Project Manager designed for high-velocity teams.
          Organize projects, visualize tasks with interactive Kanban boards, and track real-time progress.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 mb-16 w-full max-w-md justify-center">
          <Link
            href={isAuthenticated ? "/dashboard" : "/signup"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-700/20 transition-all hover:translate-y-[-1px]"
          >
            {isAuthenticated ? "Launch Dashboard" : "Start Managing Projects"}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold border border-slate-200 transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl text-left">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <Kanban className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Interactive Kanban Boards
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Organize tasks across To Do, In Progress, and Done with smooth drag-and-drop and instant MongoDB persistence.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Live Progress & Deadlines
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated completion rates, overdue task highlighting, and upcoming deadline widgets grounded in live database state.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Hardened Security & Isolation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              HttpOnly JWT authentication, bcrypt password hashing, Zod validations, rate limiting, and strict multi-tenant ownership isolation.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-slate-800">PlantBoard</span>
            <span>— Developed for The Web Plant Technical Assessment</span>
          </div>
          <p>© 2026 PlantBoard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
