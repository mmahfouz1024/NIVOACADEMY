import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getEnrolledCourses } from "@/lib/progress";
import { EnrolledCard } from "@/components/EnrolledCard";

export const metadata: Metadata = { title: "كورساتي" };
export const dynamic = "force-dynamic";

export default async function MyCoursesPage() {
  const user = await requireUser("/my-courses");
  const enrolled = await getEnrolledCourses(user.id);
  return (
    <div>
      <h1 className="mb-6 text-3xl">كورساتي</h1>
      {enrolled.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-20 text-center">
          <BookOpen className="h-14 w-14 text-slate-300" />
          <p className="font-bold text-slate-600">لم تشترك في أي كورس بعد.</p>
          <Link href="/courses" className="btn-gold">تصفح الكورسات</Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrolled.map((e) => <EnrolledCard key={e.enrollmentId} e={e} />)}
        </div>
      )}
    </div>
  );
}
