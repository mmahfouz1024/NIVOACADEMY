import Image from "next/image";
import Link from "next/link";
import { Award, Radio, Wallet } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-3">
            <Image src="/logo.png" alt="نيفو" width={52} height={52} className="rounded-full" />
            <span className="text-xl font-black text-navy-900">نيفو للتدريب</span>
          </Link>
          {children}
        </div>
      </div>
      <aside className="relative hidden overflow-hidden bg-navy-gradient text-white lg:flex lg:items-center lg:justify-center">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute -top-20 start-10 h-80 w-80 rounded-full bg-gold-500/25 blur-3xl" />
        <div className="relative max-w-md space-y-8 p-12 text-center">
          <Image src="/logo-large.webp" alt="" width={260} height={260} className="mx-auto animate-float rounded-full ring-4 ring-white/10" />
          <h2 className="text-3xl font-black !text-white">تعلّم بمستوى احترافي</h2>
          <ul className="space-y-3 text-start text-slate-200">
            <li className="glass flex items-center gap-3 rounded-2xl p-4"><Radio className="h-5 w-5 text-gold-300" />كورسات مسجلة ومحاضرات لايف</li>
            <li className="glass flex items-center gap-3 rounded-2xl p-4"><Wallet className="h-5 w-5 text-gold-300" />محفظة إلكترونية لشراء الكورسات</li>
            <li className="glass flex items-center gap-3 rounded-2xl p-4"><Award className="h-5 w-5 text-gold-300" />شهادة إتمام بكود تحقق</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
