import Link from "next/link";
import { Icon } from "./icon";

const layanan = [
  {
    tab: "destinasi",
    ikon: "explore",
    judul: "Destinasi",
    teks: "Dari ikon sejarah hingga permata tersembunyi.",
  },
  {
    tab: "penginapan",
    ikon: "cottage",
    judul: "Penginapan",
    teks: "Homestay warga dan villa dekat destinasi.",
  },
  {
    tab: "pemandu",
    ikon: "badge",
    judul: "Pemandu Lokal",
    teks: "Pemandu terverifikasi dengan narasi sejarah.",
  },
  {
    tab: "paket",
    ikon: "luggage",
    judul: "Paket Tour",
    teks: "Itinerary siap pakai, pemandu, dan antar-jemput.",
  },
];

export function ServiceMenu() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {layanan.map((item) => (
        <Link
          key={item.tab}
          href={`/jelajah?tab=${item.tab}`}
          className="group flex flex-col gap-2 rounded-xl border border-outline-variant/30 bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-secondary-container">
            <Icon name={item.ikon} className="text-[22px]" />
          </span>
          <span className="font-serif text-base font-semibold text-primary group-hover:text-secondary">
            {item.judul}
          </span>
          <span className="text-[11px] leading-relaxed text-on-surface-variant">{item.teks}</span>
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-primary">
            Jelajahi
            <Icon name="arrow_forward" className="text-[13px] transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}
