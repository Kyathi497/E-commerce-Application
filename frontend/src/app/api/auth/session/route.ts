import { currentUser, googleConfigured } from "@/lib/session";
import { toPublic } from "@/lib/users";

export async function GET() {
  const user = await currentUser();
  return Response.json(
    { user: user ? toPublic(user) : null, google: googleConfigured() },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
