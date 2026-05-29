import { cookies } from "next/headers";
import { MERCHANT_COOKIE_NAME } from "@/lib/merchant-auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(MERCHANT_COOKIE_NAME);
  return Response.json({ ok: true });
}
