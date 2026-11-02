import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Eye, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { CourseForm } from "@/components/CourseForm";
import { LessonForm } from "@/components/LessonForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteCourseAction, deleteLessonAction } from "@/app/actions/admin";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "تعديل كورس" };

export default async function EditCourse({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [course, categories] = await Promise.all([
    db.course.findUnique({
      where: { id },
      include: { lessons: { orderBy: { order: "asc" } }, _count: { select: { enrollments: true } } },
    }),
    db.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!course) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/courses" className="text-sm font-bold text-navy-600 hover:underline">← الكورسات</Link>
          <h1 className="mt-1 text-3xl">{course.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{formatNumber(course._count.enrollments)} مشترك</p>
        </div>
        <Link href={`/courses/${encodeURIComponent(course.slug)}`} target="_blank" className="btn-outline">
          <ExternalLink className="h-4 w-4" />معاينة الصفحة
        </Link>
      </div>

      <section className="card p-6">
        <h2 className="mb-5 text-xl">بيانات الكورس</h2>
        <CourseForm course={course} categories={categories} />
      </section>

      <section className="card p-6">
        <h2 className="mb-1 text-xl">الدروس ({formatNumber(course.lessons.length)})</h2>
        <p className="mb-5 text-sm text-slate-500">اضغط على الدرس لتعديله. الدروس تُعرض حسب رقم الترتيب.</p>

        <div className="space-y-3">
          {course.lessons.map((l) => (
            <details key={l.id} className="group rounded-xl border border-slate-200 open:border-gold-400 open:bg-slate-50/50">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                <span className="flex items-center gap-3 font-bold text-navy-900">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-50 text-xs text-navy-700">{formatNumber(l.order)}</span>
                  {l.title}
                  {l.section && <span className="badge bg-slate-100 text-slate-600">{l.section}</span>}
                  {l.isFree && <span className="badge bg-emerald-100 text-emerald-700"><Eye className="h-3 w-3" />مجاني</span>}
                  {!l.videoUrl && <span className="badge bg-amber-100 text-amber-700">بدون فيديو</span>}
                </span>
                <span className="text-xs font-bold text-slate-400 group-open:hidden">تعديل</span>
              </summary>
              <div className="space-y-4 border-t border-slate-200 p-4">
                <LessonForm courseId={course.id} lesson={l} />
                <form action={deleteLessonAction}>
                  <input type="hidden" name="id" value={l.id} />
                  <ConfirmButton message="حذف هذا الدرس نهائيًا؟"><Trash2 className="h-3.5 w-3.5" />حذف الدرس</ConfirmButton>
                </form>
              </div>
            </details>
          ))}
        </div>

        <details className="mt-6 rounded-xl border-2 border-dashed border-gold-400 bg-gold-50/40 p-1" open={course.lessons.length === 0}>
          <summary className="cursor-pointer list-none px-4 py-3 font-extrabold text-navy-900">+ إضافة درس جديد</summary>
          <div className="p-4"><LessonForm courseId={course.id} /></div>
        </details>
      </section>

      <section className="card border-red-200 p-6">
        <h2 className="mb-2 text-xl text-red-700">منطقة الخطر</h2>
        <p className="mb-4 text-sm text-slate-600">
          {course._count.enrollments > 0
            ? "هذا الكورس عليه مشتركون، لذلك سيتم إلغاء نشره بدلًا من حذفه."
            : "سيتم حذف الكورس وكل دروسه نهائيًا."}
        </p>
        <form action={deleteCourseAction}>
          <input type="hidden" name="id" value={course.id} />
          <ConfirmButton message="هل أنت متأكد؟" className="btn-danger">{course._count.enrollments > 0 ? "إلغاء نشر الكورس" : "حذف الكورس"}</ConfirmButton>
        </form>
      </section>
    </div>
  );
}
