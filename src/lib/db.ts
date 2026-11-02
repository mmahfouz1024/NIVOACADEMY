import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { PrismaClient } from "@prisma/client";
import { SEED_DB_GZ_B64 } from "./seed-snapshot";

function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL?.trim();
  const isVercel = Boolean(process.env.VERCEL);

  let url = envUrl || (isVercel ? "file:/tmp/nivo.db" : "file:./dev.db");
  if (isVercel && url.startsWith("file:./")) {
    url = "file:/tmp/nivo.db";
  }

  if (url.startsWith("file:")) {
    const rawPath = url.slice("file:".length);
    const dbPath = path.isAbsolute(rawPath)
      ? rawPath
      : path.resolve(process.cwd(), "prisma", rawPath);

    try {
      const exists = fs.existsSync(dbPath) && fs.statSync(dbPath).size > 0;
      if (!exists) {
        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
        const buf = zlib.gunzipSync(Buffer.from(SEED_DB_GZ_B64, "base64"));
        fs.writeFileSync(dbPath, buf);
      }
    } catch (err) {
      console.error("Failed to initialize SQLite snapshot:", err);
    }
  }

  process.env.DATABASE_URL = url;
  return url;
}

const dbUrl = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: dbUrl } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
