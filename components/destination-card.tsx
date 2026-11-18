import Image from "next/image";
import Link from "next/link";
import type { Destinasi } from "@prisma/client";
import { formatRupiah } from "@/lib/format";
import { Icon } from "./icon";
import { LencanaPermata, LencanaTerverifikasi } from "./badges";

export function DestinationCard({
  destinasi,
  className = "",
  horizontal = false,
  jarak,
}: {
  destinasi: Destinasi;
  className?: string;
  horizontal?: boolean;
  jarak?: number;
}) {
  return (
    <Link
      href={`/destinasi/${destinasi.slug}`}
      className={`group flex flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover ${
        horizontal ? "w-[270px] shrink-0 snap-start" : ""
      } ${className}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-high">
        <Image
          src={destinasi.foto}
          alt={destinasi.nama}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {destinasi.permataTersembunyi && <LencanaPermata />}
          {destinasi.statusVerifikasi === "Terverifikasi" && <LencanaTerverifikasi compact />}
        </div>
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded bg-primary/85 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
          <Icon name="star" fill className="text-[12px] text-secondary-container" />
          {destinasi.rating.toFixed(1)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
          {destinasi.kategori} · {destinasi.wilayah}
        </p>
        <h3 className="line-clamp-1 font-serif text-lg font-semibold leading-snug text-primary transition-colors group-hover:text-secondary">
          {destinasi.nama}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-on-surface-variant">
          {destinasi.deskripsi}
        </p>
        {typeof jarak === "number" && (
          <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-verified">
            <Icon name="near_me" className="text-[13px]" />
            {jarak.toLocaleString("id-ID", { maximumFractionDigits: 1 })} km dari penginapan
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="text-[10px] text-on-surface-variant">Tiket masuk</p>
            <p className="text-sm font-bold text-primary">
              {destinasi.hargaTiket === 0 ? "Gratis" : formatRupiah(destinasi.hargaTiket)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
            Detail
            <Icon name="arrow_forward" className="text-[15px]" />
          </span>
        </div>
      </div>
    </Link>
  );
}
