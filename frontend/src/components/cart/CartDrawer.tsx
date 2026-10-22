"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { formatINR, lineKey, STORE } from "@/lib/catalog";
import { useCart } from "./CartProvider";
import { LineItem } from "./LineItem";

export function CartDrawer() {
  const { open, setOpen, lines, totals, count } = useCart();
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  return (
    <dialog
      ref={ref}
      onClose={() => setOpen(false)}
      onClick={(e) => {
        if (e.target === ref.current) setOpen(false);
      }}
      aria-labelledby="cart-title"
      className="drawer-scrim fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-leaf-950/45"
    >
      <div className="drawer-panel ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-[-12px_0_40px_rgba(15,44,26,0.18)]">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="cart-title" className="font-display text-xl font-bold text-leaf-900">
            Your cart <span className="tabular font-sans text-base font-medium text-ink-mute">({count})</span>
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid size-10 place-items-center rounded-full hover:bg-leaf-50"
            aria-label="Close cart"
            autoFocus
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="font-display text-2xl font-bold text-leaf-900">Nothing in the cart yet</p>
            <p className="mt-2 text-ink-soft">
              Pick a jar or a combo. We start preparing it only after you order.
            </p>
            <Link
              href="/shop"
              className="mt-6 rounded-full bg-turmeric-500 px-6 py-3 font-semibold text-leaf-950 hover:bg-turmeric-600"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {lines.map((l) => (
                <LineItem key={lineKey(l)} line={l} compact />
              ))}
            </ul>
            <div className="border-t border-line bg-leaf-50 px-5 pb-5 pt-4">
              <dl className="tabular space-y-1.5 text-[15px]">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Subtotal</dt>
                  <dd>{formatINR(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Shipping (flat)</dt>
                  <dd>{formatINR(STORE.shippingFlat)}</dd>
                </div>
                <div className="flex justify-between pt-1.5 text-lg font-bold text-leaf-950">
                  <dt>Total</dt>
                  <dd>{formatINR(totals.total)}</dd>
                </div>
              </dl>
              <Link
                href="/checkout"
                className="mt-4 flex h-13 items-center justify-center rounded-full bg-turmeric-500 text-[17px] font-bold text-leaf-950 hover:bg-turmeric-600"
              >
                Checkout · {formatINR(totals.total)}
              </Link>
              <Link href="/cart" className="mt-2 block py-2 text-center text-sm font-semibold text-leaf-800 underline">
                View full cart
              </Link>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
