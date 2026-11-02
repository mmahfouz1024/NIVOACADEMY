import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { db } from "@/lib/db";
import { PrintButton } from "@/components/PrintButton";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "شهادة إتمام", robots: { index: false } };

export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const en = await db.enrollment.findUnique({
    where: { certificateCode: code.toUpperCase() },
    include: { user: { select: { name: true } }, course: { select: { title: true, instructorName: true, durationHours: true } } },
  });
  if (!en || !en.completedAt) notFound();

  return (
    <div className="min-h-screen bg-slate-200 px-4 py-8">
      <div className="no-print mx-auto mb-6 flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <Link href="/" className="font-bold text-navy-700 hover:underline">← العودة للموقع</Link>
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
          <BadgeCheck className="h-5 w-5" />
          شهادة موثّقة · الكود {en.certificateCode}
        </div>
        <PrintButton />
      </div>

      <div className="print-page mx-auto aspect-[1.414/1] w-full max-w-5xl bg-white p-3 shadow-2xl">
        <div className="relative flex h-full flex-col items-center justify-between border-[10px] border-double border-gold-500 bg-white px-8 py-8 text-center sm:px-16">
          <div className="absolute inset-3 border border-navy-800/30" />
          <Image src="/logo.png" alt="" width={110} height={110} className="relative rounded-full" />

          <div className="relative">
            <p className="text-sm font-bold tracking-[.4em] text-gold-600">CERTIFICATE OF COMPLETION</p>
            <h1 className="mt-2 text-4xl font-black text-navy-900 sm:text-5xl">شهادة إتمام</h1>
          </div>

          <div className="relative space-y-3">
            <p className="text-slate-500">تشهد أكاديمية نيفو للتدريب بأن</p>
            <p className="gold-text border-b-2 border-gold-300 px-10 pb-2 text-4xl font-black sm:text-5xl">{en.user.name}</p>
            <p className="text-slate-500">قد أتمّ بنجاح كورس</p>
            <p className="text-2xl font-extrabold text-navy-800 sm:text-3xl">{en.course.title}</p>
          </div>

          <div className="relative grid w-full grid-cols-3 items-end gap-4 text-sm">
            <div>
              <div className="font-bold text-navy-900">{formatDate(en.completedAt)}</div>
              <div className="mx-auto mt-1 h-px w-32 bg-slate-300" />
              <div className="mt-1 text-xs text-slate-500">تاريخ الإتمام</div>
            </div>
            <div>
              <div className="font-black text-navy-800" dir="ltr">{en.certificateCode}</div>
              <div className="mt-1 text-xs text-slate-500">كود التحقق</div>
            </div>
            <div>
              <div className="font-bold text-navy-900">{en.course.instructorName || "إدارة الأكاديمية"}</div>
              <div className="mx-auto mt-1 h-px w-32 bg-slate-300" />
              <div className="mt-1 text-xs text-slate-500">المدرب</div>
            </div>
          </div>
        </div>
      </div>
      <p className="no-print mt-4 text-center text-xs text-slate-500">للتحقق من صحة الشهادة افتح هذا الرابط أو أدخل الكود على الموقع.</p>
    </div>
  );
}
