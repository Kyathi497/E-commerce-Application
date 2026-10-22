"use client";

import { useId, useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { formatINR, type Product, SIZES, type SizeKey, STORE } from "@/lib/catalog";
import { Jar } from "./Jar";
import { SizePicker } from "./ProductCard";
import { useCart } from "./cart/CartProvider";
import { WhatsAppIcon } from "./icons";

export function ProductBuy({ product }: { product: Product }) {
  const [size, setSize] = useState<SizeKey>("1kg");
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const name = useId();
  const price = SIZES[size].price;

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
      <div
        className="relative grid aspect-square place-items-center overflow-hidden rounded-[32px] lg:sticky lg:top-28"
        style={{ background: product.tint }}
      >
        <Jar
          fill={product.fill}
          fillDeep={product.fillDeep}
          texture={product.texture}
          level={SIZES[size].fill}
          className="w-[58%]"
          title={`${product.name}, ${SIZES[size].label} jar`}
        />
        <p className="absolute bottom-4 left-0 right-0 text-center text-[12px] text-ink-mute">
          Illustration. Product photos coming soon.
        </p>
      </div>

      <div className="lg:py-6">
        <h1 className="font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] text-leaf-900 sm:text-5xl">
          {product.name}
        </h1>
        <p lang="te" className="mt-2 font-telugu text-lg text-ink-mute">
          {product.telugu}
        </p>
        <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-ink-soft">{product.description}</p>

        <div className="mt-8 rounded-[24px] border border-line p-5 sm:p-6">
          <p className="tabular font-display text-4xl font-bold text-leaf-900" aria-live="polite">
            {formatINR(price * qty)}
            {qty > 1 && (
              <span className="ml-2 font-sans text-base font-medium text-ink-mute">
                {qty} × {formatINR(price)}
              </span>
            )}
          </p>
          <p className="mt-1 text-sm text-ink-mute">+ flat ₹{STORE.shippingFlat} shipping per order</p>

          <div className="mt-5">
            <SizePicker value={size} onChange={setSize} name={name} large />
          </div>

          <div className="mt-4 flex gap-3">
            <div className="flex h-14 items-center rounded-full border border-line">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="grid size-12 place-items-center rounded-full text-leaf-900 hover:bg-leaf-50 disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" aria-hidden />
              </button>
              <span className="tabular w-8 text-center text-lg font-semibold" aria-label={`Quantity ${qty}`}>
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(20, q + 1))}
                disabled={qty >= 20}
                className="grid size-12 place-items-center rounded-full text-leaf-900 hover:bg-leaf-50 disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
            <button
              type="button"
              onClick={() => add({ kind: "product", slug: product.slug, size, qty })}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-turmeric-500 text-[17px] font-bold text-leaf-950 transition-colors hover:bg-turmeric-600"
            >
              <ShoppingBag className="size-5" aria-hidden />
              Add to cart
            </button>
          </div>
          <a
            href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(`Hi Tej Organics, I have a question about ${product.name}.`)}`}
            className="mt-4 flex items-center justify-center gap-2 text-[15px] font-semibold text-leaf-800 hover:underline"
          >
            <WhatsAppIcon className="size-[18px]" />
            Ask about this product on WhatsApp
          </a>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-leaf-900">Good for</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {product.uses.map((u) => (
              <li key={u} className="rounded-full bg-leaf-50 px-4 py-2 text-[15px] text-leaf-900">
                {u}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-leaf-900">How your jar is made</h2>
          <ol className="mt-3 space-y-2 text-[16px] text-ink-soft">
            <li>1. You place the order. Nothing is pre-packed and waiting.</li>
            <li>2. We prepare your {product.name.toLowerCase()} fresh for your order.</li>
            <li>3. It is sealed in a glass jar under a jute-cloth lid and sent to you.</li>
          </ol>
          <p className="mt-4 text-[15px] text-ink-mute">No added preservatives. No artificial colours.</p>
        </div>
      </div>
    </div>
  );
}
