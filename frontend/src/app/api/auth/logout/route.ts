import { endSession, isJsonRequest } from "@/lib/session";

export async function POST(request: Request) {
  if (!isJsonRequest(request)) return Response.json({ error: "Invalid request." }, { status: 400 });
  await endSession();
  return Response.json({ ok: true });
}
