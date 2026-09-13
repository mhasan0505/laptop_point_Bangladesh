"use client";

import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/admin");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3.5 p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/60"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full border-2 border-blue-600/20 border-t-blue-600 animate-spin" />
          </div>
          <span className="text-xs text-slate-600 font-medium tracking-wide">
            Access authorized. Entering dashboard...
          </span>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const success = await login(email, password);

    if (success) {
      router.replace("/admin");
    } else {
      setError("Invalid administrative credentials");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 relative overflow-hidden flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      {/* Soft Ambient Pastel Glows for Light Aesthetic */}
      <div
        className="absolute -top-36 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-blue-100/60 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/4 -right-32 w-[450px] h-[450px] bg-indigo-100/50 rounded-full blur-[110px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -left-32 w-[450px] h-[450px] bg-sky-100/50 rounded-full blur-[110px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Subtle Dot Matrix Pattern */}
      <div
        className="absolute inset-0 bg-[radial-gradient(#0000000a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Bar / Header Status */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to Store</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 shadow-xs backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-medium tracking-wider text-slate-600 uppercase">
            Systems Online
          </span>
        </div>
      </header>

      {/* Main Login Card Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px]"
        >
          <div className="relative rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.07),0_0_1px_1px_rgba(0,0,0,0.03)] p-7 sm:p-9 overflow-hidden">
            {/* Top inner ambient line */}
            <div
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent pointer-events-none"
              aria-hidden="true"
            />

            {/* Header Content */}
            <div className="text-center flex flex-col items-center mb-8">
              {/* Brand Logo */}
              <div className="mb-5 flex items-center justify-center">
                <Image
                  src="/Logo.webp"
                  alt="Laptop Point Bangladesh"
                  width={180}
                  height={42}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1.5">
                Admin Console
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-[280px]">
                Sign in with your administrative credentials to manage store
                operations
              </p>
            </div>

            {/* Sign-in Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-3 rounded-xl flex items-center gap-2.5"
                  >
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Field */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-slate-700 tracking-wide"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    placeholder="admin@laptoppointbd.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-slate-700 tracking-wide"
                  >
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400">Secure</span>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative w-full overflow-hidden rounded-xl bg-slate-900 hover:bg-black py-3 px-4 text-sm font-medium text-white shadow-lg shadow-slate-900/15 transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-white/20 pointer-events-none" />
                  <span className="flex items-center justify-center gap-2">
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Dashboard</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </button>
              </div>

              {/* Security Session Indicator */}
              <div className="pt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>256-bit Encrypted Session • Authorized Access Only</span>
              </div>
            </form>
          </div>
        </motion.div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-400">
        <p>
          &copy; {new Date().getFullYear()} Laptop Point Bangladesh. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
