import type { Metadata } from "next";
import { COMBOS, STORE } from "@/lib/catalog";
import { ComboCard } from "@/components/ComboCard";

export const metadata: Metadata = {
  title: "₹999 combos",
  description: "Daily Nutrition, Daily Essentials and the Tej Gift Hamper, ₹999 each for a limited time.",
};

export default function CombosPage() {
  return (
    <div className="bg-leaf-800 pb-20 text-white">
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:pt-14">
        <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
          Combos at <span className="text-turmeric-300">₹999</span>
        </h1>
        <p className="mt-3 max-w-[60ch] text-[17px] text-leaf-100">
          Limited offer until {STORE.offerEndsLabel}. Each combo is prepared fresh after you order, with a free jute bag.
          Flat ₹{STORE.shippingFlat} shipping.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {COMBOS.map((c) => (
            <ComboCard key={c.slug} combo={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
