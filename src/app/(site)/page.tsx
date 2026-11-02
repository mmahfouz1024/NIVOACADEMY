import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Award, BadgeCheck, BarChart3, Headphones, Radio, ShieldCheck, Sparkles, Wallet, Video,
  UserPlus, Banknote, ShoppingCart, GraduationCap, Languages, BrainCircuit, Megaphone,
} from "lucide-react";
import { db } from "@/lib/db";
import { Reveal } from "@/components/Reveal";
import { CourseCard, courseCardInclude } from "@/components/CourseCard";
import { CategoryIcon } from "@/components/icons";
import { formatDateTime, formatNumber } from "@/lib/utils";
import { getSettings, whatsappLink } from "@/lib/settings";

export const dynamic = "force-dynamic";

const STEPS = [
  { Icon: UserPlus, title: "أنشئ حسابك", text: "سجّل مجانًا في أقل من دقيقة وابدأ رحلتك." },
  { Icon: Banknote, title: "اشحن محفظتك", text: "حوّل المبلغ، ارفع صورة الإيصال، ويُضاف رصيدك بعد المراجعة." },
  { Icon: ShoppingCart, title: "اشترِ ما تريد", text: "اختر الكورس المناسب واشترِه من رصيد محفظتك بضغطة واحدة." },
  { Icon: GraduationCap, title: "تعلّم واحصل على شهادتك", text: "أكمل الدروس وتابع تقدمك واستلم شهادة بكود تحقق." },
];

const FEATURES = [
  { Icon: Video, title: "مسجل ولايف", text: "شاهد الدروس في أي وقت، أو انضم للمحاضرات المباشرة مع المدربين." },
  { Icon: Award, title: "شهادات إتمام", text: "شهادة رسمية بكود تحقق عند إكمالك الكورس بالكامل." },
  { Icon: BarChart3, title: "تتبع تقدمك", text: "لوحة تحكم توضح نسبة إنجازك وتكمل من حيث توقفت." },
  { Icon: Wallet, title: "محفظة إلكترونية", text: "اشحن مرة واحدة واشترِ أكثر من كورس بدون تكرار التحويل." },
  { Icon: ShieldCheck, title: "حسابك وبياناتك آمنة", text: "حماية كاملة لبياناتك وإيصالاتك، ولا يصل إليها إلا فريق الإدارة." },
  { Icon: Headphones, title: "دعم مباشر", text: "فريق جاهز للرد عليك عبر واتساب في أي وقت." },
];

export default async function HomePage() {
  const [featured, latest, categories, upcoming, courseCount, lessonCount, studentCount, settings] =
    await Promise.all([
      db.course.findMany({ where: { published: true, featured: true }, include: courseCardInclude, orderBy: { createdAt: "desc" }, take: 6 }),
      db.course.findMany({ where: { published: true }, include: courseCardInclude, orderBy: { createdAt: "desc" }, take: 6 }),
      db.category.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { courses: { where: { published: true } } } } } }),
      db.liveSession.findMany({ where: { published: true, startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, take: 3, include: { course: { select: { title: true } } } }),
      db.course.count({ where: { published: true } }),
      db.lesson.count({ where: { course: { published: true } } }),
      db.user.count({ where: { role: "STUDENT" } }),
      getSettings(),
    ]);

  const shown = featured.length >= 3 ? featured : latest;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-gradient text-white">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute -top-24 start-1/4 h-96 w-96 rounded-full bg-gold-500/20 blur-3xl" />
        <div className="absolute -bottom-32 end-10 h-96 w-96 rounded-full bg-navy-400/30 blur-3xl" />

        <div className="container-x relative grid items-center gap-12 py-16 lg:grid-cols-[1.2fr_1fr] lg:py-24">
          <Reveal>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold text-gold-200">
              <Sparkles className="h-4 w-4" />
              موسم جديد من التعلّم يبدأ الآن
            </span>
            <h1 className="mt-6 text-balance text-4xl font-black leading-[1.25] !text-white sm:text-5xl lg:text-6xl">
              استثمر وقتك وتعلّم <span className="gold-text">اللغات والذكاء الاصطناعي</span> والتسويق مع نيفو
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200">
              كورسات احترافية في كل التخصصات، مسجلة ولايف، يقدمها مدربون متخصصون، مع شهادة إتمام وتتبع كامل لتقدمك.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses" className="btn-gold btn-lg">
                استكشف الكورسات
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <Link href="/register" className="btn btn-lg glass text-white hover:bg-white/20">
                ابدأ مجانًا
              </Link>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
              {[
                [courseCount, "كورس"],
                [lessonCount, "درس"],
                [categories.length, "تخصص"],
              ].map(([n, l]) => (
                <div key={String(l)}>
                  <dt className="text-3xl font-black text-gold-300">{formatNumber(Number(n))}+</dt>
                  <dd className="text-sm text-slate-300">{l}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.15} className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-6 rounded-full bg-gold-400/30 blur-3xl" />
            <Image
              src="/logo-large.webp"
              alt="شعار نيفو للتدريب"
              width={520}
              height={520}
              priority
              className="relative mx-auto animate-float rounded-full shadow-2xl shadow-black/40 ring-4 ring-white/10"
            />
            <div className="glass absolute -start-2 top-10 flex items-center gap-2 rounded-2xl px-4 py-3 shadow-xl animate-float [animation-delay:1s]">
              <Languages className="h-5 w-5 text-gold-300" /><span className="text-sm font-bold">لغات</span>
            </div>
            <div className="glass absolute -end-2 top-1/2 flex items-center gap-2 rounded-2xl px-4 py-3 shadow-xl animate-float [animation-delay:2s]">
              <BrainCircuit className="h-5 w-5 text-gold-300" /><span className="text-sm font-bold">ذكاء اصطناعي</span>
            </div>
            <div className="glass absolute -bottom-2 start-8 flex items-center gap-2 rounded-2xl px-4 py-3 shadow-xl animate-float [animation-delay:3s]">
              <Megaphone className="h-5 w-5 text-gold-300" /><span className="text-sm font-bold">تسويق</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-x py-20" id="categories">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="section-title">تخصصات لكل اهتمام</h2>
          <p className="mt-3 text-slate-600">اختر مجالك وابدأ، ونضيف تخصصات وكورسات جديدة باستمرار.</p>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.04}>
              <Link
                href={`/courses?category=${encodeURIComponent(c.slug)}`}
                className="card group flex flex-col items-center gap-3 p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-gold-400 hover:shadow-glow"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-800 text-gold-300 transition group-hover:scale-110 group-hover:bg-gold-gradient group-hover:text-navy-950">
                  <CategoryIcon name={c.icon} className="h-7 w-7" />
                </span>
                <span className="font-extrabold text-navy-900">{c.name}</span>
                <span className="text-xs font-semibold text-slate-500">{formatNumber(c._count.courses)} كورس</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURED COURSES */}
      {shown.length > 0 && (
        <section className="bg-white py-20">
          <div className="container-x">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="section-title">كورسات مميزة</h2>
                <p className="mt-2 text-slate-600">اختيارات الأكاديمية لك في هذا الموسم.</p>
              </div>
              <Link href="/courses" className="btn-outline">
                عرض الكل <ArrowLeft className="h-4 w-4" />
              </Link>
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((c, i) => (
                <Reveal key={c.id} delay={i * 0.06}>
                  <CourseCard course={c} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW */}
      <section id="how" className="container-x scroll-mt-24 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="section-title">كيف تبدأ مع نيفو؟</h2>
          <p className="mt-3 text-slate-600">أربع خطوات بسيطة بين طموحك وأول درس.</p>
        </Reveal>
        <div className="relative mt-14 grid gap-6 md:grid-cols-4">
          {STEPS.map(({ Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="card relative h-full p-6 text-center">
                <span className="absolute -top-4 start-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-gold-gradient text-sm font-black text-navy-950 rtl:translate-x-1/2">
                  {formatNumber(i + 1)}
                </span>
                <span className="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-700">
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="mt-4 text-lg">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* LIVE */}
      {upcoming.length > 0 && (
        <section className="bg-navy-950 py-20 text-white">
          <div className="container-x">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="section-title !text-white">
                  <Radio className="me-2 inline h-8 w-8 animate-pulse text-red-400" />
                  محاضرات مباشرة قادمة
                </h2>
                <p className="mt-2 text-slate-300">انضم لحصص لايف وتفاعل مباشرة مع المدرب.</p>
              </div>
              <Link href="/live" className="btn glass text-white hover:bg-white/20">كل المواعيد</Link>
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {upcoming.map((s) => (
                <Reveal key={s.id}>
                  <div className="glass h-full rounded-2xl p-6">
                    <span className="badge bg-red-500/90 text-white">لايف</span>
                    <h3 className="mt-3 text-lg !text-white">{s.title}</h3>
                    {s.course && <p className="mt-1 text-sm text-gold-200">{s.course.title}</p>}
                    <p className="mt-4 text-sm font-semibold text-slate-200">{formatDateTime(s.startsAt)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WHY */}
      <section className="container-x py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="section-title">لماذا نيفو؟</h2>
          <p className="mt-3 text-slate-600">تجربة تعلم متكاملة بمستوى احترافي.</p>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.05}>
              <div className="card flex h-full gap-4 p-6 transition hover:border-gold-300">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-gradient text-navy-950">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-lg">{title}</h3>
                  <p className="mt-1 text-sm leading-7 text-slate-600">{text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-navy-gradient px-6 py-14 text-center text-white sm:px-14">
            <div className="bg-grid absolute inset-0" />
            <div className="absolute -top-20 end-10 h-64 w-64 rounded-full bg-gold-400/25 blur-3xl" />
            <div className="relative">
              <BadgeCheck className="mx-auto h-12 w-12 text-gold-300" />
              <h2 className="mt-4 text-3xl font-black !text-white sm:text-4xl">جاهز تبدأ رحلتك؟</h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-200">
                انضم إلى {studentCount > 0 ? `${formatNumber(studentCount)}+ طالب` : "طلاب نيفو"} وابدأ أول كورس لك اليوم.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/register" className="btn-gold btn-lg">أنشئ حسابك الآن</Link>
                <a href={whatsappLink(settings["contact.whatsapp"])} target="_blank" rel="noopener noreferrer" className="btn btn-lg glass text-white hover:bg-white/20">
                  تحدث معنا على واتساب
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
