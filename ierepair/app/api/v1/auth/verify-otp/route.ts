import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = body as { phone: string; code: string };

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: "Phone and code required" },
        { status: 400 },
      );
    }

    const result = await signIn("otp", {
      phone: phone.replace(/\s/g, ""),
      code,
      redirect: false,
    });

    if (!result || (result as { error?: string }).error) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired code" },
        { status: 401 },
      );
    }

    return NextResponse.json({ success: true, message: "Verified" });
  } catch (err) {
    console.error("[verify-otp]", err);
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
