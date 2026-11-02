import type { Metadata } from "next";
import { ArrowDownLeft, ArrowUpRight, Wallet, FileText, Clock3 } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { TopupForm } from "@/components/TopupForm";
import { TOPUP_METHODS, TOPUP_STATUS, TX_TYPES } from "@/lib/constants";
import { cn, formatDate, formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "المحفظة" };
export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default async function WalletPage() {
  const user = await requireUser("/wallet");
  const [settings, requests, txs] = await Promise.all([
    getSettings(),
    db.topupRequest.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.walletTransaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-navy-gradient p-7 text-white shadow-card">
          <div className="bg-grid absolute inset-0" />
          <div className="absolute -top-10 start-0 h-40 w-40 rounded-full bg-gold-400/30 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-sm font-bold text-gold-200"><Wallet className="h-5 w-5" />رصيد محفظتك</div>
            <div className="mt-3 text-4xl font-black">{formatMoney(user.balance)}</div>
            <p className="mt-3 text-xs text-slate-300">استخدم رصيدك لشراء أي كورس من الموقع.</p>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-5 text-xl">شحن الرصيد</h2>
          <TopupForm
            pay={{
              VODAFONE_CASH: settings["pay.vodafone"],
              INSTAPAY: settings["pay.instapay"],
              BANK: settings["pay.bank"],
              notes: settings["pay.notes"],
            }}
          />
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-xl">طلبات الشحن</h2>
          <div className="card overflow-x-auto">
            {requests.length === 0 ? (
              <p className="p-8 text-center text-slate-500">لا توجد طلبات شحن بعد.</p>
            ) : (
              <table className="table-x">
                <thead>
                  <tr><th>التاريخ</th><th>المبلغ</th><th>الطريقة</th><th>الحالة</th><th>الإيصال</th></tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td className="whitespace-nowrap">{formatDate(r.createdAt)}</td>
                      <td className="font-black text-navy-900">{formatMoney(r.amount)}</td>
                      <td>{TOPUP_METHODS[r.method]}</td>
                      <td>
                        <span className={cn("badge", STATUS_TONE[r.status])}>
                          {r.status === "PENDING" && <Clock3 className="h-3 w-3" />}
                          {TOPUP_STATUS[r.status]}
                        </span>
                        {r.status === "REJECTED" && r.adminNote && <div className="mt-1 text-xs text-red-600">{r.adminNote}</div>}
                      </td>
                      <td>
                        <a href={`/api/receipts/${r.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-navy-600 hover:underline">
                          <FileText className="h-4 w-4" />عرض
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl">سجل المعاملات</h2>
          <div className="card divide-y divide-slate-100">
            {txs.length === 0 ? (
              <p className="p-8 text-center text-slate-500">لا توجد معاملات بعد.</p>
            ) : (
              txs.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", t.amount > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500")}>
                      {t.amount > 0 ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-navy-900">{t.note || TX_TYPES[t.type]}</div>
                      <div className="text-xs text-slate-500">{TX_TYPES[t.type]} · {formatDate(t.createdAt)}</div>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className={cn("font-black", t.amount > 0 ? "text-emerald-600" : "text-red-500")} dir="ltr">
                      {t.amount > 0 ? "+" : "−"}{formatMoney(Math.abs(t.amount))}
                    </div>
                    <div className="text-xs text-slate-400">الرصيد: {formatMoney(t.balanceAfter)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
