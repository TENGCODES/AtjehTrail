import Image from "next/image";
import Link from "next/link";
import type { Penginapan } from "@prisma/client";
import { formatRupiah, parseJson } from "@/lib/format";
import { Icon } from "./icon";
import { Rating } from "./rating";

export function LodgingCard({ penginapan, jarak }: { penginapan: Penginapan; jarak?: number }) {
  const fasilitas = parseJson<string[]>(penginapan.fasilitas, []);
  return (
    <Link
      href={`/penginapan/${penginapan.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-high">
        <Image
          src={penginapan.foto}
          alt={penginapan.nama}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded bg-surface-container-lowest/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm">
          {penginapan.jenis}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg font-semibold leading-snug text-primary group-hover:text-secondary">
            {penginapan.nama}
          </h3>
          <Rating value={penginapan.rating} count={penginapan.jumlahUlasan} />
        </div>
        {typeof jarak === "number" && (
          <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-verified">
            <Icon name="near_me" className="text-[13px]" />
            {jarak.toLocaleString("id-ID", { maximumFractionDigits: 1 })} km dari destinasi
          </p>
        )}
        <p className="line-clamp-2 text-xs text-on-surface-variant">{penginapan.deskripsi}</p>
        <div className="flex flex-wrap gap-1">
          {fasilitas.slice(0, 4).map((item) => (
            <span key={item} className="rounded bg-surface-container px-1.5 py-0.5 text-[10px] font-semibold text-on-surface-variant">
              {item}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-end justify-between border-t border-surface-container pt-3">
          <p className="text-sm font-bold text-primary">
            {formatRupiah(penginapan.hargaPerMalam)}
            <span className="text-[10px] font-medium text-on-surface-variant">/malam</span>
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
            Detail
            <Icon name="arrow_forward" className="text-[15px]" />
          </span>
        </div>
      </div>
    </Link>
  );
}
