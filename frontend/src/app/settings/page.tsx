"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";
import { addNotification } from "@/store/slices/uiSlice";
import {
  User,
  Calendar,
  LogOut,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(addNotification({ type: "info", message: "You have been logged out." }));
    router.push("/login");
  };

  const formattedJoinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recent";

  return (
    <AppLayout
      title="Settings"
      subtitle="Manage your profile information and preferences"
    >
      <div className="max-w-4xl space-y-6">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-700" />
            Account Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <p className="text-sm font-semibold text-slate-800">{user?.name || "-"}</p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <p className="text-sm font-semibold text-slate-800">{user?.email || "-"}</p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Account Status
              </label>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active & Verified
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Member Since
              </label>
              <p className="text-sm text-slate-600 flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-slate-400" />
                {formattedJoinDate}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out from PlantBoard
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
