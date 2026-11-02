import sharp from "sharp";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const dir = path.resolve("logo");
const files = (await readdir(dir)).filter((f) => /\.(jpe?g|png)$/i.test(f) && !f.startsWith("nivo-"));
if (!files.length) throw new Error("No source logo found in /logo");
const src = path.join(dir, files[0]);

const meta = await sharp(src).metadata();
const size = Math.min(meta.width, meta.height);
const r = Math.round(size * 0.495);
const mask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="#fff"/></svg>`
);

// Apply the circular mask first, then derive every size from the masked buffer
// (sharp applies resize before composite inside one pipeline).
const masked = await sharp(src)
  .resize(size, size, { fit: "cover" })
  .ensureAlpha()
  .composite([{ input: mask, blend: "dest-in" }])
  .png()
  .toBuffer();
const base = sharp(masked);

const pub = path.resolve("public");
await mkdir(pub, { recursive: true });

await base.clone().resize(512, 512).png({ compressionLevel: 9 }).toFile(path.join(pub, "logo.png"));
await base.clone().resize(1024, 1024).webp({ quality: 92 }).toFile(path.join(pub, "logo-large.webp"));
await base.clone().resize(192, 192).png().toFile(path.join(pub, "icon-192.png"));
await base.clone().resize(512, 512).png().toFile(path.join(pub, "icon-512.png"));
await base.clone().resize(180, 180).png().toFile(path.join(pub, "apple-touch-icon.png"));
await base.clone().resize(64, 64).png().toFile(path.join(pub, "favicon.png"));

// Social share image (1200x630) – navy background with logo.
const og = await base.clone().resize(460, 460).png().toBuffer();
await sharp({
  create: { width: 1200, height: 630, channels: 4, background: "#071d4d" },
})
  .composite([{ input: og, left: 370, top: 85 }])
  .png()
  .toFile(path.join(pub, "og.png"));

console.log("Logo assets generated in /public from", files[0]);
