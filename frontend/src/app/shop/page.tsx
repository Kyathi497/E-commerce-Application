import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CATEGORIES, type CategoryKey, PRODUCTS } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Shop all products",
  description: "Turmeric, spice powders, ginger-garlic paste, honey, ghee, moringa and ragi, freshly prepared after every order.",
};

export default function ShopPage(props: PageProps<"/shop">) {
  return (
    <Suspense fallback={<ShopView active={null} />}>
      <FilteredShop searchParams={props.searchParams} />
    </Suspense>
  );
}

async function FilteredShop({ searchParams }: { searchParams: PageProps<"/shop">["searchParams"] }) {
  const { category } = await searchParams;
  const active = typeof category === "string" && category in CATEGORIES ? (category as CategoryKey) : null;
  return <ShopView active={active} />;
}

function ShopView({ active }: { active: CategoryKey | null }) {
  const products = active ? PRODUCTS.filter((p) => p.category === active) : PRODUCTS;

  const chip = (selected: boolean) =>
    `rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${
      selected ? "bg-leaf-800 text-white" : "border border-line text-ink-soft hover:border-leaf-700 hover:text-leaf-900"
    }`;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:pt-14">
      <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-leaf-900 sm:text-5xl">
        {active ? CATEGORIES[active] : "Shop all products"}
      </h1>
      <p className="mt-3 max-w-[60ch] text-[17px] text-ink-soft">
        Every product is ₹299 for 1 kg or ₹199 for ½ kg, prepared after you order. Flat ₹70 shipping per order.
      </p>

      <nav aria-label="Filter by category" className="mt-8 flex flex-wrap gap-2">
        <Link href="/shop" className={chip(!active)} aria-current={!active ? "page" : undefined}>
          All ({PRODUCTS.length})
        </Link>
        {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => (
          <Link
            key={key}
            href={`/shop?category=${key}`}
            className={chip(active === key)}
            aria-current={active === key ? "page" : undefined}
          >
            {CATEGORIES[key]} ({PRODUCTS.filter((p) => p.category === key).length})
          </Link>
        ))}
        <Link href="/combos" className={chip(false)}>
          ₹999 combos
        </Link>
      </nav>

      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
