import fs from "node:fs";
import zlib from "node:zlib";

const raw = fs.readFileSync("prisma/dev.db");
const b64 = zlib.gzipSync(raw, { level: 9 }).toString("base64");
fs.writeFileSync(
  "src/lib/seed-snapshot.ts",
  `// Auto-generated pre-seeded SQLite snapshot (gzipped base64) for serverless/Vercel zero-config boot\nexport const SEED_DB_GZ_B64 = "${b64}";\n`
);
console.log("Wrote src/lib/seed-snapshot.ts", b64.length, "chars");
