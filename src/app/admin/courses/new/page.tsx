import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { CourseForm } from "@/components/CourseForm";

export const metadata: Metadata = { title: "كورس جديد" };

export default async function NewCourse() {
  const categories = await db.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } });
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/courses" className="text-sm font-bold text-navy-600 hover:underline">← الكورسات</Link>
        <h1 className="mt-1 text-3xl">كورس جديد</h1>
        <p className="mt-1 text-sm text-slate-500">بعد الحفظ يمكنك إضافة الدروس.</p>
      </div>
      <div className="card p-6">
        {categories.length === 0 ? (
          <p className="text-slate-600">أضف تصنيفًا أولًا من <Link href="/admin/categories" className="font-bold text-navy-700 underline">صفحة التصنيفات</Link>.</p>
        ) : (
          <CourseForm categories={categories} />
        )}
      </div>
    </div>
  );
}
