import Link from "next/link";
import { Icon } from "./icon";

export function Logo({
  tone = "light",
  compact = false,
}: {
  tone?: "light" | "dark";
  compact?: boolean;
}) {
  const title = tone === "dark" ? "text-white" : "text-primary";
  const sub = tone === "dark" ? "text-primary-fixed/70" : "text-on-surface-variant";
  return (
    <Link href="/beranda" className="flex items-center gap-3" aria-label="AtjehTrail, ke Beranda">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-secondary-container shadow-card">
        <Icon name="mosque" className="text-[24px]" />
      </span>
      <span className="flex flex-col">
        <span className={`font-serif text-xl font-bold leading-none tracking-tight ${title}`}>
          AtjehTrail
        </span>
        {!compact && (
          <span className={`mt-1 text-[10px] font-bold uppercase tracking-[0.14em] ${sub}`}>
            Banda Aceh &amp; Aceh Besar
          </span>
        )}
      </span>
    </Link>
  );
}
