"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { formatINR, lineKey, priceLine, STORE } from "@/lib/catalog";
import { useCart } from "@/components/cart/CartProvider";
import { LineVisual } from "@/components/cart/LineItem";
import { useAuth } from "@/components/auth/AuthProvider";

type Fields = "name" | "phone" | "email" | "address" | "city" | "state" | "pincode";

interface CheckoutResponse {
  mode: "live" | "test";
  keyId?: string;
  orderId: string;
  receipt: string;
  amount: number;
  total: number;
  summary: string;
  error?: string;
  fields?: Partial<Record<Fields, string>>;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (r: { error?: { description?: string } }) => void) => void;
    };
  }
}

function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const FIELD_META: { id: Fields; label: string; auto: string; type?: string; inputMode?: "numeric" | "tel" | "email"; span?: boolean; optional?: boolean }[] = [
  { id: "name", label: "Full name", auto: "name", span: true },
  { id: "phone", label: "Mobile number", auto: "tel-national", type: "tel", inputMode: "tel" },
  { id: "email", label: "Email", auto: "email", type: "email", inputMode: "email", optional: true },
  { id: "address", label: "House no., street, area", auto: "street-address", span: true },
  { id: "city", label: "City / town", auto: "address-level2" },
  { id: "pincode", label: "PIN code", auto: "postal-code", inputMode: "numeric" },
  { id: "state", label: "State", auto: "address-level1", span: true },
];

export default function CheckoutPage() {
  const { lines, totals, ready, clear } = useCart();
  const router = useRouter();
  const [values, setValues] = useState<Record<Fields, string>>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "Andhra Pradesh",
    pincode: "",
  });
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});
  const [status, setStatus] = useState<"idle" | "working" | "test">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [testOrder, setTestOrder] = useState<CheckoutResponse | null>(null);
  const { user, ready: authReady } = useAuth();
  const [prefilled, setPrefilled] = useState(false);

  // Fill in saved details once the session loads, without overwriting typing.
  if (authReady && user && !prefilled) {
    setPrefilled(true);
    const d = user.details;
    setValues((v) => ({
      name: v.name || d?.name || user.name,
      phone: v.phone || d?.phone || "",
      email: v.email || d?.email || user.email,
      address: v.address || d?.address || "",
      city: v.city || d?.city || "",
      state: d?.state || v.state,
      pincode: v.pincode || d?.pincode || "",
    }));
  }

  function complete(order: CheckoutResponse, paymentId: string, test: boolean) {
    setStatus("working");
    sessionStorage.setItem(
      "tej-last-order",
      JSON.stringify({
        receipt: order.receipt,
        paymentId,
        total: order.total,
        summary: order.summary,
        name: values.name,
        phone: values.phone,
        test,
      }),
    );
    clear();
    router.push("/order/confirmed");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("working");
    setMessage(null);
    setErrors({});

    let order: CheckoutResponse;
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines, customer: values }),
      });
      order = await res.json();
      if (!res.ok) {
        setErrors(order.fields ?? {});
        setMessage(order.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        const first = order.fields && (Object.keys(order.fields)[0] as Fields | undefined);
        if (first) document.getElementById(`f-${first}`)?.focus();
        return;
      }
    } catch {
      setMessage("We couldn't reach the server. Check your connection and try again.");
      setStatus("idle");
      return;
    }

    if (order.mode === "test") {
      setTestOrder(order);
      setStatus("test");
      return;
    }

    const loaded = await loadRazorpay();
    if (!loaded || !window.Razorpay) {
      setMessage("Razorpay didn't load. Check your connection, or order on WhatsApp.");
      setStatus("idle");
      return;
    }

    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: "INR",
      name: "Tej Organics",
      description: "Freshly prepared after your order",
      order_id: order.orderId,
      prefill: { name: values.name, email: values.email, contact: values.phone },
      notes: { receipt: order.receipt },
      theme: { color: "#1F4D2E" },
      handler: async (r: RazorpayResponse) => {
        setStatus("working");
        const v = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(r),
        }).then((x) => x.json()).catch(() => ({ verified: false }));
        if (v.verified) complete(order, r.razorpay_payment_id, false);
        else {
          setMessage(
            `We received a payment but couldn't verify it. Please message us on WhatsApp with payment ID ${r.razorpay_payment_id}.`,
          );
          setStatus("idle");
        }
      },
      modal: {
        ondismiss: () => {
          setStatus("idle");
          setMessage("Payment was cancelled. Your cart is saved, so you can try again whenever you're ready.");
        },
      },
    });
    rzp.on("payment.failed", (r) => {
      setMessage(`Payment failed: ${r.error?.description ?? "please try another method."} You were not charged.`);
      setStatus("idle");
    });
    rzp.open();
  }

  if (ready && lines.length === 0 && status !== "working") {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-leaf-900">Your cart is empty</h1>
        <p className="mt-2 text-ink-soft">Add something to your cart before checking out.</p>
        <Link href="/shop" className="mt-6 inline-flex rounded-full bg-turmeric-500 px-6 py-3 font-semibold text-leaf-950">
          Shop products
        </Link>
      </div>
    );
  }

  const input = (id: Fields) =>
    `mt-1.5 block h-12 w-full rounded-xl border bg-white px-4 text-[16px] text-ink placeholder:text-ink-mute focus:border-leaf-700 focus:outline-none focus:ring-2 focus:ring-leaf-200 ${
      errors[id] ? "border-chilli-700" : "border-line"
    }`;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:pt-14">
      <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-leaf-900 sm:text-5xl">Checkout</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        <form onSubmit={onSubmit} noValidate aria-describedby={message ? "form-msg" : undefined}>
          <fieldset disabled={status !== "idle"} className="contents">
            <legend className="font-display text-xl font-bold text-leaf-900">Delivery details</legend>
            {authReady && (
              <p className="mt-1.5 text-[15px] text-ink-soft">
                {user ? (
                  <>
                    Logged in as <span className="font-semibold text-ink">{user.email}</span>. These details are saved for
                    your next order.
                  </>
                ) : (
                  <>
                    Have an account?{" "}
                    <Link href="/login?next=%2Fcheckout" className="font-semibold text-leaf-800 underline">
                      Log in
                    </Link>{" "}
                    to fill these in, or continue as a guest.
                  </>
                )}
              </p>
            )}
            <div className="mt-5 grid gap-x-4 gap-y-5 sm:grid-cols-2">
              {FIELD_META.map((f) => (
                <div key={f.id} className={f.span ? "sm:col-span-2" : undefined}>
                  <label htmlFor={`f-${f.id}`} className="text-[15px] font-semibold text-ink">
                    {f.label}
                    {f.optional && <span className="font-normal text-ink-mute"> (optional)</span>}
                  </label>
                  {f.id === "address" ? (
                    <textarea
                      id="f-address"
                      autoComplete={f.auto}
                      rows={3}
                      value={values.address}
                      onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
                      aria-invalid={!!errors.address}
                      aria-describedby={errors.address ? "e-address" : undefined}
                      className={`${input("address")} h-auto py-3`}
                    />
                  ) : (
                    <input
                      id={`f-${f.id}`}
                      type={f.type ?? "text"}
                      inputMode={f.inputMode}
                      autoComplete={f.auto}
                      value={values[f.id]}
                      onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                      aria-invalid={!!errors[f.id]}
                      aria-describedby={errors[f.id] ? `e-${f.id}` : undefined}
                      className={input(f.id)}
                    />
                  )}
                  {errors[f.id] && (
                    <p id={`e-${f.id}`} className="mt-1.5 text-sm font-medium text-chilli-700">
                      {errors[f.id]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </fieldset>

          {message && (
            <p id="form-msg" role="alert" className="mt-6 rounded-xl bg-chilli-100 px-4 py-3 text-[15px] font-medium text-chilli-700">
              {message}
            </p>
          )}

          {status === "test" && testOrder ? (
            <div className="mt-8 rounded-[20px] border-2 border-dashed border-turmeric-600 bg-turmeric-100 p-5">
              <p className="font-display text-lg font-bold text-leaf-950">Test mode: no money will be charged</p>
              <p className="mt-1 text-[15px] text-ink-soft">
                Razorpay keys aren&apos;t set on this store yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to go live.
                You can simulate the payment to see the order confirmation.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => complete(testOrder, `test_pay_${Date.now().toString(36)}`, true)}
                  className="h-12 rounded-full bg-leaf-800 px-5 font-semibold text-white hover:bg-leaf-900"
                >
                  Simulate successful payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle");
                    setTestOrder(null);
                  }}
                  className="h-12 rounded-full px-5 font-semibold text-leaf-900 hover:bg-white"
                >
                  Edit details
                </button>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              disabled={status !== "idle" || !ready}
              className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-turmeric-500 text-[17px] font-bold text-leaf-950 transition-colors hover:bg-turmeric-600 disabled:cursor-wait disabled:opacity-70"
            >
              {status === "working" ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden /> Starting secure payment…
                </>
              ) : (
                <>
                  <Lock className="size-[18px]" aria-hidden /> Pay {formatINR(totals.total)} with Razorpay
                </>
              )}
            </button>
          )}
          <p className="mt-3 text-center text-[13px] text-ink-mute">
            UPI, cards, netbanking and wallets via Razorpay. Your order is prepared after payment.
          </p>
        </form>

        <aside className="h-fit rounded-[24px] bg-leaf-50 p-6 lg:sticky lg:top-28" aria-labelledby="sum-title">
          <h2 id="sum-title" className="font-display text-xl font-bold text-leaf-900">
            Order summary
          </h2>
          <ul className="mt-4 space-y-3">
            {lines.map((l) => {
              const p = priceLine(l)!;
              return (
                <li key={lineKey(l)} className="flex items-center gap-3">
                  <LineVisual line={l} className="size-14 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className="text-sm text-ink-mute">
                      {p.detail} × {l.qty}
                    </p>
                  </div>
                  <p className="tabular font-semibold">{formatINR(p.unit * l.qty)}</p>
                </li>
              );
            })}
          </ul>
          <dl className="tabular mt-5 space-y-2 border-t border-leaf-200 pt-4 text-[15px]">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd>{formatINR(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Shipping (flat)</dt>
              <dd>{formatINR(STORE.shippingFlat)}</dd>
            </div>
            <div className="flex justify-between pt-1 text-lg font-bold text-leaf-950">
              <dt>Total</dt>
              <dd>{formatINR(totals.total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
