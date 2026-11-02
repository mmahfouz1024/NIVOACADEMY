"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Copy, Check, ImageUp } from "lucide-react";
import { requestTopupAction } from "@/app/actions/student";
import { initialState } from "@/lib/form-state";
import { MAX_TOPUP, MIN_TOPUP, TOPUP_METHODS } from "@/lib/constants";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

type Pay = { VODAFONE_CASH: string; INSTAPAY: string; BANK: string; notes: string };

export function TopupForm({ pay }: { pay: Pay }) {
  const [state, action] = useActionState(requestTopupAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [method, setMethod] = useState("VODAFONE_CASH");
  const [amount, setAmount] = useState("");
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setAmount("");
      setFileName("");
    }
  }, [state]);

  const target = method === "VODAFONE_CASH" ? pay.VODAFONE_CASH : method === "INSTAPAY" ? pay.INSTAPAY : method === "BANK" ? pay.BANK : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <form ref={formRef} action={action} className="space-y-5">
      <FormMessage state={state} />

      <div>
        <span className="label">1) اختر طريقة التحويل</span>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(TOPUP_METHODS).map(([k, v]) => (
            <label
              key={k}
              className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-bold transition ${
                method === k ? "border-navy-800 bg-navy-800 text-white" : "border-slate-200 bg-white text-navy-800 hover:border-gold-400"
              }`}
            >
              <input type="radio" name="method" value={k} checked={method === k} onChange={() => setMethod(k)} className="sr-only" />
              {v}
            </label>
          ))}
        </div>
      </div>

      {target && (
        <div className="rounded-2xl border border-gold-300 bg-gold-50 p-4">
          <div className="text-xs font-bold text-gold-800">حوّل إلى</div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <span className="break-all text-lg font-black text-navy-900" dir="ltr">{target}</span>
            <button type="button" onClick={copy} className="btn-outline btn-sm shrink-0">
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copied ? "تم النسخ" : "نسخ"}
            </button>
          </div>
        </div>
      )}
      {pay.notes && <p className="text-sm leading-7 text-slate-600">{pay.notes}</p>}

      <div>
        <label htmlFor="amount" className="label">2) المبلغ الذي حولته (ج.م)</label>
        <input
          id="amount" name="amount" type="number" inputMode="numeric" required min={MIN_TOPUP} max={MAX_TOPUP} step={1}
          value={amount} onChange={(e) => setAmount(e.target.value)} className="input" placeholder={`أقل مبلغ ${MIN_TOPUP}`}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {[100, 200, 500, 1000, 2000].map((n) => (
            <button type="button" key={n} onClick={() => setAmount(String(n))} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-navy-800 hover:border-gold-400">
              {n.toLocaleString("ar-EG")}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="senderRef" className="label">رقم المحول منه / اسم المحوِّل (اختياري)</label>
        <input id="senderRef" name="senderRef" maxLength={120} className="input" placeholder="مثال: 01012345678" />
      </div>

      <div>
        <span className="label">3) ارفع صورة إيصال التحويل</span>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-gold-400 hover:bg-gold-50">
          <ImageUp className="h-8 w-8 text-navy-600" />
          <span className="text-sm font-bold text-navy-800">{fileName || "اضغط لاختيار صورة الإيصال"}</span>
          <span className="text-xs text-slate-500">JPG / PNG / WEBP / PDF – حتى 5 ميجا</span>
          <input
            name="receipt" type="file" required accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
        </label>
      </div>

      <SubmitButton className="btn-gold btn-lg w-full" pendingText="جارٍ الإرسال...">إرسال طلب الشحن</SubmitButton>
    </form>
  );
}
