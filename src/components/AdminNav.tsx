"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, Home, LayoutDashboard, Layers, Radio, Settings, Users, Wallet, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "نظرة عامة", Icon: LayoutDashboard, exact: true },
  { href: "/admin/topups", label: "طلبات الشحن", Icon: Wallet },
  { href: "/admin/courses", label: "الكورسات", Icon: BookOpen },
  { href: "/admin/categories", label: "التصنيفات", Icon: Layers },
  { href: "/admin/live", label: "المحاضرات المباشرة", Icon: Radio },
  { href: "/admin/users", label: "المستخدمون", Icon: Users },
  { href: "/admin/settings", label: "الإعدادات", Icon: Settings },
];

export function AdminNav({ pending }: { pending: number }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const nav = (
    <nav className="space-y-1" aria-label="لوحة الإدارة">
      {ITEMS.map(({ href, label, Icon, exact }) => {
        const active = exact ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition",
              active ? "bg-gold-gradient text-navy-950 shadow-glow" : "text-slate-200 hover:bg-white/10"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="flex-1">{label}</span>
            {href === "/admin/topups" && pending > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{pending}</span>
            )}
          </Link>
        );
      })}
      <Link href="/" className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/10">
        <Home className="h-5 w-5" />العودة للموقع
      </Link>
    </nav>
  );

  return (
    <>
      <button
        className="fixed end-4 top-4 z-50 rounded-xl bg-navy-800 p-2.5 text-white shadow-lg lg:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label="القائمة"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      <div className={cn("fixed inset-0 z-40 bg-navy-950/60 lg:hidden", open ? "block" : "hidden")} onClick={() => setOpen(false)} />
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 w-72 overflow-y-auto bg-navy-gradient p-5 transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "max-lg:translate-x-full rtl:max-lg:translate-x-full"
        )}
      >
        <div className="mb-6 flex items-center gap-3 px-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-11 w-11 rounded-full" />
          <div className="leading-tight text-white">
            <div className="font-black">لوحة الإدارة</div>
            <div className="text-[11px] font-bold tracking-widest text-gold-300">NIVO ADMIN</div>
          </div>
        </div>
        {nav}
      </aside>
    </>
  );
}
