import type { Metadata } from "next";
import Link from "next/link";
import { Search, SearchX } from "lucide-react";
import { db } from "@/lib/db";
import { CourseCard, courseCardInclude } from "@/components/CourseCard";
import { LEVELS, MODES } from "@/lib/constants";
import { cn, formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "الكورسات",
  description: "تصفح كل كورسات نيفو للتدريب في اللغات والذكاء الاصطناعي والبرمجة والتسويق وغيرها.",
};
export const dynamic = "force-dynamic";

type Sp = { q?: string; category?: string; level?: string; mode?: string; sort?: string };

function href(sp: Sp, patch: Partial<Sp>) {
  const next = { ...sp, ...patch };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) if (v) qs.set(k, v);
  const s = qs.toString();
  return `/courses${s ? `?${s}` : ""}`;
}

export default async function CoursesPage({ searchParams }: { searchParams: Promise<Sp> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);

  const orderBy =
    sp.sort === "price_asc" ? { price: "asc" as const }
    : sp.sort === "price_desc" ? { price: "desc" as const }
    : sp.sort === "popular" ? { enrollments: { _count: "desc" as const } }
    : { createdAt: "desc" as const };

  const [categories, courses] = await Promise.all([
    db.category.findMany({ orderBy: { order: "asc" } }),
    db.course.findMany({
      where: {
        published: true,
        ...(sp.category ? { category: { slug: sp.category } } : {}),
        ...(sp.level && sp.level in LEVELS ? { level: sp.level } : {}),
        ...(sp.mode && sp.mode in MODES ? { mode: sp.mode } : {}),
        ...(q
          ? { OR: [{ title: { contains: q } }, { subtitle: { contains: q } }, { description: { contains: q } }, { instructorName: { contains: q } }] }
          : {}),
      },
      include: courseCardInclude,
      orderBy,
    }),
  ]);

  const chip = (active: boolean) =>
    cn(
      "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition",
      active ? "border-navy-800 bg-navy-800 text-white" : "border-slate-200 bg-white text-navy-800 hover:border-gold-400"
    );

  return (
    <>
      <section className="bg-navy-gradient py-14 text-white">
        <div className="container-x">
          <h1 className="text-4xl font-black !text-white">كل الكورسات</h1>
          <p className="mt-2 text-slate-200">اختر الكورس المناسب لهدفك وابدأ التعلّم اليوم.</p>

          <form action="/courses" className="mt-8 flex max-w-2xl gap-2">
            {sp.category && <input type="hidden" name="category" value={sp.category} />}
            {sp.level && <input type="hidden" name="level" value={sp.level} />}
            {sp.mode && <input type="hidden" name="mode" value={sp.mode} />}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input name="q" defaultValue={q} placeholder="ابحث عن كورس أو مدرب..." className="input !rounded-2xl !py-3.5 ps-12" aria-label="بحث" />
            </div>
            <button className="btn-gold px-6">بحث</button>
          </form>
        </div>
      </section>

      <div className="container-x py-10">
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Link href={href(sp, { category: undefined })} className={chip(!sp.category)}>الكل</Link>
            {categories.map((c) => (
              <Link key={c.id} href={href(sp, { category: c.slug })} className={chip(sp.category === c.slug)}>{c.name}</Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-500">المستوى:</span>
              <Link href={href(sp, { level: undefined })} className={chip(!sp.level)}>الكل</Link>
              {Object.entries(LEVELS).map(([k, v]) => (
                <Link key={k} href={href(sp, { level: k })} className={chip(sp.level === k)}>{v}</Link>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-500">النوع:</span>
              <Link href={href(sp, { mode: undefined })} className={chip(!sp.mode)}>الكل</Link>
              {Object.entries(MODES).map(([k, v]) => (
                <Link key={k} href={href(sp, { mode: k })} className={chip(sp.mode === k)}>{v}</Link>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-500">الترتيب:</span>
              {[["", "الأحدث"], ["popular", "الأكثر اشتراكًا"], ["price_asc", "الأقل سعرًا"], ["price_desc", "الأعلى سعرًا"]].map(([k, v]) => (
                <Link key={k} href={href(sp, { sort: k || undefined })} className={chip((sp.sort ?? "") === k)}>{v}</Link>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-8 text-sm font-semibold text-slate-500">{formatNumber(courses.length)} كورس</p>

        {courses.length === 0 ? (
          <div className="card mt-6 flex flex-col items-center gap-3 py-20 text-center">
            <SearchX className="h-14 w-14 text-slate-300" />
            <h2 className="text-xl">لا توجد كورسات مطابقة</h2>
            <p className="text-slate-500">جرّب تغيير البحث أو الفلاتر.</p>
            <Link href="/courses" className="btn-navy mt-2">عرض كل الكورسات</Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
