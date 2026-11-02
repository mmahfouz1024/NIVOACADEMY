"use client";

import { useActionState } from "react";
import { changePasswordAction, updateProfileAction } from "@/app/actions/student";
import { initialState } from "@/lib/form-state";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

export function ProfileForm({ name, phone, email }: { name: string; phone: string; email: string }) {
  const [state, action] = useActionState(updateProfileAction, initialState);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <div>
        <label className="label" htmlFor="p-email">البريد الإلكتروني</label>
        <input id="p-email" value={email} disabled dir="ltr" className="input text-end" readOnly />
      </div>
      <div>
        <label className="label" htmlFor="p-name">الاسم</label>
        <input id="p-name" name="name" defaultValue={name} required minLength={3} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="p-phone">رقم الهاتف</label>
        <input id="p-phone" name="phone" defaultValue={phone} required dir="ltr" className="input text-end" />
      </div>
      <SubmitButton className="btn-navy">حفظ التغييرات</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePasswordAction, initialState);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <div>
        <label className="label" htmlFor="c-cur">كلمة المرور الحالية</label>
        <input id="c-cur" name="current" type="password" required autoComplete="current-password" dir="ltr" className="input text-end" />
      </div>
      <div>
        <label className="label" htmlFor="c-new">كلمة المرور الجديدة</label>
        <input id="c-new" name="next" type="password" required minLength={8} autoComplete="new-password" dir="ltr" className="input text-end" />
      </div>
      <div>
        <label className="label" htmlFor="c-conf">تأكيد كلمة المرور</label>
        <input id="c-conf" name="confirm" type="password" required minLength={8} autoComplete="new-password" dir="ltr" className="input text-end" />
      </div>
      <SubmitButton className="btn-navy">تغيير كلمة المرور</SubmitButton>
    </form>
  );
}
