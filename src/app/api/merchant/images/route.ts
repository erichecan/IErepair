import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant-auth";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";

const MAX_IMAGES = 6;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const session = await requireMerchantSession();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "未找到文件" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "仅支持 JPG / PNG / WebP" }, { status: 400 });
  if (file.size > MAX_SIZE_BYTES) return NextResponse.json({ error: "图片不能超过 5MB" }, { status: 400 });

  const merchant = await prisma.merchant.findUnique({
    where: { id: session.merchantId },
    select: { images: true },
  });
  if (!merchant) return NextResponse.json({ error: "门店不存在" }, { status: 404 });
  if (merchant.images.length >= MAX_IMAGES) {
    return NextResponse.json({ error: `最多上传 ${MAX_IMAGES} 张图片` }, { status: 400 });
  }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const key = `merchants/${session.merchantId}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: file.type,
    CacheControl: "public, max-age=31536000",
  }));

  const url = `${R2_PUBLIC_URL}/${key}`;
  const updated = await prisma.merchant.update({
    where: { id: session.merchantId },
    data: { images: { push: url } },
    select: { images: true },
  });

  return NextResponse.json({ images: updated.images });
}

export async function DELETE(req: NextRequest) {
  const session = await requireMerchantSession();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const { url } = await req.json() as { url: string };
  if (!url) return NextResponse.json({ error: "缺少 url" }, { status: 400 });

  const merchant = await prisma.merchant.findUnique({
    where: { id: session.merchantId },
    select: { images: true },
  });
  if (!merchant) return NextResponse.json({ error: "门店不存在" }, { status: 404 });
  if (!merchant.images.includes(url)) return NextResponse.json({ error: "图片不属于此门店" }, { status: 403 });

  const key = url.replace(`${R2_PUBLIC_URL}/`, "");
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  } catch {
    // R2 deletion failure is non-fatal — remove from DB regardless
  }

  const updated = await prisma.merchant.update({
    where: { id: session.merchantId },
    data: { images: merchant.images.filter((i) => i !== url) },
    select: { images: true },
  });

  return NextResponse.json({ images: updated.images });
}
