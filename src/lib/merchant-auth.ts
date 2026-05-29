import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production"
);

const COOKIE_NAME = "merchant_token";

export async function signMerchantToken(payload: { merchantId: number; email: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyMerchantToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { merchantId: number; email: string };
}

export async function getMerchantSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifyMerchantToken(token);
  } catch {
    return null;
  }
}

export async function requireMerchantSession() {
  const session = await getMerchantSession();
  if (!session) {
    throw new Response(JSON.stringify({ error: "未授权" }), { status: 401 });
  }
  return session;
}

export { COOKIE_NAME as MERCHANT_COOKIE_NAME };
