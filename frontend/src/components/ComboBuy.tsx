"use client";

import { ShoppingBag } from "lucide-react";
import { type Combo, formatINR } from "@/lib/catalog";
import { useCart } from "./cart/CartProvider";

export function ComboBuy({ combo }: { combo: Combo }) {
  const { add } = useCart();
  return (
    <button
      type="button"
      onClick={() => add({ kind: "combo", slug: combo.slug, qty: 1 })}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-turmeric-500 text-[17px] font-bold text-leaf-950 transition-colors hover:bg-turmeric-600"
    >
      <ShoppingBag className="size-5" aria-hidden />
      Add combo · {formatINR(combo.price)}
    </button>
  );
}
