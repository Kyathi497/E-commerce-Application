import { orderTotals, razorpayNotes, sanitizeLines, summarize, validateCustomer } from "@/lib/order";
import { currentUser } from "@/lib/session";
import { saveDetails } from "@/lib/users";

// Creates a Razorpay order from a server-priced cart.
// Without RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET the store runs in test mode:
// no money moves and the client shows a clearly labelled simulated payment.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const lines = sanitizeLines(body.lines);
  if (!lines) return Response.json({ error: "Your cart has an item we couldn't recognise. Please refresh and try again." }, { status: 400 });

  const { customer, errors } = validateCustomer(body.customer);
  if (!customer) return Response.json({ error: "Please check the highlighted fields.", fields: errors }, { status: 422 });

  // Logged-in customers get these details filled in next time.
  const user = await currentUser();
  if (user) await saveDetails(user.id, customer);

  const { subtotal, shipping, total } = orderTotals(lines);
  const receipt = `tej_${Date.now().toString(36)}`;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return Response.json({
      mode: "test",
      orderId: `test_${receipt}`,
      receipt,
      amount: total * 100,
      subtotal,
      shipping,
      total,
      summary: summarize(lines),
    });
  }

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
    },
    body: JSON.stringify({
      amount: total * 100,
      currency: "INR",
      receipt,
      notes: razorpayNotes(lines, customer),
    }),
  });

  if (!res.ok) {
    console.error("Razorpay order failed", res.status, await res.text());
    return Response.json(
      { error: "We couldn't start the payment just now. Please try again in a minute, or order on WhatsApp." },
      { status: 502 },
    );
  }

  const order = (await res.json()) as { id: string; amount: number };
  return Response.json({
    mode: "live",
    keyId,
    orderId: order.id,
    receipt,
    amount: order.amount,
    subtotal,
    shipping,
    total,
    summary: summarize(lines),
  });
}
