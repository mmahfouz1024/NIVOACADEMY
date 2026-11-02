import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/AuthForms";
import { getUser, safeNext } from "@/lib/auth";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await getUser();
  if (user) redirect(safeNext(next, user.role === "ADMIN" ? "/admin" : "/dashboard"));
  return (
    <>
      <h1 className="text-3xl font-black">مرحبًا بعودتك 👋</h1>
      <p className="mb-8 mt-2 text-slate-600">سجّل الدخول لمتابعة تعلمك.</p>
      <LoginForm next={next ? safeNext(next, "") || undefined : undefined} />
    </>
  );
}
