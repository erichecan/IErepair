import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production"
);

const COOKIE_NAME = "admin_token";

export async function signAdminToken(payload: { adminId: number; email: string; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { adminId: number; email: string; role: string };
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifyAdminToken(token);
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    throw new Response(JSON.stringify({ error: "未授权" }), { status: 401 });
  }
  return session;
}

export { COOKIE_NAME };
