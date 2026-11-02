import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { LiveForm } from "@/components/LiveForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteLiveAction } from "@/app/actions/admin";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "المحاضرات المباشرة" };

export default async function AdminLive() {
  const [sessions, courses] = await Promise.all([
    db.liveSession.findMany({ orderBy: { startsAt: "desc" }, include: { course: { select: { title: true } } }, take: 100 }),
    db.course.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);
  const now = Date.now();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">المحاضرات المباشرة</h1>

      <details className="card border-2 border-dashed border-gold-400 p-1" open={sessions.length === 0}>
        <summary className="cursor-pointer list-none px-5 py-4 text-lg font-extrabold text-navy-900">+ جدولة جلسة جديدة</summary>
        <div className="p-5"><LiveForm courses={courses} /></div>
      </details>

      <div className="space-y-3">
        {sessions.map((s) => (
          <details key={s.id} className="card open:border-gold-400">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <div className="font-extrabold text-navy-900">{s.title}</div>
                <div className="text-sm text-slate-500">{formatDateTime(s.startsAt)}{s.course ? ` · ${s.course.title}` : ""}</div>
              </div>
              <div className="flex gap-2">
                <span className={`badge ${s.startsAt.getTime() > now ? "bg-navy-50 text-navy-700" : "bg-slate-200 text-slate-600"}`}>{s.startsAt.getTime() > now ? "قادمة" : "منتهية"}</span>
                {!s.published && <span className="badge bg-amber-100 text-amber-700">مخفية</span>}
              </div>
            </summary>
            <div className="space-y-4 border-t border-slate-100 p-5">
              <LiveForm live={s} courses={courses} />
              <form action={deleteLiveAction}>
                <input type="hidden" name="id" value={s.id} />
                <ConfirmButton message="حذف هذه الجلسة؟"><Trash2 className="h-3.5 w-3.5" />حذف</ConfirmButton>
              </form>
            </div>
          </details>
        ))}
        {sessions.length === 0 && <p className="card p-10 text-center text-slate-500">لا توجد جلسات بعد.</p>}
      </div>
    </div>
  );
}
