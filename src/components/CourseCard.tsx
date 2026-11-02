import Link from "next/link";
import { Clock, PlayCircle, Radio, Users } from "lucide-react";
import { CategoryIcon } from "./icons";
import { LEVELS, MODES } from "@/lib/constants";
import { cn, discountPercent, formatPrice, formatNumber } from "@/lib/utils";

const GRADIENTS = [
  "from-navy-900 via-navy-700 to-navy-500",
  "from-navy-950 via-navy-800 to-gold-700",
  "from-navy-800 via-navy-600 to-sky-500",
  "from-navy-900 via-indigo-700 to-navy-500",
  "from-navy-950 via-navy-700 to-emerald-700",
  "from-navy-900 via-violet-800 to-navy-600",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export type CardCourse = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  thumbnail: string | null;
  price: number;
  oldPrice: number | null;
  level: string;
  mode: string;
  durationHours: number;
  instructorName: string;
  category: { name: string; icon: string };
  _count: { lessons: number; enrollments: number };
};

export function CourseCover({
  course,
  className,
}: {
  course: Pick<CardCourse, "id" | "title" | "thumbnail" | "category">;
  className?: string;
}) {
  if (course.thumbnail) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={course.thumbnail} alt={course.title} loading="lazy" className={cn("h-full w-full object-cover", className)} />
    );
  }
  const g = GRADIENTS[hash(course.id) % GRADIENTS.length];
  return (
    <div className={cn("relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br", g, className)}>
      <div className="bg-grid absolute inset-0 opacity-60" />
      <div className="absolute -bottom-10 -start-10 h-40 w-40 rounded-full bg-gold-400/25 blur-2xl" />
      <CategoryIcon name={course.category.icon} className="relative h-16 w-16 text-gold-300 drop-shadow-lg transition duration-500 group-hover:scale-110" />
    </div>
  );
}

export function CourseCard({ course }: { course: CardCourse }) {
  const off = discountPercent(course.price, course.oldPrice);
  return (
    <Link
      href={`/courses/${encodeURIComponent(course.slug)}`}
      className="card group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <CourseCover course={course} />
        <span className="badge absolute start-3 top-3 bg-white/90 text-navy-800 backdrop-blur">{course.category.name}</span>
        {course.mode !== "RECORDED" && (
          <span className="badge absolute end-3 top-3 bg-red-500 text-white">
            <Radio className="h-3 w-3" />
            {MODES[course.mode]}
          </span>
        )}
        {off > 0 && <span className="badge absolute bottom-3 end-3 bg-gold-400 text-navy-950">خصم {formatNumber(off)}٪</span>}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 min-h-[3.2rem] text-lg font-extrabold leading-snug text-navy-900 transition group-hover:text-navy-600">
          {course.title}
        </h3>
        {course.instructorName && <p className="mt-1 text-sm text-slate-500">{course.instructorName}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1"><PlayCircle className="h-4 w-4 text-gold-600" />{formatNumber(course._count.lessons)} درس</span>
          {course.durationHours > 0 && (
            <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4 text-gold-600" />{formatNumber(course.durationHours)} ساعة</span>
          )}
          <span className="inline-flex items-center gap-1"><Users className="h-4 w-4 text-gold-600" />{formatNumber(course._count.enrollments)}</span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-5">
          <span className="rounded-lg bg-navy-50 px-2.5 py-1 text-xs font-bold text-navy-700">{LEVELS[course.level]}</span>
          <div className="text-end">
            {course.oldPrice && course.oldPrice > course.price && (
              <div className="text-xs text-slate-400 line-through">{formatPrice(course.oldPrice)}</div>
            )}
            <div className="text-xl font-black text-navy-800">{formatPrice(course.price)}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export const courseCardInclude = {
  category: { select: { name: true, icon: true } },
  _count: { select: { lessons: true, enrollments: true } },
} as const;
