import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

export async function uploadFile(
  file: Buffer,
  mimeType: string,
  folder: "products" | "merchants" | "misc",
): Promise<string> {
  const ext = mimeType.split("/")[1] ?? "bin";
  const filename = `${folder}/${randomUUID()}.${ext}`;
  const blob = bucket.file(filename);

  await blob.save(file, {
    contentType: mimeType,
    metadata: { cacheControl: "public, max-age=31536000" },
  });

  return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filename}`;
}

export async function deleteFile(publicUrl: string): Promise<void> {
  const filename = publicUrl.split(
    `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/`,
  )[1];
  if (!filename) return;
  await bucket.file(filename).delete({ ignoreNotFound: true });
}
