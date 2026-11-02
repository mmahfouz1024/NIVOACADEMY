import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { MODES } from "@/lib/constants";
import { cn, formatNumber, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "الكورسات" };

export default async function AdminCourses() {
  const courses = await db.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true } }, _count: { select: { lessons: true, enrollments: true } } },
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">الكورسات ({formatNumber(courses.length)})</h1>
        <Link href="/admin/courses/new" className="btn-gold"><Plus className="h-4 w-4" />كورس جديد</Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="table-x">
          <thead>
            <tr><th>الكورس</th><th>التصنيف</th><th>النوع</th><th>السعر</th><th>الدروس</th><th>المشتركون</th><th>الحالة</th><th /></tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td className="max-w-xs font-bold text-navy-900">{c.title}{c.featured && <span className="badge ms-2 bg-gold-100 text-gold-800">مميز</span>}</td>
                <td>{c.category.name}</td>
                <td>{MODES[c.mode]}</td>
                <td className="whitespace-nowrap">{formatPrice(c.price)}</td>
                <td>{formatNumber(c._count.lessons)}</td>
                <td>{formatNumber(c._count.enrollments)}</td>
                <td><span className={cn("badge", c.published ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600")}>{c.published ? "منشور" : "مسودة"}</span></td>
                <td>
                  <div className="flex gap-2">
                    <Link href={`/admin/courses/${c.id}`} className="btn-outline btn-sm"><Pencil className="h-3.5 w-3.5" />تعديل</Link>
                    <Link href={`/courses/${encodeURIComponent(c.slug)}`} target="_blank" className="btn-ghost btn-sm" aria-label="معاينة"><ExternalLink className="h-3.5 w-3.5" /></Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
