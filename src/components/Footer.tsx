import Link from "next/link";
import { Facebook, Instagram, Mail, MessageCircle, Phone, Youtube } from "lucide-react";
import { Logo } from "./Logo";
import { getSettings, whatsappLink } from "@/lib/settings";
import { db } from "@/lib/db";

export async function Footer() {
  const [s, cats] = await Promise.all([
    getSettings(),
    db.category.findMany({ orderBy: { order: "asc" }, take: 6 }),
  ]);
  const socials = [
    { href: s["social.facebook"], Icon: Facebook, label: "فيسبوك" },
    { href: s["social.instagram"], Icon: Instagram, label: "إنستجرام" },
    { href: s["social.youtube"], Icon: Youtube, label: "يوتيوب" },
  ].filter((x) => x.href);

  return (
    <footer className="mt-24 bg-navy-gradient text-slate-200">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo light size={56} />
          <p className="mt-4 text-sm leading-7 text-slate-300">
            منصة تدريب أونلاين نصنع فيها مهاراتك في اللغات والذكاء الاصطناعي والبرمجة والتسويق، بكورسات مسجلة ولايف وشهادات معتمدة.
          </p>
          {socials.length > 0 && (
            <div className="mt-4 flex gap-2">
              {socials.map(({ href, Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="glass rounded-xl p-2.5 transition hover:bg-white/20">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-4 text-base font-bold text-gold-300">التخصصات</h3>
          <ul className="space-y-2 text-sm">
            {cats.map((c) => (
              <li key={c.id}>
                <Link href={`/courses?category=${encodeURIComponent(c.slug)}`} className="transition hover:text-gold-300">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-base font-bold text-gold-300">روابط سريعة</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/courses" className="hover:text-gold-300">كل الكورسات</Link></li>
            <li><Link href="/live" className="hover:text-gold-300">المحاضرات المباشرة</Link></li>
            <li><Link href="/wallet" className="hover:text-gold-300">محفظتي</Link></li>
            <li><Link href="/register" className="hover:text-gold-300">إنشاء حساب</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-base font-bold text-gold-300">تواصل معنا</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-gold-300" />
              <a href={whatsappLink(s["contact.whatsapp"])} target="_blank" rel="noopener noreferrer" className="hover:text-gold-300">واتساب</a>
            </li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold-300" /><span dir="ltr">{s["contact.phone"]}</span></li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold-300" />{s["contact.email"]}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} نيفو للتدريب – NIVO for Training. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
