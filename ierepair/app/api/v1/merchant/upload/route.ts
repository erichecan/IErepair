import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { merchants } from "@/lib/db/schema/merchants";
import { uploadFile, deleteFile } from "@/lib/storage";
import { eq } from "drizzle-orm";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function isSupportedImageBuffer(buf: Buffer): boolean {
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  // PNG: 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
  // WEBP: RIFF....WEBP
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return true;
  return false;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "merchant") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (!session.user.merchantId) {
    return NextResponse.json({ success: false, error: "Merchant profile not found" }, { status: 403 });
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
  // Fast-reject on client-reported size before reading the full buffer
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ success: false, error: "File exceeds 5 MB limit" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Authoritative size check against the actual buffer
    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ success: false, error: "File exceeds 5 MB limit" }, { status: 400 });
    }
    // Magic-byte validation — not trusting client-supplied Content-Type
    if (!isSupportedImageBuffer(buffer)) {
      return NextResponse.json({ success: false, error: "File content does not match a supported image format" }, { status: 400 });
    }

    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.id, session.user.merchantId),
      columns: { logoUrl: true, coverUrl: true },
    });

    const publicUrl = await uploadFile(buffer, file.type, "merchants");
    const field = kind === "logo" ? "logoUrl" : "coverUrl";
    const oldUrl = merchant?.[field] ?? null;

    try {
      await db
        .update(merchants)
        .set({ [field]: publicUrl, updatedAt: new Date() })
        .where(eq(merchants.id, session.user.merchantId));
    } catch (dbErr) {
      // Roll back the GCS upload so we don't leak orphaned objects
      deleteFile(publicUrl).catch(() => {});
      throw dbErr;
    }

    if (oldUrl) {
      deleteFile(oldUrl).catch(() => {});
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("[merchant/upload] error", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
