import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { StudentTabs } from "@/components/StudentTabs";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="container-x py-8">
      <StudentTabs name={user.name} />
      <div className="mt-8">{children}</div>
      <p className="mt-10 text-center text-xs text-slate-400">
        تحتاج مساعدة؟ <Link href="/" className="font-bold text-navy-600 hover:underline">تواصل معنا</Link>
      </p>
    </div>
  );
}
