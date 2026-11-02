import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <SearchX className="h-20 w-20 text-gold-500" />
      <h1 className="text-4xl font-black">الصفحة غير موجودة</h1>
      <p className="text-slate-600">الرابط الذي تبحث عنه غير متاح أو تم نقله.</p>
      <div className="flex gap-3">
        <Link href="/" className="btn-navy">الرئيسية</Link>
        <Link href="/courses" className="btn-gold">تصفح الكورسات</Link>
      </div>
    </div>
  );
}
