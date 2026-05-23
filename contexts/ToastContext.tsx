"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info, Heart, ShoppingBag, ArrowRightLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type ToastType = "success" | "error" | "warning" | "info" | "cart" | "wishlist" | "comparison";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  cartToast: (message: string, duration?: number) => void;
  wishlistToast: (message: string, duration?: number) => void;
  comparisonToast: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const success = useCallback((message: string, duration?: number) => toast(message, "success", duration), [toast]);
  const error = useCallback((message: string, duration?: number) => toast(message, "error", duration), [toast]);
  const warning = useCallback((message: string, duration?: number) => toast(message, "warning", duration), [toast]);
  const info = useCallback((message: string, duration?: number) => toast(message, "info", duration), [toast]);
  const cartToast = useCallback((message: string, duration?: number) => toast(message, "cart", duration), [toast]);
  const wishlistToast = useCallback((message: string, duration?: number) => toast(message, "wishlist", duration), [toast]);
  const comparisonToast = useCallback((message: string, duration?: number) => toast(message, "comparison", duration), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, cartToast, wishlistToast, comparisonToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-[calc(100vw-40px)] pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            let Icon = Info;
            let bgCls = "bg-white/95 border-gray-200 text-gray-900 shadow-lg shadow-gray-200/50";
            let iconCls = "text-blue-500 bg-blue-50";

            if (t.type === "success") {
              Icon = CheckCircle2;
              bgCls = "bg-white/95 border-emerald-100 text-gray-900 shadow-xl shadow-emerald-500/10";
              iconCls = "text-emerald-600 bg-emerald-50";
            } else if (t.type === "error") {
              Icon = AlertCircle;
              bgCls = "bg-white/95 border-red-100 text-gray-900 shadow-xl shadow-red-500/10";
              iconCls = "text-red-600 bg-red-50";
            } else if (t.type === "warning") {
              Icon = AlertTriangle;
              bgCls = "bg-white/95 border-amber-100 text-gray-900 shadow-xl shadow-amber-500/10";
              iconCls = "text-amber-600 bg-amber-50";
            } else if (t.type === "cart") {
              Icon = ShoppingBag;
              bgCls = "bg-black/95 border-gray-800 text-white shadow-xl shadow-black/20";
              iconCls = "text-white bg-white/10";
            } else if (t.type === "wishlist") {
              Icon = Heart;
              bgCls = "bg-white/95 border-rose-100 text-gray-900 shadow-xl shadow-rose-500/10";
              iconCls = "text-rose-600 bg-rose-50";
            } else if (t.type === "comparison") {
              Icon = ArrowRightLeft;
              bgCls = "bg-white/95 border-indigo-100 text-gray-900 shadow-xl shadow-indigo-500/10";
              iconCls = "text-indigo-600 bg-indigo-50";
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
                layout
                className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 border rounded-xl backdrop-blur-md transition-all ${bgCls}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${iconCls} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 shrink-0" />
                  </div>
                  <p className="text-sm font-semibold leading-snug">{t.message}</p>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100/50 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
