import Link from "next/link";
import { Icon } from "./icon";
import { Logo } from "./logo";

const groups = [
  {
    title: "Jelajah",
    links: [
      { label: "Destinasi", href: "/jelajah" },
      { label: "Penginapan", href: "/jelajah?tab=penginapan" },
      { label: "Pemandu Lokal", href: "/jelajah?tab=pemandu" },
      { label: "Paket Tour", href: "/jelajah?tab=paket" },
    ],
  },
  {
    title: "Partisipasi",
    links: [
      { label: "Usulkan Tempat", href: "/usulkan" },
      { label: "Daftar Mitra", href: "/mitra" },
      { label: "Pesanan Saya", href: "/pesanan" },
      { label: "Profil", href: "/profil" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="no-print mt-16 bg-primary-container text-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo tone="dark" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-fixed/75">
            Platform wisata terpadu untuk Banda Aceh dan Aceh Besar: destinasi, penginapan,
            pemandu lokal, dan paket tour dengan verifikasi gampong.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-secondary-container/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-secondary-container">
            <Icon name="verified" className="text-[16px]" />
            Terverifikasi bersama gampong
          </p>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary-container">
              {group.title}
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-fixed/75 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-primary-fixed/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 AtjehTrail. Prototipe tugas Digital Entrepreneurship, data contoh.</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Pembayaran pada prototipe hanya simulasi.</span>
            <a href="/images/ATTRIBUTION.md" target="_blank" className="font-semibold text-primary-fixed/80 hover:text-white">
              Kredit foto
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
