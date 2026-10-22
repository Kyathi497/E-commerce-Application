"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface AccountDetails {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Account {
  name: string;
  email: string;
  details?: AccountDetails;
}

interface AuthContextValue {
  user: Account | null;
  ready: boolean;
  google: boolean;
  setUser: (user: Account | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// The session is read from the browser after load, so every page stays in the
// static shell; `ready` flips once we know who is signed in.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [google, setGoogle] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { user: Account | null; google: boolean }) => {
        if (!live) return;
        setUser(d.user);
        setGoogle(d.google);
      })
      .catch(() => {})
      .finally(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, google, setUser, logout }), [user, ready, google, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

// First name for compact UI ("Hi, Lakshmi").
export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;
