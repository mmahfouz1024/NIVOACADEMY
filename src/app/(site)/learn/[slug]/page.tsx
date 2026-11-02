import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Award, CheckCircle2, ChevronLeft, ChevronRight, Circle, Lock, PlayCircle, Video } from "lucide-react";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { parseVideo } from "@/lib/video";
import { toggleLessonAction } from "@/app/actions/student";
import { SubmitButton } from "@/components/SubmitButton";
import { cn, formatNumber, safeDecode } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "صفحة التعلّم", robots: { index: false } };

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const [{ slug }, { lesson: lessonParam }] = await Promise.all([params, searchParams]);
  const user = await getUser();

  const course = await db.course.findUnique({
    where: { slug: safeDecode(slug) },
    include: { lessons: { orderBy: { order: "asc" } } },
  });
  if (!course || (!course.published && user?.role !== "ADMIN")) notFound();

  const enrollment = user
    ? await db.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } })
    : null;
  const isAdmin = user?.role === "ADMIN";
  const hasAccess = !!enrollment || isAdmin;

  const lessons = course.lessons;
  const hasFree = lessons.some((l) => l.isFree);
  if (!hasAccess && !hasFree) {
    redirect(user ? `/courses/${encodeURIComponent(course.slug)}` : `/login?next=${encodeURIComponent(`/learn/${course.slug}`)}`);
  }

  const doneRows = user
    ? await db.lessonProgress.findMany({ where: { userId: user.id, lesson: { courseId: course.id } }, select: { lessonId: true } })
    : [];
  const done = new Set(doneRows.map((d) => d.lessonId));

  const firstViewable = lessons.find((l) => hasAccess || l.isFree);
  const firstUndone = hasAccess ? lessons.find((l) => !done.has(l.id)) : undefined;
  const current =
    lessons.find((l) => l.id === lessonParam) ?? firstUndone ?? firstViewable ?? lessons[0];

  const canView = !!current && (hasAccess || current.isFree);
  const idx = current ? lessons.findIndex((l) => l.id === current.id) : -1;
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null;
  const percent = lessons.length ? Math.round((done.size / lessons.length) * 100) : 0;
  const video = current && canView ? parseVideo(current.videoUrl) : { type: "none" as const };

  const href = (id: string) => `/learn/${encodeURIComponent(course.slug)}?lesson=${id}`;

  // group sidebar by section
  const groups = new Map<string, typeof lessons>();
  for (const l of lessons) {
    const k = l.section || "محتوى الكورس";
    groups.set(k, [...(groups.get(k) ?? []), l]);
  }

  return (
    <div className="bg-slate-100">
      <div className="container-x py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href={`/courses/${encodeURIComponent(course.slug)}`} className="text-sm font-bold text-navy-600 hover:underline">← {course.title}</Link>
            {current && <h1 className="mt-1 text-2xl">{current.title}</h1>}
          </div>
          {hasAccess && (
            <div className="w-full max-w-xs">
              <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
                <span>تقدمك</span><span>{formatNumber(percent)}٪</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-gold-gradient" style={{ width: `${percent}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-navy-950 shadow-card">
              {!current ? (
                <Empty icon={<Video className="h-12 w-12" />} text="لا توجد دروس في هذا الكورس بعد." />
              ) : !canView ? (
                <Empty icon={<Lock className="h-12 w-12" />} text="هذا الدرس متاح للمشتركين فقط." />
              ) : video.type === "iframe" ? (
                <iframe
                  key={current.id}
                  src={video.src}
                  title={current.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : video.type === "file" ? (
                <video key={current.id} src={video.src} controls controlsList="nodownload" playsInline className="absolute inset-0 h-full w-full" />
              ) : (
                <Empty icon={<Video className="h-12 w-12" />} text="سيتم رفع فيديو هذا الدرس قريبًا." />
              )}
              {canView && video.type !== "none" && user && (
                <span className="pointer-events-none absolute bottom-3 end-4 select-none text-[11px] font-bold text-white/25" dir="ltr">
                  {user.email}
                </span>
              )}
            </div>

            {current && (
              <div className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    {prev && (hasAccess || prev.isFree) && (
                      <Link href={href(prev.id)} className="btn-outline btn-sm"><ChevronRight className="h-4 w-4" />السابق</Link>
                    )}
                    {next && (hasAccess || next.isFree) && (
                      <Link href={href(next.id)} className="btn-navy btn-sm">التالي<ChevronLeft className="h-4 w-4" /></Link>
                    )}
                  </div>
                  {hasAccess && user && !isAdmin ? (
                    <form action={toggleLessonAction.bind(null, current.id)}>
                      <SubmitButton className={done.has(current.id) ? "btn-outline btn-sm" : "btn-gold btn-sm"}>
                        {done.has(current.id) ? (<><CheckCircle2 className="h-4 w-4 text-emerald-600" />تم الإكمال (إلغاء)</>) : (<><Circle className="h-4 w-4" />أكملت الدرس</>)}
                      </SubmitButton>
                    </form>
                  ) : !hasAccess ? (
                    <Link href={`/courses/${encodeURIComponent(course.slug)}`} className="btn-gold btn-sm">اشترك لفتح كل الدروس</Link>
                  ) : null}
                </div>
                {current.description && <p className="mt-4 whitespace-pre-line text-sm leading-8 text-slate-700">{current.description}</p>}
              </div>
            )}

            {enrollment?.certificateCode && (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-navy-gradient p-6 text-white">
                <div className="flex items-center gap-3">
                  <Award className="h-10 w-10 text-gold-300" />
                  <div>
                    <div className="text-lg font-black">مبروك! أكملت الكورس 🎉</div>
                    <div className="text-sm text-slate-200">شهادتك جاهزة للعرض والطباعة.</div>
                  </div>
                </div>
                <Link href={`/certificate/${enrollment.certificateCode}`} className="btn-gold">عرض الشهادة</Link>
              </div>
            )}
          </div>

          <aside className="card h-fit max-h-[80vh] overflow-y-auto lg:sticky lg:top-24">
            <div className="border-b border-slate-100 p-4 font-extrabold text-navy-900">محتوى الكورس</div>
            {[...groups.entries()].map(([name, ls]) => (
              <div key={name}>
                <div className="bg-navy-50 px-4 py-2 text-xs font-extrabold text-navy-700">{name}</div>
                <ul>
                  {ls.map((l) => {
                    const open = hasAccess || l.isFree;
                    const active = l.id === current?.id;
                    const inner = (
                      <>
                        {!open ? <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                          : done.has(l.id) ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                          : <PlayCircle className={cn("h-4 w-4 shrink-0", active ? "text-gold-600" : "text-slate-400")} />}
                        <span className="flex-1">{l.title}</span>
                        {l.durationMin > 0 && <span className="text-xs text-slate-400">{formatNumber(l.durationMin)}د</span>}
                      </>
                    );
                    return (
                      <li key={l.id}>
                        {open ? (
                          <Link href={href(l.id)} className={cn("flex items-center gap-3 border-s-4 px-4 py-3 text-sm font-semibold transition hover:bg-slate-50", active ? "border-gold-500 bg-gold-50 text-navy-900" : "border-transparent text-slate-700")}>
                            {inner}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 border-s-4 border-transparent px-4 py-3 text-sm font-semibold text-slate-400">{inner}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-300">
      {icon}
      <p className="font-bold">{text}</p>
    </div>
  );
}
