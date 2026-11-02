import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Undo2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmButton } from "@/components/ConfirmButton";
import { adjustBalanceAction, refundEnrollmentAction, setRoleAction, toggleUserActiveAction } from "@/app/actions/admin";
import { TX_TYPES } from "@/lib/constants";
import { cn, formatDate, formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "تفاصيل مستخدم" };

export default async function AdminUser({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await requireAdmin();
  const user = await db.user.findUnique({
    where: { id },
    include: {
      enrollments: { include: { course: { select: { title: true } } }, orderBy: { createdAt: "desc" } },
      transactions: { orderBy: { createdAt: "desc" }, take: 30 },
    },
  });
  if (!user) notFound();
  const self = me.id === user.id;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/users" className="text-sm font-bold text-navy-600 hover:underline">← المستخدمون</Link>
        <h1 className="mt-1 text-3xl">{user.name}</h1>
        <p className="text-sm text-slate-500" dir="ltr">{user.email} · {user.phone}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-1">
          <div className="text-sm font-bold text-slate-500">الرصيد الحالي</div>
          <div className="mt-1 text-4xl font-black text-navy-800">{formatMoney(user.balance)}</div>
          <div className="mt-1 text-xs text-slate-500">تسجيل: {formatDate(user.createdAt)}</div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <h2 className="mb-3 text-base">تعديل الرصيد يدويًا</h2>
            <ActionForm action={adjustBalanceAction} className="space-y-3">
              <input type="hidden" name="userId" value={user.id} />
              <div className="grid grid-cols-2 gap-2">
                <select name="sign" className="input" defaultValue="credit" aria-label="النوع">
                  <option value="credit">إضافة (+)</option>
                  <option value="debit">خصم (−)</option>
                </select>
                <input name="amount" type="number" min={1} required className="input" placeholder="المبلغ" />
              </div>
              <input name="note" required className="input" placeholder="السبب (يظهر في السجل)" />
              <SubmitButton className="btn-navy w-full">تنفيذ</SubmitButton>
            </ActionForm>
          </div>

          {!self && (
            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
              <form action={toggleUserActiveAction}>
                <input type="hidden" name="id" value={user.id} />
                <ConfirmButton message={user.active ? "إيقاف هذا الحساب؟" : "تفعيل هذا الحساب؟"} className={user.active ? "btn-danger btn-sm" : "btn-navy btn-sm"}>
                  {user.active ? "إيقاف الحساب" : "تفعيل الحساب"}
                </ConfirmButton>
              </form>
              <form action={setRoleAction}>
                <input type="hidden" name="id" value={user.id} />
                <input type="hidden" name="role" value={user.role === "ADMIN" ? "STUDENT" : "ADMIN"} />
                <ConfirmButton message="تغيير صلاحية المستخدم؟" className="btn-outline btn-sm">
                  {user.role === "ADMIN" ? "إلغاء صلاحية الأدمن" : "ترقية إلى أدمن"}
                </ConfirmButton>
              </form>
            </div>
          )}
        </section>

        <div className="space-y-6 lg:col-span-2">
          <section className="card">
            <div className="border-b border-slate-100 p-5"><h2 className="text-lg">الاشتراكات</h2></div>
            {user.enrollments.length === 0 ? (
              <p className="p-8 text-center text-slate-500">لا توجد اشتراكات.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {user.enrollments.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                    <div>
                      <div className="font-bold text-navy-900">{e.course.title}</div>
                      <div className="text-xs text-slate-500">{formatDate(e.createdAt)} · دفع {formatMoney(e.pricePaid)}</div>
                    </div>
                    <form action={refundEnrollmentAction}>
                      <input type="hidden" name="id" value={e.id} />
                      <input type="hidden" name="userId" value={user.id} />
                      <ConfirmButton message="إلغاء الاشتراك وإرجاع المبلغ للمحفظة؟" className="btn-outline btn-sm"><Undo2 className="h-3.5 w-3.5" />إلغاء واسترداد</ConfirmButton>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <div className="border-b border-slate-100 p-5"><h2 className="text-lg">سجل المحفظة</h2></div>
            {user.transactions.length === 0 ? (
              <p className="p-8 text-center text-slate-500">لا توجد معاملات.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {user.transactions.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                    <div>
                      <div className="font-bold text-navy-900">{t.note || TX_TYPES[t.type]}</div>
                      <div className="text-xs text-slate-500">{TX_TYPES[t.type]} · {formatDate(t.createdAt)}</div>
                    </div>
                    <div className="text-end">
                      <div className={cn("font-black", t.amount > 0 ? "text-emerald-600" : "text-red-500")} dir="ltr">{t.amount > 0 ? "+" : "−"}{formatMoney(Math.abs(t.amount))}</div>
                      <div className="text-xs text-slate-400">الرصيد: {formatMoney(t.balanceAfter)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
