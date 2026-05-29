import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireAdminSession } from "@/lib/auth";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 5;

export async function POST(req: Request) {
  try {
    await requireAdminSession();

    const { filename, contentType, folder = "products" } = await req.json();

    if (!ALLOWED_TYPES.includes(contentType)) {
      return Response.json({ error: "只支持 JPEG、PNG、WebP、GIF 格式" }, { status: 400 });
    }

    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    const key = `${folder}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
      ContentLength: undefined,
    });

    const uploadUrl = await getSignedUrl(r2, command, {
      expiresIn: 300,
      signableHeaders: new Set(["content-type"]),
    });

    const publicUrl = `${R2_PUBLIC_URL}/${key}`;

    return Response.json({ uploadUrl, publicUrl, key });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[Presign Error]", error);
    return Response.json(
      { error: !process.env.CLOUDFLARE_R2_ACCOUNT_ID ? "R2 未配置，请添加环境变量" : "服务器错误" },
      { status: 500 }
    );
  }
}
