"use client";

import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAdminAuth();
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

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary" />
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
      setError("Invalid administrative credentials. Please verify and try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-[360px] space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="relative h-12 w-48 mx-auto mb-3">
            <Image
              src="/Logo.webp"
              alt="Laptop Point Bangladesh"
              fill
              priority
              sizes="192px"
              className="object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400">
            <ShieldCheck size={12} />
            Secure Admin Console
          </div>

          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Sign In to Console
          </h1>
          <p className="text-xs text-muted-foreground">
            Enter your credentials to manage inventory, catalog & customer orders.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-md border border-border bg-card p-6 sm:p-8 shadow-md space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 text-red-600 dark:text-red-400 text-xs px-3.5 py-2.5 rounded-sm border border-red-500/20 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@laptoppointbd.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-sm border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 shadow-2xs"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-sm border border-border bg-background pl-9 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 shadow-2xs"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-sm shadow-xs transition-colors"
              disabled={submitting}
            >
              {submitting ? "Authenticating..." : "Sign In to Admin Portal"}
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          &copy; {new Date().getFullYear()} Laptop Point Bangladesh. All rights reserved.
        </p>
      </div>
    </div>
  );
}
