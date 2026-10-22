import Link from "next/link";
import { STORE } from "@/lib/catalog";

export function OfferStrip() {
  return (
    <div className="bg-leaf-950 text-[13px] text-leaf-100">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-x-5 px-4 py-2 text-center">
        <p>
          <span className="font-semibold text-turmeric-300">₹999 combos</span> until {STORE.offerEndsLabel}
          <span className="hidden sm:inline">
            {" · "}Flat ₹{STORE.shippingFlat} shipping on every order
          </span>
        </p>
        <Link href="/combos" className="hidden font-semibold text-white underline md:inline">
          See combos
        </Link>
      </div>
    </div>
  );
}
