"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

const ADMIN_AUTH_KEY = "admin_authenticated";

// Helper functions for cookie management
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  // Start with isLoading=true so server and client render the same initial HTML
  // (both render a spinner), preventing hydration mismatches.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAuthenticated(getCookie(ADMIN_AUTH_KEY) === "true");
      setIsLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check against environment variables or hardcoded admin credentials
    const adminEmail =
      process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@laptoppointbd.com";
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin@123";

    if (email === adminEmail && password === adminPassword) {
      setCookie(ADMIN_AUTH_KEY, "true", 7); // Cookie expires in 7 days
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    deleteCookie(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
