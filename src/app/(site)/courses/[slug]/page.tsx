import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BarChart3, CheckCircle2, Clock, Eye, GraduationCap, Lock, PlayCircle, Radio, Tag, Users, Wallet, Award, Infinity as InfinityIcon,
} from "lucide-react";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { CourseCover } from "@/components/CourseCard";
import { PurchaseButton } from "@/components/PurchaseButton";
import { LEVELS, MODES } from "@/lib/constants";
import { discountPercent, formatDateTime, formatMoney, formatNumber, formatPrice, safeDecode } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getCourse(slug: string) {
  return db.course.findUnique({
    where: { slug: safeDecode(slug) },
    include: {
      category: true,
      lessons: { orderBy: { order: "asc" } },
      liveSessions: { where: { published: true, startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, take: 5 },
      _count: { select: { enrollments: true } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCourse(slug);
  if (!c || !c.published) return { title: "كورس غير موجود" };
  return {
    title: c.title,
    description: c.subtitle || c.description.slice(0, 160),
    openGraph: { title: c.title, description: c.subtitle || undefined, images: c.thumbnail ? [c.thumbnail] : ["/og.png"] },
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [course, user] = await Promise.all([getCourse(slug), getUser()]);
  if (!course || (!course.published && user?.role !== "ADMIN")) notFound();

  const enrollment = user
    ? await db.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } })
    : null;

  const sections = new Map<string, typeof course.lessons>();
  for (const l of course.lessons) {
    const key = l.section || "محتوى الكورس";
    sections.set(key, [...(sections.get(key) ?? []), l]);
  }
  const totalMin = course.lessons.reduce((a, l) => a + l.durationMin, 0);
  const outcomes = course.outcomes.split("\n").map((s) => s.trim()).filter(Boolean);
  const off = discountPercent(course.price, course.oldPrice);
  const canAfford = user ? user.balance >= course.price : false;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.subtitle || course.description.slice(0, 200),
    provider: { "@type": "Organization", name: "نيفو للتدريب" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section className="bg-navy-gradient text-white">
        <div className="container-x py-12 lg:pb-28 lg:pt-16">
          <div className="lg:max-w-[calc(100%-420px)]">
            <nav className="text-sm text-slate-300" aria-label="مسار التنقل">
              <Link href="/courses" className="hover:text-gold-300">الكورسات</Link>
              <span className="mx-2">/</span>
              <Link href={`/courses?category=${encodeURIComponent(course.category.slug)}`} className="hover:text-gold-300">{course.category.name}</Link>
            </nav>
            <h1 className="mt-4 text-3xl font-black leading-snug !text-white sm:text-4xl">{course.title}</h1>
            {course.subtitle && <p className="mt-3 max-w-2xl text-lg text-slate-200">{course.subtitle}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-200">
              <span className="inline-flex items-center gap-1.5"><BarChart3 className="h-4 w-4 text-gold-300" />{LEVELS[course.level]}</span>
              <span className="inline-flex items-center gap-1.5"><Radio className="h-4 w-4 text-gold-300" />{MODES[course.mode]}</span>
              <span className="inline-flex items-center gap-1.5"><PlayCircle className="h-4 w-4 text-gold-300" />{formatNumber(course.lessons.length)} درس</span>
              {(course.durationHours > 0 || totalMin > 0) && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-gold-300" />
                  {course.durationHours > 0 ? `${formatNumber(course.durationHours)} ساعة` : `${formatNumber(totalMin)} دقيقة`}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-gold-300" />{formatNumber(course._count.enrollments)} طالب</span>
            </div>
            {course.instructorName && (
              <p className="mt-5 inline-flex items-center gap-2 text-sm">
                <GraduationCap className="h-5 w-5 text-gold-300" />
                المدرب: <b className="text-gold-200">{course.instructorName}</b>
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="container-x grid gap-10 py-10 lg:grid-cols-[1fr_380px] lg:py-0 lg:pb-12">
        {/* Purchase card (overlaps the hero on desktop) */}
        <aside className="order-first relative z-10 lg:order-last lg:-mt-80">
          <div className="card overflow-hidden text-slate-800 lg:sticky lg:top-24">
            <div className="aspect-[16/9]"><CourseCover course={course} /></div>
            <div className="space-y-4 p-6">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-3xl font-black text-navy-800">{formatPrice(course.price)}</span>
                {course.oldPrice && course.oldPrice > course.price && (
                  <>
                    <span className="text-sm text-slate-400 line-through">{formatMoney(course.oldPrice)}</span>
                    <span className="badge bg-gold-100 text-gold-800"><Tag className="h-3 w-3" />خصم {formatNumber(off)}٪</span>
                  </>
                )}
              </div>

              {enrollment ? (
                <Link href={`/learn/${encodeURIComponent(course.slug)}`} className="btn-gold btn-lg w-full">
                  <PlayCircle className="h-5 w-5" />تابع التعلّم
                </Link>
              ) : !user ? (
                <div className="space-y-2">
                  <Link href={`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`} className="btn-gold btn-lg w-full">سجّل الدخول للاشتراك</Link>
                  <Link href="/register" className="btn-outline w-full">ليس لديك حساب؟ أنشئ حسابًا</Link>
                </div>
              ) : !course.published ? (
                <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-700">هذا الكورس غير منشور (معاينة للإدارة).</p>
              ) : (
                <>
                  <div className="flex items-center justify-between rounded-xl bg-navy-50 px-4 py-3 text-sm">
                    <span className="inline-flex items-center gap-2 font-bold text-navy-800"><Wallet className="h-4 w-4 text-gold-600" />رصيدك</span>
                    <b className={canAfford ? "text-emerald-600" : "text-red-600"}>{formatMoney(user.balance)}</b>
                  </div>
                  {canAfford ? (
                    <PurchaseButton courseId={course.id} price={course.price} />
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-red-600">رصيدك غير كافٍ (ينقصك {formatMoney(course.price - user.balance)}).</p>
                      <Link href="/wallet" className="btn-gold btn-lg w-full"><Wallet className="h-5 w-5" />اشحن محفظتك</Link>
                    </div>
                  )}
                </>
              )}

              <ul className="space-y-2.5 border-t border-slate-100 pt-4 text-sm font-semibold text-slate-600">
                <li className="flex items-center gap-2"><InfinityIcon className="h-4 w-4 text-gold-600" />وصول دائم للمحتوى</li>
                <li className="flex items-center gap-2"><Award className="h-4 w-4 text-gold-600" />شهادة إتمام بكود تحقق</li>
                <li className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-gold-600" />تتبع تقدمك خطوة بخطوة</li>
              </ul>
            </div>
          </div>
        </aside>

        <div className="space-y-12 lg:pt-12">
          {outcomes.length > 0 && (
            <section className="card p-6 sm:p-8">
              <h2 className="text-2xl">ماذا ستتعلم؟</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-2 text-sm font-semibold leading-7 text-slate-700">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />{o}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {course.description && (
            <section>
              <h2 className="text-2xl">عن الكورس</h2>
              <div className="mt-4 whitespace-pre-line leading-8 text-slate-700">{course.description}</div>
            </section>
          )}

          <section>
            <h2 className="text-2xl">محتوى الكورس</h2>
            <p className="mt-1 text-sm text-slate-500">{formatNumber(course.lessons.length)} درس · {formatNumber(totalMin)} دقيقة</p>
            <div className="mt-5 space-y-4">
              {course.lessons.length === 0 && <p className="card p-6 text-slate-500">سيتم إضافة الدروس قريبًا.</p>}
              {[...sections.entries()].map(([name, ls]) => (
                <div key={name} className="card overflow-hidden">
                  <div className="bg-navy-50 px-5 py-3 font-extrabold text-navy-900">{name}</div>
                  <ul className="divide-y divide-slate-100">
                    {ls.map((l) => (
                      <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm">
                        <span className="flex flex-wrap items-center gap-3 font-semibold text-slate-700">
                          {l.isFree || enrollment ? <PlayCircle className="h-5 w-5 text-gold-600" /> : <Lock className="h-5 w-5 text-slate-400" />}
                          {l.title}
                          {l.isFree && !enrollment && <span className="badge bg-emerald-100 text-emerald-700"><Eye className="h-3 w-3" />معاينة مجانية</span>}
                        </span>
                        {l.durationMin > 0 && <span className="text-xs text-slate-400">{formatNumber(l.durationMin)} د</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {course.liveSessions.length > 0 && (
            <section>
              <h2 className="text-2xl">المحاضرات المباشرة القادمة</h2>
              <div className="mt-4 space-y-3">
                {course.liveSessions.map((s) => (
                  <div key={s.id} className="card flex items-center gap-4 p-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500"><Radio className="h-5 w-5" /></span>
                    <div>
                      <div className="font-bold text-navy-900">{s.title}</div>
                      <div className="text-sm text-slate-500">{formatDateTime(s.startsAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {course.instructorName && (
            <section className="card flex items-start gap-5 p-6">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy-800 text-2xl font-black text-gold-300">
                {course.instructorName.trim().charAt(0)}
              </span>
              <div>
                <h2 className="text-xl">{course.instructorName}</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{course.instructorBio || "مدرب معتمد في نيفو للتدريب."}</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
