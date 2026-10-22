"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { CircleCheck } from "lucide-react";
import { formatINR, STORE } from "@/lib/catalog";
import { StageStrip } from "@/components/StageStrip";
import { WhatsAppIcon } from "@/components/icons";

interface LastOrder {
  receipt: string;
  paymentId: string;
  total: number;
  summary: string;
  name: string;
  phone: string;
  test: boolean;
}

const read = () => sessionStorage.getItem("tej-last-order");
const subscribe = () => () => {};

export default function OrderConfirmed() {
  const raw = useSyncExternalStore(subscribe, read, () => null);
  const order: LastOrder | null = raw ? JSON.parse(raw) : null;

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-leaf-900">No recent order found</h1>
        <p className="mt-2 text-ink-soft">
          If you paid and don&apos;t see a confirmation, message us on WhatsApp and we&apos;ll check it for you.
        </p>
        <Link href="/shop" className="mt-6 inline-flex rounded-full bg-turmeric-500 px-6 py-3 font-semibold text-leaf-950">
          Back to shop
        </Link>
      </div>
    );
  }

  const whatsappText = `Hi Tej Organics, I placed order ${order.receipt} (payment ${order.paymentId}).`;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-12 sm:px-6 lg:pt-16">
      {order.test && (
        <p className="mb-6 rounded-xl border-2 border-dashed border-turmeric-600 bg-turmeric-100 px-4 py-3 text-[15px] font-semibold text-leaf-950">
          Test mode: this was a simulated payment. No money was charged.
        </p>
      )}
      <CircleCheck className="size-14 text-leaf-700" strokeWidth={1.6} aria-hidden />
      <h1 className="mt-4 font-display text-4xl font-extrabold tracking-[-0.03em] text-leaf-900 sm:text-5xl">
        Thank you, {order.name.split(" ")[0]}. Your order is in.
      </h1>
      <p className="mt-3 max-w-[60ch] text-[17px] text-ink-soft">
        We&apos;ll now prepare everything fresh, pack it with care and send it straight to you. We&apos;ll contact you on{" "}
        {order.phone} about delivery.
      </p>

      <dl className="mt-8 grid gap-4 rounded-[24px] bg-leaf-50 p-6 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-ink-mute">Order reference</dt>
          <dd className="tabular mt-0.5 font-semibold">{order.receipt}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-mute">Payment ID</dt>
          <dd className="tabular mt-0.5 break-all font-semibold">{order.paymentId}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-mute">Total paid</dt>
          <dd className="tabular mt-0.5 font-semibold">{formatINR(order.total)}</dd>
        </div>
        <div className="sm:col-span-3">
          <dt className="text-sm text-ink-mute">Items</dt>
          <dd className="mt-0.5">{order.summary}</dd>
        </div>
      </dl>

      <h2 className="mt-14 font-display text-2xl font-bold text-leaf-900">What happens next</h2>
      <div className="mt-8">
        <StageStrip />
      </div>

      <div className="mt-14 flex flex-wrap gap-3">
        <a
          href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(whatsappText)}`}
          className="flex h-12 items-center gap-2 rounded-full bg-leaf-800 px-5 font-semibold text-white hover:bg-leaf-900"
        >
          <WhatsAppIcon className="size-5" /> Message us about this order
        </a>
        <Link href="/shop" className="flex h-12 items-center rounded-full border-2 border-leaf-800 px-5 font-semibold text-leaf-900 hover:bg-leaf-50">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
