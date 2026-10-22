// Single source of truth for products, combos, and store settings.
// Edit prices, shipping, and the offer end date here.

export const STORE = {
  name: "Tej Organics",
  phone: "9603559603",
  whatsapp: "919603559603",
  city: "Vijayawada",
  address:
    "Flat No 4F1, Ravella Towers, Gosala Street, Ayodhya Nagar, Vijayawada, NTR District, Andhra Pradesh 520003",
  shippingFlat: 70,
  // Combo "Limited Offer" deals end at the close of this day (IST).
  offerEndsISO: "2026-10-28T23:59:59+05:30",
  offerEndsLabel: "28 October",
  registrations: [
    { name: "FSSAI Registered", detail: "Reg. No. 20126132002134" },
    { name: "Certified Organic", detail: "Certificate No. EU/ORG/01333, EU Certification Ltd." },
    { name: "GST Registered", detail: "GSTIN 37BJEPK2125A1ZU" },
    { name: "Udyam (MSME) Registered", detail: "UDYAM-AP-20-0111503" },
  ],
} as const;

export type SizeKey = "1kg" | "500g";

export const SIZES: Record<SizeKey, { label: string; price: number; fill: number }> = {
  "1kg": { label: "1 kg", price: 299, fill: 0.92 },
  "500g": { label: "½ kg", price: 199, fill: 0.55 },
};

export type Texture = "powder" | "paste" | "honey" | "ghee";

export type CategoryKey = "spices" | "pastes" | "honey-ghee" | "wellness";

export const CATEGORIES: Record<CategoryKey, string> = {
  spices: "Spice powders",
  pastes: "Pastes",
  "honey-ghee": "Honey & ghee",
  wellness: "Wellness",
};

export interface Product {
  slug: string;
  name: string;
  telugu: string;
  category: CategoryKey;
  short: string;
  description: string;
  uses: string[];
  fill: string; // jar contents colour
  fillDeep: string; // shading
  tint: string; // tile background
  texture: Texture;
}

export const PRODUCTS: Product[] = [
  {
    slug: "turmeric-powder",
    name: "Turmeric Powder",
    telugu: "పసుపు",
    category: "spices",
    short: "Deep golden pasupu for every dal, curry and pulihora.",
    description:
      "Pure turmeric, ground and packed only after your order comes in, so the colour and aroma reach your kitchen at their brightest. No added colour, nothing mixed in.",
    uses: ["Dals, sambar and rasam", "Curries and stir-fries", "Haldi milk"],
    fill: "#E8A514",
    fillDeep: "#C7820B",
    tint: "#FBE7A1",
    texture: "powder",
  },
  {
    slug: "special-kura-karam",
    name: "Special Kura Karam",
    telugu: "కూర కారం",
    category: "spices",
    short: "The house curry masala that makes everyday kura taste like home.",
    description:
      "Our special curry spice blend, made fresh for each order. One spoon gives vegetable and egg curries their familiar Andhra heat and depth.",
    uses: ["Vegetable curries", "Egg and chicken kura", "Fry and vepudu"],
    fill: "#C9461F",
    fillDeep: "#9E3014",
    tint: "#F8CBB8",
    texture: "powder",
  },
  {
    slug: "red-chilli-powder",
    name: "Red Chilli Powder",
    telugu: "కారం",
    category: "spices",
    short: "Plain red chilli karam with honest heat and colour.",
    description:
      "Pure red chilli powder, ground fresh after you order. It brings bright colour and clean heat to pickles, podis and curries, with no artificial colour.",
    uses: ["Pickles and pachadi", "Curries and gravies", "Tadka and podis"],
    fill: "#B3241C",
    fillDeep: "#861910",
    tint: "#F5C0B9",
    texture: "powder",
  },
  {
    slug: "coriander-powder",
    name: "Coriander Powder",
    telugu: "ధనియాల పొడి",
    category: "spices",
    short: "Fragrant dhaniya powder, ground after you order.",
    description:
      "Coriander seeds ground fresh for your order, so the citrusy aroma stays in the jar and not on a warehouse shelf.",
    uses: ["Curries and gravies", "Rasam and sambar", "Spice rubs"],
    fill: "#B39B5B",
    fillDeep: "#8C7741",
    tint: "#E8E0BD",
    texture: "powder",
  },
  {
    slug: "allam-vellulli-paste",
    name: "Allam Vellulli Paste",
    telugu: "అల్లం వెల్లుల్లి పేస్ట్",
    category: "pastes",
    short: "Fresh ginger-garlic paste, made the day your order comes in.",
    description:
      "Ginger and garlic ground into a thick paste after your order is placed. It saves the daily peeling and pounding without any added preservatives.",
    uses: ["Biryani and pulao", "Curries and gravies", "Marinades"],
    fill: "#D8C690",
    fillDeep: "#B39F65",
    tint: "#EFE6C6",
    texture: "paste",
  },
  {
    slug: "wild-forest-honey",
    name: "Wild Forest Honey",
    telugu: "తేనె",
    category: "honey-ghee",
    short: "Dark, rich forest honey, poured into your jar after you order.",
    description:
      "Wild forest honey, jarred for each order and sent straight to you. Its deep amber flavour suits warm water in the morning or a spoon over ragi malt.",
    uses: ["Warm water and lemon", "Over ragi malt or toast", "In place of sugar"],
    fill: "#B9590E",
    fillDeep: "#7E3606",
    tint: "#F6D3A6",
    texture: "honey",
  },
  {
    slug: "buffalo-ghee",
    name: "Buffalo Ghee",
    telugu: "గేదె నెయ్యి",
    category: "honey-ghee",
    short: "Rich buffalo ghee with the grainy texture of homemade nei.",
    description:
      "Buffalo ghee prepared for your order and packed with care. Add it to hot rice with pappu, use it for sweets, or finish a tadka with it.",
    uses: ["Hot rice and pappu", "Sweets and prasadam", "Tadka"],
    fill: "#F0CF5E",
    fillDeep: "#D2AB33",
    tint: "#FAEDB5",
    texture: "ghee",
  },
  {
    slug: "moringa-wellness-powder",
    name: "Moringa Wellness Powder",
    telugu: "మునగాకు పొడి",
    category: "wellness",
    short: "Green munagaku powder for a daily spoon of goodness.",
    description:
      "Moringa leaf powder, prepared fresh after you order. Stir a spoon into buttermilk, dosa batter, or a podi for rice.",
    uses: ["Buttermilk and smoothies", "Dosa and chapati dough", "Podi for rice"],
    fill: "#7F9A3E",
    fillDeep: "#5D7429",
    tint: "#DCE8BC",
    texture: "powder",
  },
  {
    slug: "sprouted-ragi-powder",
    name: "Sprouted Ragi Powder",
    telugu: "మొలకెత్తిన రాగి పిండి",
    category: "wellness",
    short: "Sprouted ragi flour for malt, java and soft rotis.",
    description:
      "Finger millet, sprouted and milled into fine flour after you order. Use it for ragi java, malt, rotis or sangati.",
    uses: ["Ragi java and malt", "Rotis and dosas", "Ragi sangati"],
    fill: "#A8867F",
    fillDeep: "#7F615B",
    tint: "#EAD7D2",
    texture: "powder",
  },
];

export interface ComboItem {
  slug: string; // product slug
  qty: string; // e.g. "500 g"
}

export interface Combo {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  compareAt?: number;
  items: ComboItem[];
  extras: string[];
  tint: string;
}

export const COMBOS: Combo[] = [
  {
    slug: "daily-nutrition-combo",
    name: "Daily Nutrition Combo",
    tagline: "Healthy choices for a stronger you and your family.",
    price: 999,
    items: [
      { slug: "wild-forest-honey", qty: "500 g" },
      { slug: "moringa-wellness-powder", qty: "500 g" },
      { slug: "sprouted-ragi-powder", qty: "500 g" },
    ],
    extras: ["Free jute bag"],
    tint: "#DCE8BC",
  },
  {
    slug: "daily-essentials-combo",
    name: "Daily Essentials Combo",
    tagline: "Pure spices for a healthier you and your family.",
    price: 999,
    items: [
      { slug: "red-chilli-powder", qty: "500 g" },
      { slug: "turmeric-powder", qty: "500 g" },
      { slug: "coriander-powder", qty: "500 g" },
    ],
    extras: ["Free jute bag"],
    tint: "#FBE7A1",
  },
  {
    slug: "gift-hamper",
    name: "Tej Gift Hamper",
    tagline: "Six fresh jars in a jute tote, ready to gift.",
    price: 999,
    compareAt: 1499,
    items: [
      { slug: "sprouted-ragi-powder", qty: "180 g" },
      { slug: "turmeric-powder", qty: "180 g" },
      { slug: "special-kura-karam", qty: "180 g" },
      { slug: "moringa-wellness-powder", qty: "180 g" },
      { slug: "coriander-powder", qty: "180 g" },
      { slug: "wild-forest-honey", qty: "200 g" },
    ],
    extras: ["Wooden spoon", "Jute tote bag", "Thank-you card"],
    tint: "#F6D3A6",
  },
];

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const getCombo = (slug: string) => COMBOS.find((c) => c.slug === slug);

export const formatINR = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

// Cart line identity and server-side pricing (never trust client prices).
export type CartLine =
  | { kind: "product"; slug: string; size: SizeKey; qty: number }
  | { kind: "combo"; slug: string; qty: number };

export const lineKey = (l: CartLine) =>
  l.kind === "product" ? `p:${l.slug}:${l.size}` : `c:${l.slug}`;

export function priceLine(l: CartLine): { name: string; detail: string; unit: number } | null {
  if (l.kind === "product") {
    const p = getProduct(l.slug);
    const s = SIZES[l.size];
    if (!p || !s) return null;
    return { name: p.name, detail: s.label, unit: s.price };
  }
  const c = getCombo(l.slug);
  if (!c) return null;
  return { name: c.name, detail: `${c.items.length} jars`, unit: c.price };
}

export function totals(lines: CartLine[]) {
  const subtotal = lines.reduce((sum, l) => sum + (priceLine(l)?.unit ?? 0) * l.qty, 0);
  const shipping = lines.length ? STORE.shippingFlat : 0;
  return { subtotal, shipping, total: subtotal + shipping };
}
