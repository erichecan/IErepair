import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { merchants } from "@/lib/db/schema/merchants";
import { uploadFile, deleteFile } from "@/lib/storage";
import { eq } from "drizzle-orm";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "merchant") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const kind = formData.get("kind"); // "logo" | "cover"

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "Missing file" }, { status: 400 });
  }
  if (kind !== "logo" && kind !== "cover") {
    return NextResponse.json({ success: false, error: "kind must be logo or cover" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ success: false, error: "Only JPEG, PNG, WEBP allowed" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ success: false, error: "File exceeds 5 MB limit" }, { status: 400 });
  }

  try {
    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.id, session.user.merchantId!),
      columns: { logoUrl: true, coverUrl: true },
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadFile(buffer, file.type, "merchants");

    const field = kind === "logo" ? "logoUrl" : "coverUrl";
    const oldUrl = merchant?.[field] ?? null;

    await db
      .update(merchants)
      .set({ [field]: publicUrl, updatedAt: new Date() })
      .where(eq(merchants.id, session.user.merchantId!));

    if (oldUrl) {
      deleteFile(oldUrl).catch(() => {});
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("[merchant/upload] error", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
