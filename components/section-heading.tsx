import Link from "next/link";
import { Icon } from "./icon";

export function SectionHeading({
  kicker,
  title,
  description,
  href,
  actionLabel = "Lihat semua",
}: {
  kicker?: string;
  title: string;
  description?: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {kicker && (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">
            {kicker}
          </p>
        )}
        <h2 className="mt-1 font-serif text-2xl font-semibold text-primary sm:text-3xl">{title}</h2>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/50 bg-white px-3 py-2 text-xs font-bold text-primary transition-colors hover:border-primary hover:bg-surface-container-low"
        >
          {actionLabel}
          <Icon name="arrow_forward" className="text-[15px]" />
        </Link>
      )}
    </div>
  );
}
