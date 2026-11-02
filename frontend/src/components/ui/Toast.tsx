"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeNotification, ToastNotification } from "@/store/slices/uiSlice";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastItem: React.FC<{ toast: ToastNotification }> = ({ toast }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeNotification(toast.id));
    }, 4500);

    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
  };

  const borders = {
    success: "border-emerald-200 bg-emerald-50/90 text-emerald-900",
    error: "border-rose-200 bg-rose-50/90 text-rose-900",
    info: "border-blue-200 bg-blue-50/90 text-blue-900",
  };

  return (
    <div
      className={`flex items-start gap-3 w-80 max-w-sm p-4 rounded-xl shadow-lg border backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
        borders[toast.type]
      }`}
    >
      {icons[toast.type]}
      <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => dispatch(removeNotification(toast.id))}
        className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-lg"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const notifications = useAppSelector((state) => state.ui.notifications);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-auto">
      {notifications.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
