import Link from "next/link";
import type { Destinasi } from "@prisma/client";
import { Icon } from "./icon";

const bounds = { minLat: 5.4, maxLat: 5.68, minLng: 95.25, maxLng: 95.58 };

export function MapPanel({ destinasi }: { destinasi: Destinasi[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-low shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-outline-variant/30 bg-white px-4 py-3">
        <div>
          <p className="text-xs font-bold text-primary">Peta sebaran destinasi</p>
          <p className="text-[11px] text-on-surface-variant">
            Klik pin untuk membuka detail. Peta skematik prototipe.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded bg-surface-container px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          <Icon name="map" className="text-[14px]" />
          {destinasi.length} titik
        </span>
      </div>
      <div className="relative h-[420px] overflow-hidden bg-[#dfeee2]">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #c8dfcd 0 18%, transparent 19%), radial-gradient(circle at 70% 60%, #cfe4d2 0 22%, transparent 23%), linear-gradient(120deg, transparent 30%, #b9d9c0 31%, #b9d9c0 33%, transparent 34%), linear-gradient(60deg, transparent 55%, #c3ddc9 56%, #c3ddc9 57%, transparent 58%)",
          }}
        />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(#103629_1px,transparent_1px),linear-gradient(90deg,#103629_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute left-4 top-4 rounded-lg bg-white/90 px-3 py-2 text-[10px] font-semibold text-on-surface-variant shadow-card backdrop-blur">
          <p className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-secondary" /> Banda Aceh
          </p>
          <p className="mt-1 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary-container" /> Aceh Besar
          </p>
          <p className="mt-1 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rotate-45 bg-verified" /> Permata tersembunyi
          </p>
        </div>
        {destinasi.map((item) => {
          const x = Math.min(
            94,
            Math.max(6, ((item.koordinatLng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100),
          );
          const y = Math.min(
            92,
            Math.max(8, ((bounds.maxLat - item.koordinatLat) / (bounds.maxLat - bounds.minLat)) * 100),
          );
          return (
            <Link
              key={item.id}
              href={`/destinasi/${item.slug}`}
              title={`${item.nama} · ${item.wilayah}`}
              className="group absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-card transition-transform group-hover:scale-110 ${
                  item.permataTersembunyi
                    ? "bg-verified text-white"
                    : item.wilayah === "Banda Aceh"
                      ? "bg-secondary text-on-secondary"
                      : "bg-primary-container text-secondary-container"
                }`}
              >
                <Icon name={item.permataTersembunyi ? "diamond" : "location_on"} className="text-[16px]" />
              </span>
              <span className="pointer-events-none absolute left-1/2 top-full mt-1 hidden w-max max-w-[180px] -translate-x-1/2 truncate rounded bg-primary px-2 py-1 text-[10px] font-semibold text-white shadow-card group-hover:block">
                {item.nama}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
