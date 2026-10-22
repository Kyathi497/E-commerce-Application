"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type CartLine, lineKey, priceLine, totals } from "@/lib/catalog";

const STORAGE_KEY = "tej-cart-v1";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  ready: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (line: CartLine) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  totals: ReturnType<typeof totals>;
  lastAdded: string | null;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage once
        setLines(parsed.filter((l) => priceLine(l) && l.qty > 0));
      }
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const add = useCallback((line: CartLine) => {
    const key = lineKey(line);
    setLines((prev) => {
      const existing = prev.find((l) => lineKey(l) === key);
      if (existing) {
        return prev.map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(20, l.qty + line.qty) } : l));
      }
      return [...prev, line];
    });
    setLastAdded(key);
    setOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => lineKey(l) !== key)
        : prev.map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(20, qty) } : l)),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => lineKey(l) !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      ready,
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
      totals: totals(lines),
      lastAdded,
    }),
    [lines, ready, open, add, setQty, remove, clear, lastAdded],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
