"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { Loader2 } from "lucide-react";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, initialCheckDone } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (initialCheckDone && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [initialCheckDone, isAuthenticated, router, pathname]);

  if (!initialCheckDone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold shadow-md animate-pulse">
            PB
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
          <p className="text-sm font-medium text-slate-500">Loading PlantBoard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
