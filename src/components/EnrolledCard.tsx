import Link from "next/link";
import { Award, PlayCircle } from "lucide-react";
import { CourseCover } from "./CourseCard";
import type { EnrolledCourse } from "@/lib/progress";
import { formatNumber } from "@/lib/utils";

export function EnrolledCard({ e }: { e: EnrolledCourse }) {
  const href = `/learn/${encodeURIComponent(e.course.slug)}${e.nextLessonId ? `?lesson=${e.nextLessonId}` : ""}`;
  return (
    <div className="card group flex flex-col overflow-hidden">
      <Link href={href} className="relative block aspect-[16/9] overflow-hidden">
        <CourseCover course={e.course} />
        <span className="absolute inset-0 flex items-center justify-center bg-navy-950/0 opacity-0 transition group-hover:bg-navy-950/40 group-hover:opacity-100">
          <PlayCircle className="h-14 w-14 text-white" />
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <span className="text-xs font-bold text-gold-700">{e.course.category.name}</span>
        <h3 className="line-clamp-2 text-base font-extrabold leading-snug">{e.course.title}</h3>
        <div>
          <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
            <span>{formatNumber(e.done)} / {formatNumber(e.total)} درس</span>
            <span>{formatNumber(e.percent)}٪</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={e.percent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-gold-gradient transition-all" style={{ width: `${e.percent}%` }} />
          </div>
        </div>
        <div className="mt-auto flex gap-2 pt-2">
          <Link href={href} className="btn-navy btn-sm flex-1">
            {e.percent === 0 ? "ابدأ الآن" : e.percent === 100 ? "مراجعة" : "تابع التعلّم"}
          </Link>
          {e.certificateCode && (
            <Link href={`/certificate/${e.certificateCode}`} className="btn-gold btn-sm" title="الشهادة">
              <Award className="h-4 w-4" />شهادتي
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
