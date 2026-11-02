import type { Metadata } from "next";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { saveSettingsAction } from "@/app/actions/admin";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "الإعدادات" };

const GROUPS: { title: string; hint?: string; fields: { key: string; label: string; ltr?: boolean; multiline?: boolean }[] }[] = [
  {
    title: "بيانات التحويل (تظهر للطالب في صفحة المحفظة)",
    hint: "اكتب رقم فودافون كاش وحساب إنستا باي وبيانات الحساب البنكي الحقيقية.",
    fields: [
      { key: "pay.vodafone", label: "رقم فودافون كاش", ltr: true },
      { key: "pay.instapay", label: "عنوان إنستا باي", ltr: true },
      { key: "pay.bank", label: "الحساب البنكي (الاسم / رقم الحساب / IBAN)" },
      { key: "pay.notes", label: "تعليمات تظهر أسفل بيانات التحويل", multiline: true },
    ],
  },
  {
    title: "التواصل",
    fields: [
      { key: "contact.whatsapp", label: "رقم واتساب (بصيغة دولية بدون +، مثال 201000000000)", ltr: true },
      { key: "contact.phone", label: "رقم الهاتف المعروض", ltr: true },
      { key: "contact.email", label: "البريد الإلكتروني", ltr: true },
    ],
  },
  {
    title: "السوشيال ميديا",
    fields: [
      { key: "social.facebook", label: "فيسبوك (رابط)", ltr: true },
      { key: "social.instagram", label: "إنستجرام (رابط)", ltr: true },
      { key: "social.youtube", label: "يوتيوب (رابط)", ltr: true },
    ],
  },
];

export default async function AdminSettings() {
  const s = await getSettings();
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-3xl">الإعدادات</h1>
      <ActionForm action={saveSettingsAction} className="space-y-6">
        {GROUPS.map((g) => (
          <section key={g.title} className="card space-y-4 p-6">
            <div>
              <h2 className="text-lg">{g.title}</h2>
              {g.hint && <p className="mt-1 text-sm text-slate-500">{g.hint}</p>}
            </div>
            {g.fields.map((f) => (
              <div key={f.key}>
                <label className="label" htmlFor={f.key}>{f.label}</label>
                {f.multiline ? (
                  <textarea id={f.key} name={f.key} rows={3} defaultValue={s[f.key]} className="input" />
                ) : (
                  <input id={f.key} name={f.key} defaultValue={s[f.key]} dir={f.ltr ? "ltr" : undefined} className={f.ltr ? "input text-end" : "input"} />
                )}
              </div>
            ))}
          </section>
        ))}
        <SubmitButton className="btn-gold btn-lg">حفظ الإعدادات</SubmitButton>
      </ActionForm>
    </div>
  );
}
