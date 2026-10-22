"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { type CartLine, formatINR, getCombo, getProduct, lineKey, priceLine, SIZES } from "@/lib/catalog";
import { Jar } from "../Jar";
import { ComboArt } from "../ComboArt";
import { useCart } from "./CartProvider";

export function LineVisual({ line, className }: { line: CartLine; className?: string }) {
  if (line.kind === "product") {
    const p = getProduct(line.slug)!;
    return (
      <div className={`grid place-items-center rounded-xl ${className}`} style={{ background: p.tint }}>
        <Jar fill={p.fill} fillDeep={p.fillDeep} texture={p.texture} level={SIZES[line.size].fill} label={false} className="h-[86%]" />
      </div>
    );
  }
  const c = getCombo(line.slug)!;
  return (
    <div className={`overflow-hidden rounded-xl p-1.5 ${className}`} style={{ background: c.tint }}>
      <ComboArt combo={c} className="size-full" />
    </div>
  );
}

export function LineItem({ line, compact = false }: { line: CartLine; compact?: boolean }) {
  const { setQty, remove } = useCart();
  const info = priceLine(line);
  if (!info) return null;
  const key = lineKey(line);
  const href = line.kind === "product" ? `/products/${line.slug}` : `/combos/${line.slug}`;

  return (
    <li className="flex gap-4 py-4">
      <LineVisual line={line} className={compact ? "size-20 shrink-0" : "size-24 shrink-0"} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={href} className="font-semibold leading-snug text-ink hover:underline">
              {info.name}
            </Link>
            <p className="text-sm text-ink-mute">
              {info.detail} · {formatINR(info.unit)} each
            </p>
          </div>
          <p className="tabular shrink-0 font-semibold">{formatINR(info.unit * line.qty)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center rounded-full border border-line">
            <button
              type="button"
              onClick={() => setQty(key, line.qty - 1)}
              className="grid size-9 place-items-center rounded-full text-leaf-900 hover:bg-leaf-50"
              aria-label={`Decrease quantity of ${info.name}`}
            >
              <Minus className="size-4" aria-hidden />
            </button>
            <span className="tabular w-7 text-center text-[15px] font-semibold" aria-live="polite">
              {line.qty}
            </span>
            <button
              type="button"
              onClick={() => setQty(key, line.qty + 1)}
              disabled={line.qty >= 20}
              className="grid size-9 place-items-center rounded-full text-leaf-900 hover:bg-leaf-50 disabled:opacity-40"
              aria-label={`Increase quantity of ${info.name}`}
            >
              <Plus className="size-4" aria-hidden />
            </button>
          </div>
          <button
            type="button"
            onClick={() => remove(key)}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm text-ink-mute hover:bg-chilli-100 hover:text-chilli-700"
          >
            <Trash2 className="size-4" aria-hidden />
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
