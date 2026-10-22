import "server-only";
import { type CartLine, getCombo, getProduct, priceLine, SIZES, totals } from "./catalog";

export interface Customer {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export function sanitizeLines(input: unknown): CartLine[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > 40) return null;
  const out: CartLine[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    const qty = Number(r.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) return null;
    if (r.kind === "product" && typeof r.slug === "string" && typeof r.size === "string") {
      if (!getProduct(r.slug) || !(r.size in SIZES)) return null;
      out.push({ kind: "product", slug: r.slug, size: r.size as keyof typeof SIZES, qty });
    } else if (r.kind === "combo" && typeof r.slug === "string") {
      if (!getCombo(r.slug)) return null;
      out.push({ kind: "combo", slug: r.slug, qty });
    } else return null;
  }
  return out;
}

export function validateCustomer(input: unknown): { customer?: Customer; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const r = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const s = (k: string) => (typeof r[k] === "string" ? (r[k] as string).trim() : "");
  const c: Customer = {
    name: s("name"),
    phone: s("phone").replace(/[\s-]/g, "").replace(/^\+?91/, ""),
    email: s("email") || undefined,
    address: s("address"),
    city: s("city"),
    state: s("state"),
    pincode: s("pincode"),
  };
  if (c.name.length < 2) errors.name = "Enter your full name.";
  if (!/^[6-9]\d{9}$/.test(c.phone)) errors.phone = "Enter a 10-digit Indian mobile number.";
  if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) errors.email = "Check the email address.";
  if (c.address.length < 8) errors.address = "Enter house number, street and area.";
  if (c.city.length < 2) errors.city = "Enter your city or town.";
  if (c.state.length < 2) errors.state = "Enter your state.";
  if (!/^[1-9]\d{5}$/.test(c.pincode)) errors.pincode = "Enter a 6-digit PIN code.";
  return Object.keys(errors).length ? { errors } : { customer: c, errors };
}

export function summarize(lines: CartLine[]) {
  return lines
    .map((l) => {
      const p = priceLine(l)!;
      return `${l.qty}x ${p.name} (${p.detail})`;
    })
    .join("; ");
}

export function orderTotals(lines: CartLine[]) {
  return totals(lines);
}

// Razorpay notes: max 15 keys, 256 chars each. The owner sees these in the dashboard.
export function razorpayNotes(lines: CartLine[], c: Customer) {
  const items = summarize(lines);
  const notes: Record<string, string> = {
    name: c.name,
    phone: c.phone,
    address: `${c.address}, ${c.city}, ${c.state} ${c.pincode}`.slice(0, 256),
  };
  if (c.email) notes.email = c.email;
  for (let i = 0; i * 250 < items.length && i < 8; i++) {
    notes[`items_${i + 1}`] = items.slice(i * 250, (i + 1) * 250);
  }
  return notes;
}
