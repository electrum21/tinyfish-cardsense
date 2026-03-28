"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

const links: { href: Route; label: string }[] = [
  { href: "/", label: "Dashboard" },
  { href: "/cards", label: "Cards" },
  { href: "/signup-offers", label: "Signup Offers" },
  { href: "/merchant-offers", label: "Merchant Offers" },
  { href: "/advisor", label: "Advisor" }
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1020]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/20 text-xl">
            💳
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight">CardSense</div>
            <div className="text-sm text-white/55">Singapore card intelligence</div>
          </div>
        </Link>

        <nav className="flex flex-wrap gap-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-cyan-400 text-slate-900"
                    : "border border-white/10 bg-white/5 text-white/75 hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}