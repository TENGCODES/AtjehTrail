import Image from "next/image";
import Link from "next/link";
import type { Pemandu } from "@prisma/client";
import { formatRupiah, parseJson } from "@/lib/format";
import { Icon } from "./icon";
import { Rating } from "./rating";

export function GuideCard({ pemandu }: { pemandu: Pemandu }) {
  const bahasa = parseJson<string[]>(pemandu.bahasa, []);
  const keahlian = parseJson<string[]>(pemandu.keahlian, []);
  return (
    <Link
      href={`/pemandu/${pemandu.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-high">
        <Image
          src={pemandu.foto}
          alt={pemandu.nama}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded border border-verified/50 bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-verified backdrop-blur-sm">
          <Icon name="verified" className="text-[14px]" />
          Pemandu terverifikasi
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-semibold leading-snug text-primary group-hover:text-secondary">
              {pemandu.nama}
            </h3>
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant">
              <Icon name="location_on" className="text-[14px]" />
              {pemandu.area}
            </p>
          </div>
          <Rating value={pemandu.rating} count={pemandu.jumlahUlasan} />
        </div>
        <div className="flex flex-wrap gap-1">
          {keahlian.slice(0, 3).map((item) => (
            <span key={item} className="rounded bg-surface-container px-1.5 py-0.5 text-[10px] font-semibold text-on-surface-variant">
              {item}
            </span>
          ))}
        </div>
        <p className="line-clamp-2 text-xs text-on-surface-variant">{pemandu.deskripsi}</p>
        <div className="mt-auto flex items-center justify-between border-t border-surface-container pt-3">
          <div>
            <p className="text-[10px] text-on-surface-variant">Tarif</p>
            <p className="text-sm font-bold text-primary">
              {formatRupiah(pemandu.tarif)}
              <span className="text-[10px] font-medium text-on-surface-variant">/hari</span>
            </p>
          </div>
          <span className="text-[11px] font-semibold text-on-surface-variant">
            {bahasa.join(" · ")}
          </span>
        </div>
      </div>
    </Link>
  );
}
