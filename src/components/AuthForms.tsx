"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction } from "@/app/actions/auth";
import { initialState } from "@/lib/form-state";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, initialState);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next ?? ""} />
      <FormMessage state={state} />
      <div>
        <label htmlFor="email" className="label">البريد الإلكتروني</label>
        <input id="email" name="email" type="email" required autoComplete="email" dir="ltr" className="input text-end" placeholder="you@example.com" />
      </div>
      <div>
        <label htmlFor="password" className="label">كلمة المرور</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" dir="ltr" className="input text-end" />
      </div>
      <SubmitButton className="btn-gold btn-lg w-full">تسجيل الدخول</SubmitButton>
      <p className="text-center text-sm text-slate-600">
        ليس لديك حساب؟{" "}
        <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-navy-700 hover:underline">أنشئ حسابًا</Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action] = useActionState(registerAction, initialState);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <FormMessage state={state} />
      <div>
        <label htmlFor="name" className="label">الاسم بالكامل</label>
        <input id="name" name="name" required minLength={3} autoComplete="name" className="input" />
      </div>
      <div>
        <label htmlFor="email" className="label">البريد الإلكتروني</label>
        <input id="email" name="email" type="email" required autoComplete="email" dir="ltr" className="input text-end" placeholder="you@example.com" />
      </div>
      <div>
        <label htmlFor="phone" className="label">رقم الهاتف (واتساب)</label>
        <input id="phone" name="phone" type="tel" required autoComplete="tel" dir="ltr" className="input text-end" placeholder="01000000000" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className="label">كلمة المرور</label>
          <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" dir="ltr" className="input text-end" />
        </div>
        <div>
          <label htmlFor="confirm" className="label">تأكيد كلمة المرور</label>
          <input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" dir="ltr" className="input text-end" />
        </div>
      </div>
      <p className="hint">8 أحرف على الأقل.</p>
      <SubmitButton className="btn-gold btn-lg w-full">إنشاء الحساب</SubmitButton>
      <p className="text-center text-sm text-slate-600">
        لديك حساب بالفعل؟{" "}
        <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-navy-700 hover:underline">سجّل الدخول</Link>
      </p>
    </form>
  );
}
