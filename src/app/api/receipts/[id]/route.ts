import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { readReceipt } from "@/lib/storage";

export const dynamic = "force-dynamic";

/** Receipts are private: only the owner or an admin may view them. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const topup = await db.topupRequest.findUnique({
    where: { id },
    select: { userId: true, receiptPath: true },
  });
  if (!topup || (topup.userId !== user.id && user.role !== "ADMIN")) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const { buf, mime } = await readReceipt(topup.receiptPath);
    const headers: Record<string, string> = {
      "Content-Type": mime,
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    };
    if (mime.startsWith("image/")) headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'";
    return new NextResponse(new Uint8Array(buf), { headers });
  } catch {
    return new NextResponse("File missing", { status: 404 });
  }
}
