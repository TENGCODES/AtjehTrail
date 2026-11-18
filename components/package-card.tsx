import Image from "next/image";
import Link from "next/link";
import type { Paket } from "@prisma/client";
import { formatRupiah, parseJson } from "@/lib/format";
import { Icon } from "./icon";

export function PackageCard({ paket }: { paket: Paket }) {
  const inklusi = parseJson<string[]>(paket.inklusi, []);
  return (
    <Link
      href={`/paket/${paket.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-high">
        <Image
          src={paket.foto}
          alt={paket.judul}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded bg-primary-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary-container">
          {paket.durasi}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-on-surface-variant">
          <span className="inline-flex items-center gap-1">
            <Icon name="schedule" className="text-[14px]" />
            {paket.durasi}
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Icon name="group" className="text-[14px]" />
            Min. {paket.minimalOrang} orang
          </span>
        </div>
        <h3 className="line-clamp-2 font-serif text-lg font-semibold leading-snug text-primary transition-colors group-hover:text-secondary">
          {paket.judul}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-on-surface-variant">{paket.deskripsi}</p>
        <ul className="mt-1 space-y-1">
          {inklusi.slice(0, 2).map((item) => (
            <li key={item} className="flex items-start gap-1.5 text-[11px] text-on-surface-variant">
              <Icon name="check_circle" fill className="mt-px text-[14px] text-verified" />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-surface-container pt-3">
          <div>
            <p className="text-[10px] text-on-surface-variant">Mulai dari</p>
            <p className="text-base font-bold text-primary">
              {formatRupiah(paket.hargaPerOrang)}
              <span className="text-[10px] font-medium text-on-surface-variant">/orang</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded bg-secondary-container px-3 py-1.5 text-xs font-bold text-on-secondary-container">
            Lihat paket
            <Icon name="arrow_forward" className="text-[15px]" />
          </span>
        </div>
      </div>
    </Link>
  );
}
