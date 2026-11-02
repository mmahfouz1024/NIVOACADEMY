"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, UserCog, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "لوحة التحكم", Icon: LayoutDashboard },
  { href: "/my-courses", label: "كورساتي", Icon: BookOpen },
  { href: "/wallet", label: "المحفظة", Icon: Wallet },
  { href: "/profile", label: "حسابي", Icon: UserCog },
];

export function StudentTabs({ name }: { name: string }) {
  const path = usePathname();
  return (
    <div className="card flex flex-wrap items-center justify-between gap-4 p-3 ps-5">
      <div className="text-sm text-slate-500">
        أهلًا، <b className="text-navy-900">{name}</b>
      </div>
      <nav className="flex gap-1 overflow-x-auto" aria-label="لوحة الطالب">
        {TABS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition",
              path === href ? "bg-navy-800 text-white" : "text-navy-800 hover:bg-navy-50"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
