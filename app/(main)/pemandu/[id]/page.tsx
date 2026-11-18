import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DestinationCard } from "@/components/destination-card";
import { Icon } from "@/components/icon";
import { Rating } from "@/components/rating";
import { ReviewList } from "@/components/review-list";
import { prisma } from "@/lib/db";
import { formatRupiah, formatTanggal, parseJson } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const pemandu = await prisma.pemandu.findUnique({ where: { id } });
  return { title: pemandu?.nama ?? "Pemandu" };
}

export default async function DetailPemanduPage({ params }: Props) {
  const { id } = await params;
  const pemandu = await prisma.pemandu.findUnique({
    where: { id },
    include: { mitra: true, destinasi: { include: { destinasi: true } } },
  });
  if (!pemandu) notFound();

  const ulasan = await prisma.ulasan.findMany({
    where: { targetJenis: "pemandu", targetId: pemandu.id },
    include: { pengguna: true },
    orderBy: { tanggal: "desc" },
    take: 6,
  });

  const bahasa = parseJson<string[]>(pemandu.bahasa, []);
  const keahlian = parseJson<string[]>(pemandu.keahlian, []);
  const ketersediaan = parseJson<string[]>(pemandu.ketersediaan, []);

  return (
    <div className="container-page py-5 sm:py-8">
      <nav className="flex flex-wrap items-center gap-1 text-[11px] text-on-surface-variant">
        <Link href="/beranda" className="hover:text-primary">Beranda</Link>
        <Icon name="chevron_right" className="text-[13px]" />
        <Link href="/jelajah?tab=pemandu" className="hover:text-primary">Pemandu</Link>
        <Icon name="chevron_right" className="text-[13px]" />
        <span className="font-semibold text-primary">{pemandu.nama}</span>
      </nav>

      <div className="mt-4 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <div className="overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-card">
            <div className="grid sm:grid-cols-[240px_1fr]">
              <div className="relative aspect-[4/3] bg-surface-container-high sm:aspect-auto sm:min-h-[230px]">
                <Image
                  src={pemandu.foto}
                  alt={pemandu.nama}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, 240px"
                  className="object-cover object-top"
                />
              </div>
              <div className="p-4 sm:p-5">
                <p className="inline-flex items-center gap-1 rounded border border-verified/50 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-verified">
                  <Icon name="verified" className="text-[14px]" />
                  Pemandu terverifikasi HPI
                </p>
                <h1 className="mt-2 font-serif text-2xl font-bold leading-tight text-primary sm:text-3xl">
                  {pemandu.nama}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-on-surface-variant">
                  <Rating value={pemandu.rating} count={pemandu.jumlahUlasan} />
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="location_on" className="text-[14px]" />
                    {pemandu.area}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{pemandu.deskripsi}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {keahlian.map((item) => (
                    <span key={item} className="rounded bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">
                      {item}
                    </span>
                  ))}
                  {bahasa.map((item) => (
                    <span key={item} className="rounded bg-primary-container px-2 py-0.5 text-[11px] font-semibold text-secondary-container">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <section className="mt-6">
            <h2 className="font-serif text-xl font-semibold text-primary">Kalender ketersediaan</h2>
            <p className="mt-1 text-xs text-on-surface-variant">
              Tanggal tersedia (data contoh). Pilih tanggal saat mengisi halaman pesan.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ketersediaan.map((tanggal) => (
                <div key={tanggal} className="rounded-lg border border-verified/30 bg-emerald-50 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    {new Date(tanggal).toLocaleDateString("id-ID", { weekday: "long" })}
                  </p>
                  <p className="mt-0.5 font-serif text-sm font-semibold text-primary">
                    {formatTanggal(tanggal, false)}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-verified">
                    <Icon name="check_circle" fill className="text-[12px]" />
                    Tersedia
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-7">
            <h2 className="font-serif text-xl font-semibold text-primary">Destinasi yang dilayani</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pemandu.destinasi.map((relasi) => (
                <DestinationCard key={relasi.destinasiId} destinasi={relasi.destinasi} />
              ))}
            </div>
          </section>

          <section className="mt-8">
            <ReviewList ulasan={ulasan} rating={pemandu.rating} jumlah={pemandu.jumlahUlasan} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-xl border border-outline-variant/40 bg-white p-5 shadow-card">
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Tarif pemandu</p>
            <p className="mt-1 font-serif text-2xl font-bold text-primary">
              {formatRupiah(pemandu.tarif)}
              <span className="ml-1 text-xs font-medium text-on-surface-variant">/hari</span>
            </p>
            <p className="mt-1 text-[11px] text-on-surface-variant">
              Biaya layanan {formatRupiah(5000)} per pesanan. Pembayaran simulasi.
            </p>
            <Link
              href={`/pesan?jenis=pemandu&id=${pemandu.id}`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-container px-4 py-3 text-sm font-bold text-on-secondary-container shadow-card transition-colors hover:bg-[#d68f29]"
            >
              Pesan pemandu
              <Icon name="arrow_forward" className="text-[17px]" />
            </Link>
            <ul className="mt-4 space-y-2 border-t border-surface-container pt-3">
              {["Pemandu lokal bersertifikat", "Narasi sejarah & budaya", "E-voucher dengan kode QR"].map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-[11px] text-on-surface-variant">
                  <Icon name="check_circle" fill className="mt-px text-[14px] text-verified" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10px] text-on-surface-variant">
              Mitra: {pemandu.mitra.namaUsaha} · {pemandu.mitra.statusVerifikasi}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
