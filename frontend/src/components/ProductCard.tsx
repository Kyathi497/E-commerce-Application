"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { formatINR, type Product, SIZES, type SizeKey } from "@/lib/catalog";
import { Jar } from "./Jar";
import { useCart } from "./cart/CartProvider";

export function SizePicker({
  value,
  onChange,
  name,
  large = false,
}: {
  value: SizeKey;
  onChange: (s: SizeKey) => void;
  name: string;
  large?: boolean;
}) {
  return (
    <fieldset className="flex gap-2">
      <legend className="sr-only">Choose size</legend>
      {(Object.keys(SIZES) as SizeKey[]).map((key) => {
        const s = SIZES[key];
        const checked = value === key;
        return (
          <label
            key={key}
            className={`flex flex-1 cursor-pointer flex-col items-center rounded-xl border-2 text-center transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-leaf-700 ${
              large ? "py-3" : "py-2"
            } ${checked ? "border-leaf-800 bg-leaf-50 text-leaf-950" : "border-line bg-white text-ink-soft hover:border-leaf-200"}`}
          >
            <input
              type="radio"
              name={name}
              value={key}
              checked={checked}
              onChange={() => onChange(key)}
              className="sr-only"
            />
            <span className={`font-semibold leading-tight ${large ? "text-[17px]" : "text-[15px]"}`}>{s.label}</span>
            <span className={`tabular leading-tight ${large ? "text-[15px]" : "text-[13px]"}`}>{formatINR(s.price)}</span>
          </label>
        );
      })}
    </fieldset>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const [size, setSize] = useState<SizeKey>("1kg");
  const { add } = useCart();
  const name = useId();
  const href = `/products/${product.slug}`;

  return (
    <article className="group flex flex-col">
      <Link
        href={href}
        className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[22px] transition-[filter] group-hover:brightness-[1.02]"
        style={{ background: product.tint }}
        tabIndex={-1}
        aria-hidden
      >
        <Jar
          fill={product.fill}
          fillDeep={product.fillDeep}
          texture={product.texture}
          level={SIZES[size].fill}
          className="w-[64%] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1.5"
        />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-semibold text-leaf-900 sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[12px]">
          Made after you order
        </span>
      </Link>

      <div className="flex flex-1 flex-col pt-3 sm:pt-4">
        <h3 className="font-display text-[17px] font-bold leading-tight text-ink sm:text-[19px]">
          <Link href={href} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <p lang="te" className="mt-0.5 font-telugu text-[14px] text-ink-mute">
          {product.telugu}
        </p>
        <p className="mt-2 hidden text-[15px] leading-snug text-ink-soft sm:block">{product.short}</p>
        <div className="mt-auto pt-3 sm:pt-4">
          <SizePicker value={size} onChange={setSize} name={name} />
          <button
            type="button"
            onClick={() => add({ kind: "product", slug: product.slug, size, qty: 1 })}
            aria-label={`Add ${SIZES[size].label} ${product.name} to cart, ${formatINR(SIZES[size].price)}`}
            className="mt-2.5 flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-leaf-800 text-[15px] font-semibold text-white transition-colors hover:bg-leaf-900 active:scale-[0.99] sm:h-12 sm:gap-2 sm:text-base"
          >
            <Plus className="size-[18px]" aria-hidden />
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">
              Add {SIZES[size].label} · {formatINR(SIZES[size].price)}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
