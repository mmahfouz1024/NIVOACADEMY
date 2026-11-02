import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, ExternalLink, Lock, Radio, Video } from "lucide-react";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { PLATFORMS } from "@/lib/constants";
import { formatDateTime, formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "المحاضرات المباشرة",
  description: "جدول المحاضرات المباشرة (لايف) في نيفو للتدريب.",
};
export const dynamic = "force-dynamic";

export default async function LivePage() {
  const user = await getUser();
  const now = new Date();
  const sessions = await db.liveSession.findMany({
    where: { published: true, startsAt: { gte: new Date(now.getTime() - 3 * 60 * 60 * 1000) } },
    orderBy: { startsAt: "asc" },
    include: { course: { select: { id: true, title: true, slug: true } } },
  });

  const enrolledIds = new Set(
    user
      ? (await db.enrollment.findMany({ where: { userId: user.id }, select: { courseId: true } })).map((e) => e.courseId)
      : []
  );

  const visible = sessions.filter((s) => s.startsAt.getTime() + s.durationMin * 60000 >= now.getTime());

  return (
    <>
      <section className="bg-navy-gradient py-14 text-white">
        <div className="container-x">
          <h1 className="flex items-center gap-3 text-4xl font-black !text-white">
            <Radio className="h-9 w-9 text-red-400" />
            المحاضرات المباشرة
          </h1>
          <p className="mt-2 text-slate-200">تفاعل مع المدرب لحظة بلحظة. رابط الدخول متاح للمشتركين في الكورس.</p>
        </div>
      </section>

      <div className="container-x py-12">
        {visible.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 py-20 text-center">
            <Video className="h-14 w-14 text-slate-300" />
            <h2 className="text-xl">لا توجد محاضرات مباشرة مجدولة حاليًا</h2>
            <p className="text-slate-500">سنعلن عن المواعيد الجديدة قريبًا.</p>
            <Link href="/courses" className="btn-navy mt-2">تصفح الكورسات</Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {visible.map((s) => {
              const isLive = s.startsAt <= now;
              const eligible = !!user && (s.course ? enrolledIds.has(s.course.id) || user.role === "ADMIN" : true);
              return (
                <article key={s.id} className="card flex flex-col gap-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl">{s.title}</h2>
                      {s.course && (
                        <Link href={`/courses/${encodeURIComponent(s.course.slug)}`} className="mt-1 inline-block text-sm font-bold text-gold-700 hover:underline">
                          {s.course.title}
                        </Link>
                      )}
                    </div>
                    {isLive ? (
                      <span className="badge animate-pulse bg-red-500 text-white"><Radio className="h-3 w-3" />مباشر الآن</span>
                    ) : (
                      <span className="badge bg-navy-50 text-navy-700">قادمة</span>
                    )}
                  </div>
                  {s.description && <p className="text-sm leading-7 text-slate-600">{s.description}</p>}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1.5"><CalendarClock className="h-4 w-4 text-gold-600" />{formatDateTime(s.startsAt)}</span>
                    <span>{formatNumber(s.durationMin)} دقيقة</span>
                    <span>{PLATFORMS[s.platform] ?? s.platform}</span>
                  </div>
                  <div className="mt-auto">
                    {eligible && s.joinUrl ? (
                      <a href={s.joinUrl} target="_blank" rel="noopener noreferrer" className={isLive ? "btn-gold w-full" : "btn-navy w-full"}>
                        <ExternalLink className="h-4 w-4" />
                        {isLive ? "انضم الآن" : "رابط الدخول"}
                      </a>
                    ) : eligible ? (
                      <p className="rounded-xl bg-slate-50 p-3 text-center text-sm font-semibold text-slate-500">سيتم نشر رابط الدخول قبل الموعد.</p>
                    ) : !user ? (
                      <Link href="/login?next=/live" className="btn-outline w-full"><Lock className="h-4 w-4" />سجّل الدخول لعرض الرابط</Link>
                    ) : (
                      <Link href={`/courses/${encodeURIComponent(s.course?.slug ?? "")}`} className="btn-outline w-full"><Lock className="h-4 w-4" />اشترك في الكورس للانضمام</Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
