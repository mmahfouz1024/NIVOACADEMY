import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { MAX_RECEIPT_BYTES } from "./constants";

export function storageRoot() {
  return path.resolve(process.env.STORAGE_DIR || "./storage");
}

type Detected = { ext: string; mime: string } | null;

/** Detect file type from magic bytes (never trust the client-provided type). */
function detect(buf: Buffer): Detected {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return { ext: "png", mime: "image/png" };
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP")
    return { ext: "webp", mime: "image/webp" };
  if (buf.subarray(0, 4).toString("ascii") === "%PDF") return { ext: "pdf", mime: "application/pdf" };
  return null;
}

export type SavedReceipt = { path: string; hash: string };

export async function saveReceipt(file: File): Promise<SavedReceipt> {
  if (file.size === 0) throw new Error("ارفع صورة إيصال التحويل");
  if (file.size > MAX_RECEIPT_BYTES) throw new Error("حجم الملف كبير جدًا (الحد الأقصى 5 ميجا)");
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = detect(buf);
  if (!kind) throw new Error("نوع الملف غير مدعوم. ارفع صورة (JPG / PNG / WEBP) أو PDF");

  const hash = createHash("sha256").update(buf).digest("hex");
  const dir = path.join(storageRoot(), "receipts");
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${kind.ext}`;
  await writeFile(path.join(dir, name), buf);
  return { path: `receipts/${name}`, hash };
}

export async function readReceipt(relPath: string) {
  const root = storageRoot();
  const full = path.resolve(root, relPath);
  if (!full.startsWith(root + path.sep)) throw new Error("invalid path");
  const buf = await readFile(full);
  const kind = detect(buf);
  return { buf, mime: kind?.mime ?? "application/octet-stream" };
}
