# Tej Organics storefront

Next.js 16 (App Router) + Tailwind CSS v4 store for Tej Organics: freshly prepared after every order, packed with care and sent straight to you.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production
```

## Go live with Razorpay

1. Copy `.env.example` to `.env.local`.
2. Paste your keys from the Razorpay Dashboard (Account & Settings → API Keys):

   ```
   RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   ```
3. Restart the server.

Without keys the store runs in **test mode**. Checkout shows a clearly labelled "Simulate successful payment" button and no money moves.

Every paid order appears in the Razorpay Dashboard → Orders/Payments. The customer's name, phone, delivery address and item list are attached as **notes** on the order, so you have everything needed to prepare and ship it. Prices are always recalculated on the server, so a customer can't change them in the browser.

## Where to edit things

| What | File |
| --- | --- |
| Prices (1 kg ₹299, ½ kg ₹199), shipping (₹70), offer end date, phone, address, registrations | `src/lib/catalog.ts` (`STORE`, `SIZES`) |
| Products, descriptions, Telugu names, colours | `src/lib/catalog.ts` (`PRODUCTS`) |
| Combos and their contents | `src/lib/catalog.ts` (`COMBOS`) |
| Logo badge | `src/components/BadgeLogo.tsx` |
| Product jar artwork | `src/components/Jar.tsx` |

## Still to supply

- **Real product photos.** The jars are drawn in code and labelled "Illustration". Add photos to `public/products/` and render them with `next/image` in `ProductCard`, `ProductBuy` and `ComboArt`.
- **The official badge logo** (the namaste-child artwork) as a clean PNG or SVG. Put it at `public/brand/tej-badge.png` and swap it into `BadgeLogo.tsx`.
- **Razorpay keys** (see above).
