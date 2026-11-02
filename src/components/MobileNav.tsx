"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export type NavItem = { href: string; label: string };

export function MobileNav({ items, children }: { items: NavItem[]; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button
        aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-xl p-2 text-navy-800 hover:bg-navy-50"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full border-t border-slate-200 bg-white p-4 shadow-xl">
          <nav className="flex flex-col gap-1">
            {items.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 font-bold text-navy-800 hover:bg-navy-50"
              >
                {i.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 border-t border-slate-100 pt-3" onClick={() => setOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
