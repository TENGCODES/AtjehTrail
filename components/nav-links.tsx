"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/beranda", label: "Beranda" },
  { href: "/jelajah", label: "Jelajah" },
  { href: "/cari", label: "Cari" },
  { href: "/jelajah?tab=paket", label: "Paket Tour", match: "/jelajah?tab=paket" },
  { href: "/pesanan", label: "Pesanan" },
  { href: "/profil", label: "Profil" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const path = link.href.split("?")[0];
        const active = path === "/beranda" ? pathname === "/beranda" : pathname.startsWith(path);
        return (
          <Link
            key={link.label}
            href={link.href}
            className={
              active
                ? "rounded-lg bg-primary-container px-3 py-2 text-sm font-bold text-white shadow-sm"
                : "rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
