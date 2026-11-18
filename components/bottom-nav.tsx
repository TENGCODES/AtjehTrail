"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icon";

const items = [
  { href: "/beranda", label: "Beranda", icon: "home" },
  { href: "/jelajah", label: "Jelajah", icon: "explore" },
  { href: "/pesanan", label: "Pesanan", icon: "receipt_long" },
  { href: "/profil", label: "Profil", icon: "person" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navigasi bawah"
      className="no-print fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant/40 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold transition-colors ${
                active ? "text-primary" : "text-outline hover:text-on-surface-variant"
              }`}
            >
              <span
                className={`flex h-8 w-12 items-center justify-center rounded-full ${
                  active ? "bg-primary-container text-secondary-container" : ""
                }`}
              >
                <Icon name={item.icon} fill={active} className="text-[21px]" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
