import type { Metadata } from "next";
import Link from "next/link";
import { Award, BookOpen, CheckCircle2, ArrowLeft, Radio, Wallet, CalendarClock, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getEnrolledCourses } from "@/lib/progress";
import { EnrolledCard } from "@/components/EnrolledCard";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "لوحة التحكم" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const enrolled = await getEnrolledCourses(user.id);
  const ids = enrolled.map((e) => e.course.id);
  const [live, pending] = await Promise.all([
    db.liveSession.findMany({
      where: {
        published: true,
        startsAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
        OR: [{ courseId: { in: ids } }, { courseId: null }],
      },
      orderBy: { startsAt: "asc" },
      take: 4,
      include: { course: { select: { title: true } } },
    }),
    db.topupRequest.count({ where: { userId: user.id, status: "PENDING" } }),
  ]);

  const inProgress = enrolled.filter((e) => e.percent < 100);
  const completed = enrolled.filter((e) => e.percent === 100).length;
  const certificates = enrolled.filter((e) => e.certificateCode).length;

  const stats = [
    { label: "رصيد المحفظة", value: formatMoney(user.balance), Icon: Wallet, tone: "bg-gold-100 text-gold-700" },
    { label: "كورساتي", value: formatNumber(enrolled.length), Icon: BookOpen, tone: "bg-navy-50 text-navy-700" },
    { label: "كورسات مكتملة", value: formatNumber(completed), Icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
    { label: "الشهادات", value: formatNumber(certificates), Icon: Award, tone: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, Icon, tone }) => (
          <div key={label} className="card flex items-center gap-4 p-5">
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}><Icon className="h-6 w-6" /></span>
            <div>
              <div className="text-xl font-black text-navy-900">{value}</div>
              <div className="text-xs font-semibold text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {pending > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          لديك {formatNumber(pending)} طلب شحن قيد المراجعة. سيتم إضافة الرصيد فور قبوله.{" "}
          <Link href="/wallet" className="underline">عرض الطلبات</Link>
        </div>
      )}

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl">تابع من حيث توقفت</h2>
          <Link href="/my-courses" className="text-sm font-bold text-navy-600 hover:underline">كل كورساتي</Link>
        </div>
        {inProgress.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 py-14 text-center">
            <BookOpen className="h-12 w-12 text-slate-300" />
            <p className="font-bold text-slate-600">{enrolled.length ? "أنهيت كل كورساتك. ابدأ كورسًا جديدًا!" : "لم تشترك في أي كورس بعد."}</p>
            <Link href="/courses" className="btn-gold">تصفح الكورسات <ArrowLeft className="h-4 w-4" /></Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.slice(0, 3).map((e) => <EnrolledCard key={e.enrollmentId} e={e} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-5 flex items-center gap-2 text-2xl"><Radio className="h-6 w-6 text-red-500" />محاضراتي المباشرة القادمة</h2>
        {live.length === 0 ? (
          <p className="card p-6 text-slate-500">لا توجد محاضرات مباشرة قادمة.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {live.map((s) => (
              <div key={s.id} className="card flex items-center justify-between gap-4 p-5">
                <div>
                  <div className="font-extrabold text-navy-900">{s.title}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><CalendarClock className="h-4 w-4" />{formatDateTime(s.startsAt)}</div>
                  {s.course && <div className="mt-0.5 text-xs font-bold text-gold-700">{s.course.title}</div>}
                </div>
                {s.joinUrl && (
                  <a href={s.joinUrl} target="_blank" rel="noopener noreferrer" className="btn-navy btn-sm shrink-0"><ExternalLink className="h-4 w-4" />دخول</a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
