import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { db } from "@/lib/db";
import { cn, formatDate, formatMoney, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "المستخدمون" };

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const term = q.trim().slice(0, 60);
  const users = await db.user.findMany({
    where: term ? { OR: [{ name: { contains: term } }, { email: { contains: term } }, { phone: { contains: term } }] } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { enrollments: true } } },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">المستخدمون</h1>
      <form className="flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input name="q" defaultValue={term} placeholder="بحث بالاسم أو البريد أو الهاتف" className="input ps-10" />
        </div>
        <button className="btn-navy">بحث</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="table-x">
          <thead><tr><th>الاسم</th><th>البريد</th><th>الهاتف</th><th>الرصيد</th><th>الاشتراكات</th><th>التسجيل</th><th>الحالة</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td><Link href={`/admin/users/${u.id}`} className="font-bold text-navy-800 hover:underline">{u.name}</Link>{u.role === "ADMIN" && <span className="badge ms-2 bg-navy-800 text-white">أدمن</span>}</td>
                <td dir="ltr" className="text-end">{u.email}</td>
                <td dir="ltr" className="text-end">{u.phone}</td>
                <td className="font-bold">{formatMoney(u.balance)}</td>
                <td>{formatNumber(u._count.enrollments)}</td>
                <td className="whitespace-nowrap">{formatDate(u.createdAt)}</td>
                <td><span className={cn("badge", u.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>{u.active ? "نشط" : "موقوف"}</span></td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-slate-500">لا يوجد مستخدمون.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
