"use client";

import Link from "next/link";
import { formatINR, lineKey, STORE } from "@/lib/catalog";
import { useCart } from "@/components/cart/CartProvider";
import { LineItem } from "@/components/cart/LineItem";

export default function CartPage() {
  const { lines, totals, ready } = useCart();

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:pt-14">
      <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-leaf-900 sm:text-5xl">Your cart</h1>

      {!ready ? (
        <div className="mt-10 h-40 animate-pulse rounded-[24px] bg-leaf-50" aria-label="Loading cart" />
      ) : lines.length === 0 ? (
        <div className="mt-10 rounded-[28px] bg-leaf-50 px-6 py-16 text-center">
          <p className="font-display text-2xl font-bold text-leaf-900">Your cart is empty</p>
          <p className="mt-2 text-ink-soft">Add a jar or a ₹999 combo. We only start preparing it after you order.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/shop" className="rounded-full bg-turmeric-500 px-6 py-3 font-semibold text-leaf-950 hover:bg-turmeric-600">
              Shop products
            </Link>
            <Link href="/combos" className="rounded-full border-2 border-leaf-800 px-6 py-3 font-semibold text-leaf-900 hover:bg-white">
              See combos
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-line border-y border-line">
            {lines.map((l) => (
              <LineItem key={lineKey(l)} line={l} />
            ))}
          </ul>
          <aside className="h-fit rounded-[24px] bg-leaf-50 p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-xl font-bold text-leaf-900">Order summary</h2>
            <dl className="tabular mt-4 space-y-2 text-[15px]">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd>{formatINR(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Shipping (flat)</dt>
                <dd>{formatINR(STORE.shippingFlat)}</dd>
              </div>
              <div className="flex justify-between border-t border-leaf-200 pt-3 text-lg font-bold text-leaf-950">
                <dt>Total</dt>
                <dd>{formatINR(totals.total)}</dd>
              </div>
            </dl>
            <Link
              href="/checkout"
              className="mt-5 flex h-14 items-center justify-center rounded-full bg-turmeric-500 text-[17px] font-bold text-leaf-950 hover:bg-turmeric-600"
            >
              Checkout
            </Link>
            <p className="mt-3 text-center text-[13px] text-ink-mute">Secure payment by Razorpay: UPI, cards, netbanking</p>
          </aside>
        </div>
      )}
    </div>
  );
}
