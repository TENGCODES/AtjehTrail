import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DestinationCard } from "@/components/destination-card";
import { Icon } from "@/components/icon";
import { Rating } from "@/components/rating";
import { ReviewList } from "@/components/review-list";
import { prisma } from "@/lib/db";
import { formatRupiah, parseJson } from "@/lib/format";
import { jarakKm } from "@/lib/geo";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const data = await prisma.penginapan.findUnique({ where: { id } });
  return { title: data?.nama ?? "Penginapan" };
}

export default async function DetailPenginapanPage({ params }: Props) {
  const { id } = await params;
  const penginapan = await prisma.penginapan.findUnique({
    where: { id },
    include: { mitra: true },
  });
  if (!penginapan) notFound();

  const [ulasan, destinasi] = await Promise.all([
    prisma.ulasan.findMany({
      where: { targetJenis: "penginapan", targetId: penginapan.id },
      include: { pengguna: true },
      orderBy: { tanggal: "desc" },
      take: 6,
    }),
    prisma.destinasi.findMany(),
  ]);

  const fasilitas = parseJson<string[]>(penginapan.fasilitas, []);
  const galeri = Array.from(new Set([penginapan.foto, ...parseJson<string[]>(penginapan.galeri, [])])).slice(0, 3);
  const terdekat = destinasi
    .map((item) => ({
      item,
      jarak: jarakKm(
        { lat: penginapan.koordinatLat, lng: penginapan.koordinatLng },
        { lat: item.koordinatLat, lng: item.koordinatLng },
      ),
    }))
    .sort((a, b) => a.jarak - b.jarak)
    .slice(0, 3);

  return (
    <div className="container-page py-5 sm:py-8">
      <nav className="flex flex-wrap items-center gap-1 text-[11px] text-on-surface-variant">
        <Link href="/beranda" className="hover:text-primary">Beranda</Link>
        <Icon name="chevron_right" className="text-[13px]" />
        <Link href="/jelajah?tab=penginapan" className="hover:text-primary">Penginapan</Link>
        <Icon name="chevron_right" className="text-[13px]" />
        <span className="font-semibold text-primary">{penginapan.nama}</span>
      </nav>

      <div className="mt-4 grid gap-2 overflow-hidden rounded-xl sm:grid-cols-3 sm:grid-rows-2">
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-high sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:min-h-[340px]">
          <Image src={galeri[0]} alt={penginapan.nama} fill priority sizes="66vw" className="object-cover" />
          <span className="absolute left-3 top-3 rounded bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm">
            {penginapan.jenis}
          </span>
        </div>
        {galeri.slice(1, 3).map((foto) => (
          <div key={foto} className="relative hidden overflow-hidden bg-surface-container-high sm:block">
            <Image src={foto} alt={`Foto ${penginapan.nama}`} fill sizes="33vw" className="object-cover" />
          </div>
        ))}
      </div>

      <div className="mt-5 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">
                {penginapan.jenis} · {penginapan.mitra.namaUsaha}
              </p>
              <h1 className="mt-1 font-serif text-3xl font-bold leading-tight text-primary">{penginapan.nama}</h1>
              <div className="mt-1.5 flex items-center gap-2">
                <Rating value={penginapan.rating} count={penginapan.jumlahUlasan} size="md" />
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-verified">
                  <Icon name="verified" className="text-[14px]" />
                  Terverifikasi
                </span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{penginapan.deskripsi}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Info icon="login" label="Jam masuk" value={penginapan.jamMasuk} />
            <Info icon="logout" label="Jam keluar" value={penginapan.jamKeluar} />
            <Info icon="payments" label="Harga" value={`${formatRupiah(penginapan.hargaPerMalam)}/malam`} />
            <Info icon="location_on" label="Koordinat" value={`${penginapan.koordinatLat.toFixed(3)}, ${penginapan.koordinatLng.toFixed(3)}`} />
          </div>

          <section className="mt-6">
            <h2 className="font-serif text-xl font-semibold text-primary">Fasilitas</h2>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {fasilitas.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg border border-outline-variant/30 bg-white px-3 py-2 text-xs font-semibold text-on-surface-variant">
                  <Icon name="check_circle" fill className="text-[16px] text-verified" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-5">
            <h2 className="font-serif text-xl font-semibold text-primary">Aturan menginap</h2>
            <p className="mt-2 rounded-lg bg-cream px-4 py-3 text-sm leading-relaxed text-on-surface-variant">
              {penginapan.aturan}
            </p>
          </section>

          <section className="mt-5 overflow-hidden rounded-xl border border-outline-variant/40 bg-white shadow-card">
            <iframe
              title={`Peta ${penginapan.nama}`}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${penginapan.koordinatLng - 0.02}%2C${penginapan.koordinatLat - 0.015}%2C${penginapan.koordinatLng + 0.02}%2C${penginapan.koordinatLat + 0.015}&layer=mapnik&marker=${penginapan.koordinatLat}%2C${penginapan.koordinatLng}`}
              className="h-64 w-full border-0"
              loading="lazy"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/30 p-3">
              <p className="text-[11px] text-on-surface-variant">Peta © OpenStreetMap contributors</p>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${penginapan.koordinatLat},${penginapan.koordinatLng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-3 py-2 text-xs font-bold text-white"
              >
                <Icon name="directions" className="text-[16px]" />
                Buka arah
              </a>
            </div>
          </section>

          <section className="mt-7">
            <h2 className="font-serif text-xl font-semibold text-primary">Destinasi terdekat</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {terdekat.map(({ item, jarak }) => (
                <DestinationCard key={item.id} destinasi={item} jarak={jarak} />
              ))}
            </div>
          </section>

          <section className="mt-8">
            <ReviewList ulasan={ulasan} rating={penginapan.rating} jumlah={penginapan.jumlahUlasan} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-xl border border-outline-variant/40 bg-white p-5 shadow-card">
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Harga per malam</p>
            <p className="mt-1 font-serif text-2xl font-bold text-primary">{formatRupiah(penginapan.hargaPerMalam)}</p>
            <p className="mt-1 text-[11px] text-on-surface-variant">
              Biaya layanan {formatRupiah(5000)} per pesanan. Pilih tanggal masuk dan jumlah malam
              pada halaman pesan.
            </p>
            <Link
              href={`/pesan?jenis=penginapan&id=${penginapan.id}`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-container px-4 py-3 text-sm font-bold text-on-secondary-container shadow-card transition-colors hover:bg-[#d68f29]"
            >
              Pesan penginapan
              <Icon name="arrow_forward" className="text-[17px]" />
            </Link>
            <ul className="mt-4 space-y-2 border-t border-surface-container pt-3">
              {[`Masuk ${penginapan.jamMasuk}`, `Keluar ${penginapan.jamKeluar}`, "E-voucher dengan kode QR"].map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-[11px] text-on-surface-variant">
                  <Icon name="check_circle" fill className="mt-px text-[14px] text-verified" />
                  {item}
                </li>
              ))}
            </ul>
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
