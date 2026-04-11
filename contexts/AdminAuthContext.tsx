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
  role: "owner" | "manager" | "editor" | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

const ADMIN_AUTH_KEY = "admin_authenticated";
const ADMIN_ROLE_KEY = "admin_role";

// Helper functions for cookie management
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const isSecure = window.location.protocol === "https:" ? ";Secure" : "";
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax${isSecure}`;
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
  const [role, setRole] = useState<"owner" | "manager" | "editor" | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const authenticated = getCookie(ADMIN_AUTH_KEY) === "true";
      setIsAuthenticated(authenticated);
      const cookieRole = getCookie(ADMIN_ROLE_KEY);
      if (
        cookieRole === "owner" ||
        cookieRole === "manager" ||
        cookieRole === "editor"
      ) {
        setRole(cookieRole);
      } else if (authenticated) {
        // Backward compat: authenticated session without role cookie — seed owner role.
        setCookie(ADMIN_ROLE_KEY, "owner", 7);
        setRole("owner");
      }
      setIsLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = [
      {
        role: "owner" as const,
        email:
          process.env.NEXT_PUBLIC_ADMIN_OWNER_EMAIL ||
          process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
          "admin@laptoppointbd.com",
        password:
          process.env.NEXT_PUBLIC_ADMIN_OWNER_PASSWORD ||
          process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
          "admin@123",
      },
      {
        role: "manager" as const,
        email: process.env.NEXT_PUBLIC_ADMIN_MANAGER_EMAIL || "",
        password: process.env.NEXT_PUBLIC_ADMIN_MANAGER_PASSWORD || "",
      },
      {
        role: "editor" as const,
        email: process.env.NEXT_PUBLIC_ADMIN_EDITOR_EMAIL || "",
        password: process.env.NEXT_PUBLIC_ADMIN_EDITOR_PASSWORD || "",
      },
    ];

    const matched = users.find(
      (user) => user.email === email && user.password === password,
    );

    if (matched) {
      setCookie(ADMIN_AUTH_KEY, "true", 7); // Cookie expires in 7 days
      setCookie(ADMIN_ROLE_KEY, matched.role, 7);
      setIsAuthenticated(true);
      setRole(matched.role);
      return true;
    }
    return false;
  };

  const logout = () => {
    deleteCookie(ADMIN_AUTH_KEY);
    deleteCookie(ADMIN_ROLE_KEY);
    setIsAuthenticated(false);
    setRole(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated, isLoading, role, login, logout }}
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
