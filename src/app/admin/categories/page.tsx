import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmButton } from "@/components/ConfirmButton";
import { CategoryIcon, ICON_NAMES } from "@/components/icons";
import { deleteCategoryAction, saveCategoryAction } from "@/app/actions/admin";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "التصنيفات" };

function CategoryFields({ c }: { c?: { id: string; name: string; icon: string; order: number } }) {
  return (
    <>
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="grid gap-3 sm:grid-cols-[1fr_180px_90px]">
        <input name="name" required defaultValue={c?.name} className="input" placeholder="اسم التصنيف" aria-label="اسم التصنيف" />
        <select name="icon" defaultValue={c?.icon ?? "BookOpen"} className="input" aria-label="الأيقونة">
          {ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <input name="order" type="number" defaultValue={c?.order ?? 0} className="input" aria-label="الترتيب" title="الترتيب" />
      </div>
    </>
  );
}

export default async function AdminCategories() {
  const cats = await db.category.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { courses: true } } } });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">التصنيفات</h1>

      <section className="card p-6">
        <h2 className="mb-4 text-xl">إضافة تصنيف</h2>
        <ActionForm action={saveCategoryAction}>
          <CategoryFields />
          <SubmitButton className="btn-gold">إضافة</SubmitButton>
        </ActionForm>
      </section>

      <section className="space-y-3">
        {cats.map((c) => (
          <div key={c.id} className="card flex flex-wrap items-start gap-4 p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-800 text-gold-300"><CategoryIcon name={c.icon} className="h-6 w-6" /></span>
            <div className="min-w-[260px] flex-1">
              <ActionForm action={saveCategoryAction} className="space-y-3">
                <CategoryFields c={c} />
                <div className="flex items-center gap-3">
                  <SubmitButton className="btn-navy btn-sm">حفظ</SubmitButton>
                  <span className="text-xs text-slate-500">{formatNumber(c._count.courses)} كورس</span>
                </div>
              </ActionForm>
            </div>
            {c._count.courses === 0 && (
              <form action={deleteCategoryAction}>
                <input type="hidden" name="id" value={c.id} />
                <ConfirmButton message="حذف التصنيف؟" className="btn-ghost btn-sm text-red-600"><Trash2 className="h-4 w-4" />حذف</ConfirmButton>
              </form>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
