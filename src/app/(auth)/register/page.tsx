import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/AuthForms";
import { getUser, safeNext } from "@/lib/auth";

export const metadata: Metadata = { title: "إنشاء حساب" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await getUser();
  if (user) redirect(safeNext(next));
  return (
    <>
      <h1 className="text-3xl font-black">ابدأ رحلتك مع نيفو</h1>
      <p className="mb-8 mt-2 text-slate-600">أنشئ حسابك مجانًا في أقل من دقيقة.</p>
      <RegisterForm next={next ? safeNext(next, "") || undefined : undefined} />
    </>
  );
}
