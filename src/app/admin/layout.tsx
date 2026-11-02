import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/AdminNav";

export const metadata: Metadata = { title: { default: "لوحة الإدارة", template: "%s | الإدارة" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const pending = await db.topupRequest.count({ where: { status: "PENDING" } });
  return (
    <div className="min-h-screen bg-slate-100">
      <AdminNav pending={pending} />
      <main className="min-h-screen p-4 pt-16 sm:p-8 lg:ms-72 lg:pt-8">{children}</main>
    </div>
  );
}
