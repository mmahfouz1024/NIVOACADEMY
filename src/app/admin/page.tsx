import Link from "next/link";
import { BookOpen, Clock3, GraduationCap, TrendingUp, Users, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate, formatMoney, formatNumber } from "@/lib/utils";
import { TOPUP_METHODS } from "@/lib/constants";

export default async function AdminHome() {
  const [users, courses, enrollments, pending, revenue, topups, recentEnrollments] = await Promise.all([
    db.user.count({ where: { role: "STUDENT" } }),
    db.course.count(),
    db.enrollment.count(),
    db.topupRequest.count({ where: { status: "PENDING" } }),
    db.enrollment.aggregate({ _sum: { pricePaid: true } }),
    db.topupRequest.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" }, take: 6, include: { user: { select: { name: true } } } }),
    db.enrollment.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { user: { select: { name: true } }, course: { select: { title: true } } } }),
  ]);

  const stats = [
    { label: "الطلاب", value: formatNumber(users), Icon: Users, tone: "bg-navy-50 text-navy-700" },
    { label: "الكورسات", value: formatNumber(courses), Icon: BookOpen, tone: "bg-violet-50 text-violet-600" },
    { label: "الاشتراكات", value: formatNumber(enrollments), Icon: GraduationCap, tone: "bg-emerald-50 text-emerald-600" },
    { label: "إجمالي المبيعات", value: formatMoney(revenue._sum.pricePaid ?? 0), Icon: TrendingUp, tone: "bg-gold-100 text-gold-700" },
    { label: "طلبات شحن معلّقة", value: formatNumber(pending), Icon: Wallet, tone: pending ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl">نظرة عامة</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map(({ label, value, Icon, tone }) => (
          <div key={label} className="card p-5">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
            <div className="mt-3 text-2xl font-black text-navy-900">{value}</div>
            <div className="text-xs font-semibold text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="flex items-center gap-2 text-lg"><Clock3 className="h-5 w-5 text-amber-500" />طلبات شحن تنتظر المراجعة</h2>
            <Link href="/admin/topups" className="text-sm font-bold text-navy-600 hover:underline">عرض الكل</Link>
          </div>
          {topups.length === 0 ? (
            <p className="p-8 text-center text-slate-500">لا توجد طلبات معلّقة 🎉</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {topups.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                  <div>
                    <div className="font-bold text-navy-900">{t.user.name}</div>
                    <div className="text-xs text-slate-500">{TOPUP_METHODS[t.method]} · {formatDate(t.createdAt)}</div>
                  </div>
                  <div className="font-black text-navy-800">{formatMoney(t.amount)}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="border-b border-slate-100 p-5"><h2 className="text-lg">آخر الاشتراكات</h2></div>
          {recentEnrollments.length === 0 ? (
            <p className="p-8 text-center text-slate-500">لا توجد اشتراكات بعد.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentEnrollments.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                  <div>
                    <div className="font-bold text-navy-900">{e.user.name}</div>
                    <div className="line-clamp-1 text-xs text-slate-500">{e.course.title}</div>
                  </div>
                  <div className="text-xs text-slate-500">{formatDate(e.createdAt)}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
