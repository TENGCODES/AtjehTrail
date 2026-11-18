import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { DestinationCard } from "@/components/destination-card";
import { PackageCard } from "@/components/package-card";
import { SectionHeading } from "@/components/section-heading";
import { ServiceMenu } from "@/components/service-menu";
import { Icon } from "@/components/icon";
import { NearbyDestinations } from "@/components/nearby-destinations";

export const metadata = { title: "Beranda" };

const populerChips = [
  "Masjid Raya Baiturrahman",
  "Pantai Lhok Mee",
  "Museum Tsunami",
  "Air Terjun Seuhom",
  "Benteng Indra Patra",
];

export default async function BerandaPage() {
  const user = await getCurrentUser();
  const [populer, tersembunyi, dekat, banner, promo, paketMingguIni, semuaDestinasi] = await Promise.all([
    prisma.destinasi.findMany({ orderBy: { populer: "desc" }, take: 6 }),
    prisma.destinasi.findMany({ where: { permataTersembunyi: true }, orderBy: { rating: "desc" }, take: 4 }),
    prisma.destinasi.findMany({ orderBy: { jarakPusat: "asc" }, take: 3 }),
    prisma.promoBanner.findFirst({ where: { tipe: "banner", aktif: true }, orderBy: { id: "asc" } }),
    prisma.promoBanner.findFirst({ where: { tipe: "promo", aktif: true } }),
    prisma.paket.findFirst({ where: { slug: "jejak-sejarah-banda-aceh" } }),
    prisma.destinasi.findMany({
      select: {
        id: true,
        slug: true,
        nama: true,
        kategori: true,
        wilayah: true,
        jarakPusat: true,
        koordinatLat: true,
        koordinatLng: true,
      },
    }),
  ]);

  const namaPanggilan = user?.nama.split(" ")[0] ?? "Sahabat";

  return (
    <div>
      <section className="relative overflow-hidden bg-primary-container text-white">
        <Image
          src="/images/hero/beranda.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-30"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary-container/85 to-primary-container/40" />
        <div className="container-page relative z-10 py-10 sm:py-16">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80 backdrop-blur-sm">
            <Icon name="location_on" className="text-[14px] text-secondary-container" />
            Banda Aceh &amp; Aceh Besar
          </p>
          <h1 className="mt-4 max-w-2xl font-serif text-3xl font-bold leading-tight sm:text-5xl">
            Halo, {namaPanggilan}. Mau ke mana hari ini?
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            Temukan destinasi, penginapan, pemandu lokal, dan paket tour terverifikasi dalam satu
            platform wisata Aceh.
          </p>

          <form
            action="/cari"
            className="mt-6 flex max-w-2xl flex-col gap-2 rounded-xl bg-white p-2 shadow-float sm:flex-row sm:items-center"
          >
            <label className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2">
              <Icon name="search" className="text-[20px] text-on-surface-variant" />
              <input
                name="q"
                placeholder="Cari destinasi, pemandu, penginapan..."
                className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-outline"
              />
            </label>
            <div className="hidden h-8 w-px bg-outline-variant/50 sm:block" />
            <label className="flex items-center gap-2 rounded-lg px-3 py-2 sm:w-40">
              <Icon name="calendar_month" className="text-[18px] text-on-surface-variant" />
              <input
                type="date"
                name="tanggal"
                className="w-full bg-transparent text-xs font-semibold text-on-surface-variant outline-none"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary-container px-5 py-3 text-sm font-bold text-on-secondary-container transition-colors hover:bg-[#d68f29]"
            >
              Cari
              <Icon name="arrow_forward" className="text-[17px]" />
            </button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-white/60">
            <span className="inline-flex items-center gap-1 font-semibold">
              <Icon name="trending_up" className="text-[14px] text-secondary-container" />
              Paling dicari:
            </span>
            {populerChips.slice(0, 4).map((chip) => (
              <Link
                key={chip}
                href={`/cari?q=${encodeURIComponent(chip)}`}
                className="rounded-full bg-white/10 px-2.5 py-1 font-semibold text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              >
                {chip}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page -mt-6 relative z-20">
        <ServiceMenu />
      </div>

      {banner && paketMingguIni && (
        <section className="container-page mt-10">
          <div className="relative overflow-hidden rounded-xl bg-primary-container shadow-card">
            <Image
              src={paketMingguIni.foto}
              alt=""
              fill
              className="object-cover opacity-35"
              sizes="(max-width: 1024px) 100vw, 1200px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary-container/85 to-transparent" />
            <div className="relative z-10 flex flex-col gap-5 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="max-w-xl">
                <p className="inline-flex items-center gap-1.5 rounded bg-secondary-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-secondary-container">
                  <Icon name="auto_awesome" className="text-[13px]" />
                  Paket minggu ini
                </p>
                <h2 className="mt-2 font-serif text-2xl font-semibold leading-tight sm:text-3xl">
                  {paketMingguIni.judul}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{banner.deskripsi}</p>
                <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-white/80">
                  <Icon name="event" className="text-[16px] text-secondary-container" />
                  Berangkat {formatTanggal(paketMingguIni.tanggalKeberangkatan)}
                  <span>·</span>
                  <Icon name="payments" className="text-[16px] text-secondary-container" />
                  {formatRupiah(paketMingguIni.hargaPerOrang)}/orang
                </p>
              </div>
              <Link
                href={banner.tujuan}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-secondary-container px-5 py-3 text-sm font-bold text-on-secondary-container transition-colors hover:bg-[#d68f29]"
              >
                Lihat paket
                <Icon name="arrow_forward" className="text-[18px]" />
              </Link>
            </div>
          </div>
          {promo?.kode && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-secondary/40 bg-cream px-4 py-2.5 text-xs">
              <span className="inline-flex items-center gap-2 font-semibold text-on-surface-variant">
                <Icon name="sell" className="text-[17px] text-secondary" />
                {promo.judul}: potongan {formatRupiah(10000)} dengan kode
                <span className="rounded bg-primary-container px-2 py-0.5 font-bold tracking-wider text-secondary-container">
                  {promo.kode}
                </span>
              </span>
              <Link href="/jelajah" className="font-bold text-primary hover:underline">
                Gunakan promo
              </Link>
            </div>
          )}
        </section>
      )}

      <section className="container-page mt-12">
        <SectionHeading
          kicker="Populer sekarang"
          title="Destinasi favorit wisatawan"
          description="Warisan sejarah, pesona bahari, dan ruang hening di sekitar Banda Aceh."
          href="/jelajah?urut=populer"
        />
        <div className="no-scrollbar mt-5 flex snap-x gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-4">
          {populer.map((destinasi) => (
            <DestinationCard key={destinasi.id} destinasi={destinasi} horizontal />
          ))}
        </div>
      </section>

      <section className="container-page mt-12">
        <SectionHeading
          kicker="Permata tersembunyi"
          title="Tempat yang belum banyak dikenal"
          description="Diusulkan warga, diverifikasi melalui gampong atau kelompok sadar wisata."
          href="/jelajah?permata=1"
          actionLabel="Lihat semua permata"
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tersembunyi.map((destinasi) => (
            <DestinationCard key={destinasi.id} destinasi={destinasi} />
          ))}
        </div>
      </section>

      <section className="container-page mt-12">
        <SectionHeading
          kicker="Dekat saya"
          title="Tempat melepas penat sekitar kota"
          description="Izinkan akses lokasi untuk mengurutkan dari posisi Anda; bila tidak, jarak dihitung dari pusat Banda Aceh."
          href="/jelajah?urut=terdekat"
        />
        <NearbyDestinations destinations={semuaDestinasi} />
      </section>

      <section className="container-page mt-12">
        <SectionHeading
          kicker="Cocok saat ini"
          title="Ide perjalanan untuk akhir pekan"
          description="Kombinasi alam dan edukasi yang ramah keluarga."
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paketMingguIni?.id && (
            <div className="sm:col-span-2">
              <PackageCard paket={paketMingguIni} />
            </div>
          )}
          {dekat.slice(0, 1).map((destinasi) => (
            <DestinationCard key={destinasi.id} destinasi={destinasi} />
          ))}
        </div>
      </section>

      <section className="container-page mt-14">
        <div className="grid gap-6 rounded-2xl bg-primary-container p-6 text-white sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary-container">
              Kolaborasi ekosistem
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold leading-tight sm:text-3xl">
              Punya destinasi, homestay, atau keahlian memandu?
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
              Daftarkan usaha Anda sebagai mitra AtjehTrail. Pengajuan diverifikasi bersama gampong
              atau kelompok sadar wisata sebelum tayang.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/mitra"
                className="inline-flex items-center gap-2 rounded-lg bg-secondary-container px-4 py-2.5 text-sm font-bold text-on-secondary-container transition-colors hover:bg-[#d68f29]"
              >
                Daftar mitra
                <Icon name="arrow_forward" className="text-[17px]" />
              </Link>
              <Link
                href="/usulkan"
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                Usulkan tempat
              </Link>
            </div>
          </div>
          <ul className="grid gap-2.5">
            {[
              "Verifikasi tiga lapis bersama gampong",
              "Kontribusi pendapatan untuk gampong mitra",
              "Etika berkunjung sesuai adat dan syariat",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2.5 text-xs leading-relaxed text-white/80">
                <Icon name="check_circle" fill className="mt-px text-[16px] text-secondary-container" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
