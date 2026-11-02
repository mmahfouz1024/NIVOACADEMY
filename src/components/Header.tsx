import Link from "next/link";
import { LayoutDashboard, LogOut, Shield, Wallet } from "lucide-react";
import { Logo } from "./Logo";
import { MobileNav, type NavItem } from "./MobileNav";
import { getUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { formatMoney } from "@/lib/utils";

const NAV: NavItem[] = [
  { href: "/", label: "الرئيسية" },
  { href: "/courses", label: "الكورسات" },
  { href: "/live", label: "المحاضرات المباشرة" },
  { href: "/#how", label: "كيف تبدأ؟" },
];

async function AuthArea({ mobile = false }: { mobile?: boolean }) {
  const user = await getUser();
  const wrap = mobile ? "flex flex-col gap-2" : "flex items-center gap-2";

  if (!user) {
    return (
      <div className={wrap}>
        <Link href="/login" className="btn-ghost">
          تسجيل الدخول
        </Link>
        <Link href="/register" className="btn-gold">
          إنشاء حساب
        </Link>
      </div>
    );
  }
  return (
    <div className={wrap}>
      <Link href="/wallet" className="btn-outline" title="محفظتي">
        <Wallet className="h-4 w-4 text-gold-600" />
        {formatMoney(user.balance)}
      </Link>
      {user.role === "ADMIN" && (
        <Link href="/admin" className="btn-navy">
          <Shield className="h-4 w-4" />
          الإدارة
        </Link>
      )}
      <Link href="/dashboard" className="btn-ghost">
        <LayoutDashboard className="h-4 w-4" />
        {mobile ? "لوحة التحكم" : user.name.split(" ")[0]}
      </Link>
      <form action={logoutAction}>
        <button className="btn-ghost text-red-600 hover:bg-red-50" aria-label="تسجيل الخروج">
          <LogOut className="h-4 w-4" />
          {mobile && "تسجيل الخروج"}
        </button>
      </form>
    </div>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="container-x relative flex h-[72px] items-center justify-between gap-4">
        <Logo size={46} />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
          {NAV.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="rounded-xl px-4 py-2 text-sm font-bold text-navy-800 transition hover:bg-navy-50 hover:text-navy-600"
            >
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:block">
          <AuthArea />
        </div>
        <MobileNav items={NAV}>
          <AuthArea mobile />
        </MobileNav>
      </div>
    </header>
  );
}
