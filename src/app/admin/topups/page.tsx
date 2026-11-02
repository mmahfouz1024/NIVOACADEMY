import type { Metadata } from "next";
import Link from "next/link";
import { Check, ExternalLink, X } from "lucide-react";
import { db } from "@/lib/db";
import { approveTopupAction, rejectTopupAction } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/ConfirmButton";
import { TOPUP_METHODS, TOPUP_STATUS } from "@/lib/constants";
import { cn, formatDateTime, formatMoney, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "طلبات الشحن" };

const TONE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default async function AdminTopups({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "PENDING" } = await searchParams;
  const current = status in TOPUP_STATUS ? status : "PENDING";

  const [rows, counts] = await Promise.all([
    db.topupRequest.findMany({
      where: { status: current },
      orderBy: { createdAt: current === "PENDING" ? "asc" : "desc" },
      take: 100,
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    }),
    db.topupRequest.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">طلبات الشحن</h1>

      <div className="flex gap-2">
        {Object.entries(TOPUP_STATUS).map(([k, v]) => (
          <Link key={k} href={`/admin/topups?status=${k}`}
            className={cn("rounded-full border px-4 py-2 text-sm font-bold transition", current === k ? "border-navy-800 bg-navy-800 text-white" : "border-slate-200 bg-white text-navy-800 hover:border-gold-400")}>
            {v} ({formatNumber(count(k))})
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="card p-14 text-center text-slate-500">لا توجد طلبات.</div>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <article key={r.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/users/${r.user.id}`} className="text-lg font-extrabold text-navy-900 hover:underline">{r.user.name}</Link>
                    <span className={cn("badge", TONE[r.status])}>{TOPUP_STATUS[r.status]}</span>
                  </div>
                  <div className="text-sm text-slate-500" dir="ltr">{r.user.email} · {r.user.phone}</div>
                  <div className="text-xs text-slate-500">{formatDateTime(r.createdAt)}</div>
                </div>
                <div className="text-end">
                  <div className="text-3xl font-black text-navy-800">{formatMoney(r.amount)}</div>
                  <div className="text-sm font-bold text-gold-700">{TOPUP_METHODS[r.method]}</div>
                  {r.senderRef && <div className="text-xs text-slate-500" dir="ltr">من: {r.senderRef}</div>}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-start gap-5">
                <a href={`/api/receipts/${r.id}`} target="_blank" rel="noopener noreferrer"
                  className="group relative block h-40 w-32 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  {/\.pdf$/i.test(r.receiptPath) ? (
                    <span className="flex h-full items-center justify-center text-sm font-bold text-navy-700">PDF</span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/receipts/${r.id}`} alt="إيصال التحويل" className="h-full w-full object-cover" />
                  )}
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-navy-950/70 py-1 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
                    <ExternalLink className="h-3 w-3" />تكبير
                  </span>
                </a>

                {r.status === "PENDING" ? (
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <form action={approveTopupAction} className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                      <input type="hidden" name="id" value={r.id} />
                      <input name="note" className="input" placeholder="ملاحظة (اختياري)" />
                      <ConfirmButton message={`قبول الطلب وإضافة ${r.amount} ج.م لرصيد ${r.user.name}؟`} className="btn bg-emerald-600 text-white hover:bg-emerald-700 w-full">
                        <Check className="h-4 w-4" />قبول وإضافة الرصيد
                      </ConfirmButton>
                    </form>
                    <form action={rejectTopupAction} className="space-y-2 rounded-xl border border-red-200 bg-red-50/50 p-4">
                      <input type="hidden" name="id" value={r.id} />
                      <input name="note" required className="input" placeholder="سبب الرفض (يظهر للطالب)" />
                      <ConfirmButton message="رفض هذا الطلب؟" className="btn-danger w-full">
                        <X className="h-4 w-4" />رفض
                      </ConfirmButton>
                    </form>
                  </div>
                ) : (
                  <div className="flex-1 text-sm text-slate-600">
                    {r.reviewedAt && <div>تمت المراجعة: {formatDateTime(r.reviewedAt)}</div>}
                    {r.adminNote && <div className="mt-1">ملاحظة: {r.adminNote}</div>}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
