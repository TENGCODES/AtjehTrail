import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DestinationCard } from "@/components/destination-card";
import { Icon } from "@/components/icon";
import { ReviewList } from "@/components/review-list";
import { prisma } from "@/lib/db";
import { formatRupiah, formatTanggal, parseJson } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

type Itinerary = { waktu: string; kegiatan: string };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await prisma.paket.findUnique({ where: { slug } });
  return { title: data?.judul ?? "Paket Tour" };
}

export default async function DetailPaketPage({ params }: Props) {
  const { slug } = await params;
  const paket = await prisma.paket.findUnique({
    where: { slug },
    include: { mitra: true, destinasi: { include: { destinasi: true }, orderBy: { urutan: "asc" } } },
  });
  if (!paket) notFound();

  const ulasan = await prisma.ulasan.findMany({
    where: { targetJenis: "paket", targetId: paket.id },
    include: { pengguna: true },
    orderBy: { tanggal: "desc" },
    take: 6,
  });

  const itinerary = parseJson<Itinerary[]>(paket.itinerary, []);
  const inklusi = parseJson<string[]>(paket.inklusi, []);
  const eksklusi = parseJson<string[]>(paket.eksklusi, []);

  return (
    <div className="container-page py-5 sm:py-8">
      <nav className="flex flex-wrap items-center gap-1 text-[11px] text-on-surface-variant">
        <Link href="/beranda" className="hover:text-primary">Beranda</Link>
        <Icon name="chevron_right" className="text-[13px]" />
        <Link href="/jelajah?tab=paket" className="hover:text-primary">Paket Tour</Link>
        <Icon name="chevron_right" className="text-[13px]" />
        <span className="font-semibold text-primary">{paket.judul}</span>
      </nav>

      <div className="relative mt-4 w-full aspect-[16/8] min-h-[220px] overflow-hidden rounded-xl bg-surface-container-high sm:min-h-[320px]">
        <Image src={paket.foto} alt={paket.judul} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
            <span className="rounded bg-secondary-container px-2 py-0.5 text-on-secondary-container">{paket.durasi}</span>
            <span className="rounded bg-white/15 px-2 py-0.5 backdrop-blur-sm">Min. {paket.minimalOrang} orang</span>
            <span className="rounded bg-white/15 px-2 py-0.5 backdrop-blur-sm">Kuota {paket.kuota} orang</span>
          </div>
          <h1 className="mt-2 max-w-3xl font-serif text-2xl font-bold leading-tight sm:text-4xl">{paket.judul}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1 font-semibold">
              <Icon name="star" fill className="text-[14px] text-secondary-container" />
              {paket.rating.toFixed(1)} ({paket.jumlahUlasan} ulasan)
            </span>
            <span className="inline-flex items-center gap-1 text-white/80">
              <Icon name="verified" className="text-[14px]" />
              {paket.mitra.namaUsaha}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <p className="text-sm leading-relaxed text-on-surface-variant">{paket.deskripsi}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Info icon="event" label="Keberangkatan" value={formatTanggal(paket.tanggalKeberangkatan)} />
            <Info icon="location_on" label="Titik kumpul" value={paket.titikKumpul} />
            <Info icon="group" label="Minimal" value={`${paket.minimalOrang} orang`} />
            <Info icon="confirmation_number" label="Kuota" value={`${paket.kuota} orang`} />
          </div>

          <section className="mt-7">
            <h2 className="font-serif text-xl font-semibold text-primary">Itinerary</h2>
            <ol className="mt-3 space-y-0">
              {itinerary.map((item, index) => (
                <li key={`${item.waktu}-${index}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-[10px] font-bold text-secondary-container">
                      {item.waktu}
                    </span>
                    {index < itinerary.length - 1 && <span className="my-1 w-px flex-1 bg-outline-variant/60" />}
                  </div>
                  <div className="pb-4 pt-1.5">
                    <p className="text-sm font-semibold text-on-surface">{item.kegiatan}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <section className="rounded-xl border border-outline-variant/30 bg-white p-4 shadow-card">
              <h2 className="flex items-center gap-1.5 font-serif text-lg font-semibold text-primary">
                <Icon name="check_circle" fill className="text-[18px] text-verified" />
                Termasuk
              </h2>
              <ul className="mt-2 space-y-1.5">
                {inklusi.map((item) => (
                  <li key={item} className="flex items-start gap-1.5 text-xs text-on-surface-variant">
                    <Icon name="done" className="mt-px text-[14px] text-verified" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-xl border border-outline-variant/30 bg-white p-4 shadow-card">
              <h2 className="flex items-center gap-1.5 font-serif text-lg font-semibold text-primary">
                <Icon name="cancel" className="text-[18px] text-error" />
                Tidak termasuk
              </h2>
              <ul className="mt-2 space-y-1.5">
                {eksklusi.map((item) => (
                  <li key={item} className="flex items-start gap-1.5 text-xs text-on-surface-variant">
                    <Icon name="remove" className="mt-px text-[14px] text-outline" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="mt-7">
            <h2 className="font-serif text-xl font-semibold text-primary">Destinasi dalam paket</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {paket.destinasi.map((relasi) => (
                <DestinationCard key={relasi.destinasiId} destinasi={relasi.destinasi} />
              ))}
            </div>
          </section>

          <section className="mt-8">
            <ReviewList ulasan={ulasan} rating={paket.rating} jumlah={paket.jumlahUlasan} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-xl border border-outline-variant/40 bg-white p-5 shadow-card">
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Harga per orang</p>
            <p className="mt-1 font-serif text-2xl font-bold text-primary">
              {formatRupiah(paket.hargaPerOrang)}
              <span className="ml-1 text-xs font-medium text-on-surface-variant">/orang</span>
            </p>
            <p className="mt-1 text-[11px] text-on-surface-variant">
              Minimal {paket.minimalOrang} orang. Biaya layanan {formatRupiah(5000)} per pesanan.
            </p>
            <Link
              href={`/pesan?jenis=paket&id=${paket.id}`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-container px-4 py-3 text-sm font-bold text-on-secondary-container shadow-card transition-colors hover:bg-[#d68f29]"
            >
              Pesan paket
              <Icon name="arrow_forward" className="text-[17px]" />
            </Link>
            <ul className="mt-4 space-y-2 border-t border-surface-container pt-3">
              {[
                paket.pemandu ? "Sudah termasuk pemandu" : "Pemandu dapat ditambahkan",
                paket.antarJemput ? "Sudah termasuk antar-jemput" : "Antar-jemput dapat ditambahkan",
                "E-voucher dengan kode QR",
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-[11px] text-on-surface-variant">
                  <Icon name="check_circle" fill className="mt-px text-[14px] text-verified" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded bg-surface-container-low px-3 py-2 text-[10px] leading-relaxed text-on-surface-variant">
              Penyelenggara: {paket.mitra.namaUsaha} · {paket.mitra.statusVerifikasi}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-outline-variant/30 bg-white p-3 shadow-card">
      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
        <Icon name={icon} className="text-[13px] text-secondary" />
        {label}
      </p>
      <p className="mt-1 text-xs font-semibold leading-snug text-primary">{value}</p>
    </div>
  );
}
