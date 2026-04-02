import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password required" },
        { status: 400 },
      );
    }

    const result = await signIn("admin", { email, password, redirect: false });

    if (!result || (result as { error?: string }).error) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/login]", err);
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 });
  }
}
