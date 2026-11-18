import Link from "next/link";
import { getCurrentUser, initials } from "@/lib/auth";
import { keluarAction } from "@/lib/actions/auth";
import { Icon } from "./icon";
import { Logo } from "./logo";
import { NavLinks } from "./nav-links";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="no-print sticky top-0 z-50 border-b border-outline-variant/40 bg-white/90 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo compact />
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navigasi utama">
          <NavLinks />
        </nav>
        <div className="flex items-center gap-1">
          <Link
            href="/cari"
            aria-label="Cari"
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
          >
            <Icon name="search" className="text-[22px]" />
          </Link>
          {user ? (
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl p-1 transition-colors hover:bg-surface-container-low [&::-webkit-details-marker]:hidden">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {initials(user.nama)}
                </span>
                <span className="hidden flex-col pl-1 text-left xl:flex">
                  <span className="text-xs font-bold leading-tight text-on-surface">{user.nama}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    {user.mitra ? "Mitra" : "Wisatawan"}
                  </span>
                </span>
                <Icon name="expand_more" className="hidden text-[18px] text-outline xl:block" />
              </summary>
              <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-outline-variant/40 bg-white p-2 shadow-card-hover">
                <div className="mb-1 border-b border-surface-container px-3 py-2">
                  <p className="text-sm font-bold text-on-surface">{user.nama}</p>
                  <p className="text-xs text-on-surface-variant">{user.email}</p>
                </div>
                <MenuLink href="/profil" icon="badge" label="Profil Saya" />
                <MenuLink href="/profil#favorit" icon="favorite" label="Favorit" />
                <MenuLink href="/pesanan" icon="receipt_long" label="Pesanan &amp; E-voucher" />
                <MenuLink href="/usulkan" icon="add_location_alt" label="Usulkan Tempat" />
                <MenuLink href="/mitra" icon="handshake" label="Daftar Mitra" />
                <form action={keluarAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-error transition-colors hover:bg-error-container"
                  >
                    <Icon name="logout" className="text-[18px]" />
                    Keluar
                  </button>
                </form>
              </div>
            </details>
          ) : (
            <Link
              href="/masuk"
              className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-primary"
            >
              <Icon name="login" className="text-[18px]" />
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
    >
      <Icon name={icon} className="text-[18px]" />
      {label}
    </Link>
  );
}
