import { createHmac, timingSafeEqual } from "node:crypto";

// Verifies the signature Razorpay Checkout returns after a successful payment.
export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return Response.json({ verified: false, error: "Payments are not configured." }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ verified: false, error: "Invalid request." }, { status: 400 });
  }

  const orderId = body.razorpay_order_id;
  const paymentId = body.razorpay_payment_id;
  const signature = body.razorpay_signature;
  if (typeof orderId !== "string" || typeof paymentId !== "string" || typeof signature !== "string") {
    return Response.json({ verified: false, error: "Missing payment details." }, { status: 400 });
  }

  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  const verified = a.length === b.length && timingSafeEqual(a, b);

  return Response.json({ verified, paymentId: verified ? paymentId : undefined }, { status: verified ? 200 : 400 });
}
