import Link from "next/link";
import { AutoSelect } from "@/components/auto-select";
import { DestinationCard } from "@/components/destination-card";
import { GuideCard } from "@/components/guide-card";
import { Icon } from "@/components/icon";
import { LodgingCard } from "@/components/lodging-card";
import { MapPanel } from "@/components/map-panel";
import { PackageCard } from "@/components/package-card";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export const metadata = { title: "Jelajah" };

type Params = {
  tab?: string;
  q?: string;
  wilayah?: string;
  kategori?: string;
  harga?: string;
  kesulitan?: string;
  fasilitas?: string;
  ramah?: string;
  jenis?: string;
  area?: string;
  bahasa?: string;
  urut?: string;
  tampilan?: string;
  permata?: string;
};

const tabList = [
  { id: "destinasi", label: "Destinasi", icon: "explore" },
  { id: "penginapan", label: "Penginapan", icon: "cottage" },
  { id: "pemandu", label: "Pemandu", icon: "badge" },
  { id: "paket", label: "Paket Tour", icon: "luggage" },
];

const kategoriList = [
  "Sejarah",
  "Budaya",
  "Religi",
  "Alam",
  "Edukasi Bencana",
  "Desa Wisata",
];

const urutList = [
  { id: "populer", label: "Paling populer" },
  { id: "rating", label: "Rating tertinggi" },
  { id: "harga", label: "Harga terendah" },
  { id: "terdekat", label: "Terdekat" },
];

function buildHref(params: Params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) sp.set(key, value);
  });
  const qs = sp.toString();
  return qs ? `/jelajah?${qs}` : "/jelajah";
}

export default async function JelajahPage({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;
  const tab = tabList.some((item) => item.id === p.tab) ? (p.tab as string) : "destinasi";
  const q = (p.q ?? "").trim();
  const urut = p.urut ?? "populer";
  const tampilan = p.tampilan === "peta" ? "peta" : "daftar";

  const destinasiWhere: Prisma.DestinasiWhereInput = {
    ...(q
      ? { OR: [{ nama: { contains: q } }, { deskripsi: { contains: q } }, { kategori: { contains: q } }] }
      : {}),
    ...(p.wilayah ? { wilayah: p.wilayah } : {}),
    ...(p.kategori ? { kategori: p.kategori } : {}),
    ...(p.kesulitan ? { tingkatKesulitan: p.kesulitan } : {}),
    ...(p.fasilitas ? { fasilitas: { contains: p.fasilitas } } : {}),
    ...(p.ramah ? { tingkatKesulitan: "Mudah" } : {}),
    ...(p.permata ? { permataTersembunyi: true } : {}),
    ...(p.harga === "gratis"
      ? { hargaTiket: 0 }
      : p.harga === "murah"
        ? { hargaTiket: { lte: 10000 } }
        : p.harga === "sedang"
          ? { hargaTiket: { gt: 10000, lte: 25000 } }
          : p.harga === "mahal"
            ? { hargaTiket: { gt: 25000 } }
            : {}),
  };

  const destinasiOrder: Prisma.DestinasiOrderByWithRelationInput =
    urut === "rating"
      ? { rating: "desc" }
      : urut === "harga"
        ? { hargaTiket: "asc" }
        : urut === "terdekat"
          ? { jarakPusat: "asc" }
          : { populer: "desc" };

  const penginapanWhere: Prisma.PenginapanWhereInput = {
    ...(q ? { OR: [{ nama: { contains: q } }, { deskripsi: { contains: q } }] } : {}),
    ...(p.jenis ? { jenis: p.jenis } : {}),
    ...(p.harga === "murah"
      ? { hargaPerMalam: { lte: 250000 } }
      : p.harga === "sedang"
        ? { hargaPerMalam: { gt: 250000, lte: 400000 } }
        : p.harga === "mahal"
          ? { hargaPerMalam: { gt: 400000 } }
          : {}),
  };

  const pemanduWhere: Prisma.PemanduWhereInput = {
    ...(q
      ? { OR: [{ nama: { contains: q } }, { keahlian: { contains: q } }, { deskripsi: { contains: q } }] }
      : {}),
    ...(p.area ? { area: p.area } : {}),
    ...(p.bahasa ? { bahasa: { contains: p.bahasa } } : {}),
    ...(p.harga === "murah"
      ? { tarif: { lte: 300000 } }
      : p.harga === "sedang"
        ? { tarif: { gt: 300000, lte: 350000 } }
        : p.harga === "mahal"
          ? { tarif: { gt: 350000 } }
          : {}),
  };

  const paketWhere: Prisma.PaketWhereInput = {
    ...(q ? { OR: [{ judul: { contains: q } }, { deskripsi: { contains: q } }] } : {}),
    ...(p.harga === "murah"
      ? { hargaPerOrang: { lte: 300000 } }
      : p.harga === "sedang"
        ? { hargaPerOrang: { gt: 300000, lte: 350000 } }
        : p.harga === "mahal"
          ? { hargaPerOrang: { gt: 350000 } }
          : {}),
  };

  const [destinasi, penginapan, pemandu, paket] = await Promise.all([
    prisma.destinasi.findMany({ where: destinasiWhere, orderBy: destinasiOrder }),
    prisma.penginapan.findMany({
      where: penginapanWhere,
      orderBy: urut === "harga" ? { hargaPerMalam: "asc" } : { rating: "desc" },
    }),
    prisma.pemandu.findMany({
      where: pemanduWhere,
      orderBy: urut === "harga" ? { tarif: "asc" } : { rating: "desc" },
    }),
    prisma.paket.findMany({
      where: paketWhere,
      orderBy: urut === "harga" ? { hargaPerOrang: "asc" } : { rating: "desc" },
    }),
  ]);

  const jumlah =
    tab === "destinasi"
      ? destinasi.length
      : tab === "penginapan"
        ? penginapan.length
        : tab === "pemandu"
          ? pemandu.length
          : paket.length;

  const chips: { label: string; key: keyof Params }[] = [];
  if (p.wilayah) chips.push({ label: `Wilayah: ${p.wilayah}`, key: "wilayah" });
  if (p.kategori) chips.push({ label: `Kategori: ${p.kategori}`, key: "kategori" });
  if (p.kesulitan) chips.push({ label: `Kesulitan: ${p.kesulitan}`, key: "kesulitan" });
  if (p.harga) chips.push({ label: `Harga: ${labelHarga(p.harga)}`, key: "harga" });
  if (p.fasilitas) chips.push({ label: `Fasilitas: ${p.fasilitas}`, key: "fasilitas" });
  if (p.ramah) chips.push({ label: "Ramah keluarga", key: "ramah" });
  if (p.permata) chips.push({ label: "Permata tersembunyi", key: "permata" });
  if (p.jenis) chips.push({ label: `Jenis: ${p.jenis}`, key: "jenis" });
  if (p.area) chips.push({ label: `Area: ${p.area}`, key: "area" });
  if (p.bahasa) chips.push({ label: `Bahasa: ${p.bahasa}`, key: "bahasa" });

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">
          Jelajah &amp; katalog
        </p>
        <h1 className="mt-1 font-serif text-2xl font-bold text-primary sm:text-3xl">
          Temukan pengalaman wisata Aceh
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-on-surface-variant">
          Telusuri destinasi, penginapan, pemandu, dan paket tour dengan filter yang sesuai
          kebutuhan perjalanan Anda.
        </p>
      </div>

      <div className="grid gap-2 rounded-xl bg-white p-2 shadow-card sm:grid-cols-[1fr_auto]">
        <form action="/jelajah" className="flex items-center gap-2 rounded-lg px-2 py-1.5">
          <input type="hidden" name="tab" value={tab} />
          <Icon name="search" className="text-[20px] text-on-surface-variant" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Kata kunci destinasi atau layanan..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-outline"
          />
        </form>
        <div className="flex items-center gap-1 overflow-x-auto">
          <Link
            href={buildHref({ tab, q, ...(p.permata ? { permata: "1" } : {}) })}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
              p.permata ? "bg-primary-container text-secondary-container" : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            Permata tersembunyi
          </Link>
        </div>
      </div>

      <div className="no-scrollbar mt-4 flex gap-1 overflow-x-auto border-b border-outline-variant/40">
        {tabList.map((item) => (
          <Link
            key={item.id}
            href={buildHref({ tab: item.id, q })}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-bold transition-colors ${
              tab === item.id
                ? "border-secondary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Icon name={item.icon} className="text-[18px]" />
            {item.label}
            <span className="rounded bg-surface-container px-1.5 py-0.5 text-[10px]">
              {item.id === "destinasi"
                ? destinasi.length
                : item.id === "penginapan"
                  ? penginapan.length
                  : item.id === "pemandu"
                    ? pemandu.length
                    : paket.length}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-on-surface-variant">
            {jumlah} hasil
          </span>
          {chips.map((chip) => (
            <Link
              key={chip.key}
              href={buildHref({ ...p, [chip.key]: undefined, tab })}
              className="inline-flex items-center gap-1 rounded-full bg-primary-container px-2.5 py-1 text-[10px] font-bold text-white"
            >
              {chip.label}
              <Icon name="close" className="text-[13px]" />
            </Link>
          ))}
          {chips.length > 0 && (
            <Link href={buildHref({ tab, q })} className="text-[11px] font-bold text-secondary hover:underline">
              Reset
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-lg bg-white p-0.5 shadow-card sm:flex">
            <Link
              href={buildHref({ ...p, tampilan: "daftar", tab })}
              aria-label="Tampilan daftar"
              className={`rounded p-1.5 ${tampilan === "daftar" ? "bg-primary-container text-secondary-container" : "text-on-surface-variant"}`}
            >
              <Icon name="view_list" className="text-[18px]" />
            </Link>
            <Link
              href={buildHref({ ...p, tampilan: "peta", tab })}
              aria-label="Tampilan peta"
              className={`rounded p-1.5 ${tampilan === "peta" ? "bg-primary-container text-secondary-container" : "text-on-surface-variant"}`}
            >
              <Icon name="map" className="text-[18px]" />
            </Link>
          </div>
          <label className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs shadow-card">
            <Icon name="sort" className="text-[16px] text-on-surface-variant" />
            <span className="hidden text-on-surface-variant sm:inline">Urutkan</span>
            <AutoSelect
              defaultValue={urut}
              form="filter-form"
              name="urut"
              options={urutList
                .filter((item) => item.id !== "terdekat" || tab === "destinasi")
                .map((item) => ({ value: item.id, label: item.label }))}
              className="bg-transparent text-xs font-bold text-primary outline-none"
            />
          </label>
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-outline-variant/30 bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-base font-semibold text-primary">Filter</h2>
              <Link href={buildHref({ tab, q })} className="text-[10px] font-bold text-secondary hover:underline">
                Reset
              </Link>
            </div>
            <FilterFields tab={tab} p={p} />
          </div>
        </aside>

        <div>
          <details className="mb-4 rounded-xl bg-white p-3 shadow-card lg:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-primary [&::-webkit-details-marker]:hidden">
              <Icon name="tune" className="text-[18px]" />
              Filter lengkap
              {chips.length > 0 && (
                <span className="rounded-full bg-secondary-container px-1.5 text-[10px] text-on-secondary-container">
                  {chips.length}
                </span>
              )}
            </summary>
            <div className="mt-3 border-t border-surface-container pt-3">
              <FilterFields tab={tab} p={p} />
            </div>
          </details>

          {tampilan === "peta" && tab === "destinasi" && (
            <div className="mb-5">
              <MapPanel destinasi={destinasi} />
            </div>
          )}

          {tab === "destinasi" && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {destinasi.map((item) => (
                <DestinationCard key={item.id} destinasi={item} />
              ))}
            </div>
          )}
          {tab === "penginapan" && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {penginapan.map((item) => (
                <LodgingCard key={item.id} penginapan={item} />
              ))}
            </div>
          )}
          {tab === "pemandu" && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pemandu.map((item) => (
                <GuideCard key={item.id} pemandu={item} />
              ))}
            </div>
          )}
          {tab === "paket" && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {paket.map((item) => (
                <PackageCard key={item.id} paket={item} />
              ))}
            </div>
          )}

          {jumlah === 0 && (
            <div className="rounded-xl bg-white p-8 text-center shadow-card">
              <Icon name="search_off" className="text-[36px] text-outline" />
              <h2 className="mt-2 font-serif text-lg font-semibold text-primary">
                Tidak ada hasil dengan filter ini
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Coba longgarkan filter atau reset pencarian.
              </p>
              <Link
                href={buildHref({ tab })}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-4 py-2.5 text-xs font-bold text-white"
              >
                Reset filter
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function labelHarga(value: string) {
  if (value === "gratis") return "Gratis";
  if (value === "murah") return "Murah";
  if (value === "sedang") return "Sedang";
  return "Premium";
}

function FilterFields({ tab, p }: { tab: string; p: Params }) {
  return (
    <form id="filter-form" action="/jelajah" className="mt-3 space-y-3">
      <input type="hidden" name="tab" value={tab} />
      {p.q && <input type="hidden" name="q" value={p.q} />}
      {p.tampilan && <input type="hidden" name="tampilan" value={p.tampilan} />}

      {tab === "destinasi" && (
        <>
          <Select label="Wilayah" name="wilayah" value={p.wilayah} options={["Banda Aceh", "Aceh Besar"]} />
          <Select label="Kategori" name="kategori" value={p.kategori} options={kategoriList} />
          <Select label="Rentang harga" name="harga" value={p.harga} options={[
            { value: "gratis", label: "Gratis" },
            { value: "murah", label: "≤ Rp10.000" },
            { value: "sedang", label: "Rp10.001–25.000" },
            { value: "mahal", label: "> Rp25.000" },
          ]} />
          <Select label="Tingkat kesulitan" name="kesulitan" value={p.kesulitan} options={["Mudah", "Sedang", "Menantang"]} />
          <Select label="Fasilitas ibadah" name="fasilitas" value={p.fasilitas} options={["Musala", "Toilet", "Parkir"]} />
          <Checkbox label="Ramah keluarga" name="ramah" checked={!!p.ramah} />
          <Checkbox label="Hanya permata tersembunyi" name="permata" checked={!!p.permata} />
        </>
      )}

      {tab === "penginapan" && (
        <>
          <Select label="Jenis" name="jenis" value={p.jenis} options={["Homestay", "Villa"]} />
          <Select label="Harga per malam" name="harga" value={p.harga} options={[
            { value: "murah", label: "≤ Rp250.000" },
            { value: "sedang", label: "Rp250.001–400.000" },
            { value: "mahal", label: "> Rp400.000" },
          ]} />
        </>
      )}

      {tab === "pemandu" && (
        <>
          <Select label="Area" name="area" value={p.area} options={["Banda Aceh", "Aceh Besar"]} />
          <Select label="Bahasa" name="bahasa" value={p.bahasa} options={["Indonesia", "English"]} />
          <Select label="Tarif per hari" name="harga" value={p.harga} options={[
            { value: "murah", label: "≤ Rp300.000" },
            { value: "sedang", label: "Rp300.001–350.000" },
            { value: "mahal", label: "> Rp350.000" },
          ]} />
        </>
      )}

      {tab === "paket" && (
        <Select label="Harga per orang" name="harga" value={p.harga} options={[
          { value: "murah", label: "≤ Rp300.000" },
          { value: "sedang", label: "Rp300.001–350.000" },
          { value: "mahal", label: "> Rp350.000" },
        ]} />
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-secondary-container px-4 py-2.5 text-xs font-bold text-on-secondary-container transition-colors hover:bg-[#d68f29]"
      >
        Terapkan filter
      </button>
    </form>
  );
}

function Select({
  label,
  name,
  value,
  options,
}: {
  label: string;
  name: string;
  value?: string;
  options: (string | { value: string; label: string })[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="w-full rounded border border-outline-variant/60 bg-white px-2 py-1.5 text-xs text-on-surface outline-none focus:border-primary"
      >
        <option value="">Semua</option>
        {options.map((option) => {
          const item = typeof option === "string" ? { value: option, label: option } : option;
          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function Checkbox({ label, name, checked }: { label: string; name: string; checked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-on-surface-variant">
      <input
        type="checkbox"
        name={name}
        defaultChecked={checked}
        className="h-4 w-4 rounded border-outline accent-primary-container"
      />
      {label}
    </label>
  );
}
