import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatRupiah, formatTanggal, parseJson } from "@/lib/format";
import { jarakKm } from "@/lib/geo";
import { toggleFavoritAction } from "@/lib/actions/favorites";
import { LencanaPermata, LencanaTerverifikasi, Chip } from "@/components/badges";
import { GuideCard } from "@/components/guide-card";
import { Icon } from "@/components/icon";
import { LodgingCard } from "@/components/lodging-card";
import { PackageCard } from "@/components/package-card";
import { Rating } from "@/components/rating";
import { ShareButton } from "@/components/share-button";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

const tabs = [
  { id: "tentang", label: "Tentang & Sejarah", icon: "history_edu" },
  { id: "akses", label: "Akses & Fasilitas", icon: "meeting_room" },
  { id: "etika", label: "Etika Berkunjung", icon: "gavel" },
  { id: "ulasan", label: "Ulasan", icon: "rate_review" },
];

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const destinasi = await prisma.destinasi.findUnique({ where: { slug } });
  if (!destinasi) return { title: "Destinasi tidak ditemukan" };
  return { title: destinasi.nama, description: destinasi.deskripsi };
}

export default async function DetailDestinasiPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const user = await getCurrentUser();

  const destinasi = await prisma.destinasi.findUnique({
    where: { slug },
    include: {
      mitra: true,
      pemandu: { include: { pemandu: true } },
      paket: { include: { paket: true } },
    },
  });
  if (!destinasi) notFound();

  const [ulasan, favorit, semuaPenginapan] = await Promise.all([
    prisma.ulasan.findMany({
      where: { targetJenis: "destinasi", targetId: destinasi.id },
      include: { pengguna: true },
      orderBy: { tanggal: "desc" },
      take: 6,
    }),
    user
      ? prisma.favorit.findUnique({
          where: {
            penggunaId_jenis_targetId: {
              penggunaId: user.id,
              jenis: "destinasi",
              targetId: destinasi.id,
            },
          },
        })
      : null,
    prisma.penginapan.findMany(),
  ]);

  const aktif = tabs.some((item) => item.id === tab) ? tab! : "tentang";
  const fasilitas = parseJson<string[]>(destinasi.fasilitas, []);
  const etika = parseJson<string[]>(destinasi.etika, []);
  const galeriResmi = Array.from(new Set([destinasi.foto, ...parseJson<string[]>(destinasi.galeri, [])]));
  const fotoPengunjung = ulasan
    .map((item) => item.foto)
    .filter((foto): foto is string => Boolean(foto));
  const semuaGaleri = Array.from(new Set([...galeriResmi, ...fotoPengunjung]));
  const galeri = Array.from(
    new Set([galeriResmi[0], ...fotoPengunjung, ...galeriResmi.slice(1)]),
  ).slice(0, 3);
  const totalFoto = semuaGaleri.length;
  const penginapanTerdekat = semuaPenginapan
    .map((item) => ({
      item,
      jarak: jarakKm(
        { lat: destinasi.koordinatLat, lng: destinasi.koordinatLng },
        { lat: item.koordinatLat, lng: item.koordinatLng },
      ),
    }))
    .sort((a, b) => a.jarak - b.jarak)
    .slice(0, 3);
  const kembali = `/destinasi/${destinasi.slug}?tab=${aktif}`;

  return (
    <div className="container-page py-5 sm:py-8">
      <nav className="flex flex-wrap items-center gap-1 text-[11px] text-on-surface-variant" aria-label="Breadcrumb">
        <Link href="/beranda" className="hover:text-primary">Beranda</Link>
        <Icon name="chevron_right" className="text-[13px]" />
        <Link href="/jelajah" className="hover:text-primary">Destinasi</Link>
        <Icon name="chevron_right" className="text-[13px]" />
        <Link href={`/jelajah?wilayah=${encodeURIComponent(destinasi.wilayah)}`} className="hover:text-primary">
          {destinasi.wilayah}
        </Link>
        <Icon name="chevron_right" className="text-[13px]" />
        <span className="font-semibold text-primary">{destinasi.nama}</span>
      </nav>

      <div className="mt-4 grid gap-2 overflow-hidden rounded-xl sm:grid-cols-3 sm:grid-rows-2">
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-high sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:min-h-[360px]">
          <Image
            src={galeri[0]}
            alt={destinasi.nama}
            fill
            priority
            sizes="(max-width: 640px) 100vw, 66vw"
            className="object-cover"
          />
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {destinasi.permataTersembunyi && <LencanaPermata />}
            <LencanaTerverifikasi />
          </div>
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded bg-primary/80 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
            <Icon name="photo_library" className="text-[14px]" />
            {totalFoto} foto
          </span>
        </div>
        {galeri.slice(1, 3).map((foto) => (
          <div key={foto} className="relative hidden overflow-hidden bg-surface-container-high sm:block">
            <Image src={foto} alt={`Foto ${destinasi.nama}`} fill sizes="33vw" className="object-cover" />
          </div>
        ))}
      </div>

      {totalFoto > 3 && (
        <details className="mt-2 rounded-xl border border-outline-variant/30 bg-white p-3 shadow-card">
          <summary className="cursor-pointer text-xs font-bold text-primary">
            Lihat semua foto ({totalFoto})
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {semuaGaleri.map((foto, index) => (
              <a
                key={foto}
                href={foto}
                target="_blank"
                rel="noreferrer"
                className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-container-high"
              >
                <Image
                  src={foto}
                  alt={`Foto ${destinasi.nama} ${index + 1}`}
                  fill
                  sizes="25vw"
                  className="object-cover"
                />
              </a>
            ))}
          </div>
        </details>
      )}

      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">
            {destinasi.kategori} · {destinasi.wilayah}
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold leading-tight text-primary sm:text-4xl">
            {destinasi.nama}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Rating value={destinasi.rating} count={destinasi.jumlahUlasan} size="md" />
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-verified">
              <Icon name="verified" className="text-[15px]" />
              Terverifikasi melalui gampong
            </span>
            {destinasi.permataTersembunyi && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary">
                <Icon name="diamond" className="text-[15px]" />
                Permata Tersembunyi
              </span>
            )}
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant">{destinasi.deskripsi}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <form action={toggleFavoritAction}>
            <input type="hidden" name="jenis" value="destinasi" />
            <input type="hidden" name="targetId" value={destinasi.id} />
            <input type="hidden" name="next" value={kembali} />
            <button
              type="submit"
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                favorit
                  ? "border-error/30 bg-error-container text-on-error-container"
                  : "border-outline-variant/50 bg-white text-on-surface-variant hover:border-primary hover:text-primary"
              }`}
            >
              <Icon name="favorite" fill={!!favorit} className="text-[16px]" />
              {favorit ? "Tersimpan" : "Favorit"}
            </button>
          </form>
          <ShareButton />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <InfoCard icon="schedule" label="Jam buka" value={destinasi.jamBuka} />
        <InfoCard
          icon="confirmation_number"
          label="Harga tiket"
          value={destinasi.hargaTiket === 0 ? "Gratis (infaq)" : `${formatRupiah(destinasi.hargaTiket)}/orang`}
        />
        <InfoCard icon="near_me" label="Dari pusat kota" value={`${destinasi.jarakPusat.toLocaleString("id-ID")} km`} />
        <InfoCard icon="hiking" label="Tingkat kesulitan" value={destinasi.tingkatKesulitan} />
      </div>

      <div className="mt-6 lg:hidden">
        <BookingCard destinasi={destinasi} />
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-outline-variant/40">
            {tabs.map((item) => (
              <Link
                key={item.id}
                href={`/destinasi/${destinasi.slug}?tab=${item.id}`}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-bold transition-colors ${
                  aktif === item.id
                    ? "border-secondary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Icon name={item.icon} className="text-[18px]" />
                {item.label}
                {item.id === "ulasan" && (
                  <span className="rounded bg-surface-container px-1.5 py-0.5 text-[10px]">
                    {destinasi.jumlahUlasan.toLocaleString("id-ID")}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="py-5">
            {aktif === "tentang" && (
              <div className="space-y-5">
                <section>
                  <h2 className="font-serif text-2xl font-semibold text-primary">Sejarah &amp; budaya</h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">
                    {destinasi.sejarah}
                  </p>
                </section>
                <section className="rounded-xl border border-outline-variant/30 bg-white p-4 shadow-card">
                  <h3 className="font-serif text-lg font-semibold text-primary">Yang bisa dilakukan</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["Menjelajah bersama pemandu", "Foto arsitektur", "Belajar sejarah", "Kuliner sekitar"].map((item) => (
                      <Chip key={item}>{item}</Chip>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
                    Informasi jam buka, harga, dan akses adalah data contoh untuk prototipe dan akan
                    diverifikasi ulang saat onboarding mitra.
                  </p>
                </section>
                <section>
                  <h3 className="font-serif text-lg font-semibold text-primary">Dikelola bersama</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {destinasi.mitra?.namaUsaha ?? "Pengelola destinasi lokal"} · status{" "}
                    <span className="font-semibold text-verified">{destinasi.mitra?.statusVerifikasi ?? "Terverifikasi"}</span>
                  </p>
                </section>
              </div>
            )}

            {aktif === "akses" && (
              <div className="space-y-5">
                <section>
                  <h2 className="font-serif text-2xl font-semibold text-primary">Akses menuju lokasi</h2>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{destinasi.akses}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <Icon name="location_on" className="text-[16px] text-secondary" />
                    {destinasi.alamat}
                  </p>
                </section>
                <section>
                  <h3 className="font-serif text-lg font-semibold text-primary">Fasilitas</h3>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {fasilitas.map((item) => (
                      <div key={item} className="flex items-center gap-2 rounded-lg border border-outline-variant/30 bg-white px-3 py-2 text-xs font-semibold text-on-surface-variant">
                        <Icon name="check_circle" fill className="text-[16px] text-verified" />
                        {item}
                      </div>
                    ))}
                  </div>
                </section>
                <section className="overflow-hidden rounded-xl border border-outline-variant/40 bg-white shadow-card">
                  <iframe
                    title={`Peta ${destinasi.nama}`}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${destinasi.koordinatLng - 0.02}%2C${destinasi.koordinatLat - 0.015}%2C${destinasi.koordinatLng + 0.02}%2C${destinasi.koordinatLat + 0.015}&layer=mapnik&marker=${destinasi.koordinatLat}%2C${destinasi.koordinatLng}`}
                    className="h-64 w-full border-0"
                    loading="lazy"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/30 p-3">
                    <p className="text-[11px] text-on-surface-variant">Peta © OpenStreetMap contributors</p>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${destinasi.koordinatLat},${destinasi.koordinatLng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-3 py-2 text-xs font-bold text-white"
                    >
                      <Icon name="directions" className="text-[16px]" />
                      Buka arah di peta
                    </a>
                  </div>
                </section>
              </div>
            )}

            {aktif === "etika" && (
              <div>
                <h2 className="font-serif text-2xl font-semibold text-primary">Etika berkunjung</h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Panduan ini disusun bersama gampong dan mengikuti adat serta syariat setempat.
                </p>
                <ol className="mt-4 space-y-3">
                  {etika.map((item, index) => (
                    <li key={item} className="flex gap-3 rounded-xl border border-outline-variant/30 bg-white p-4 shadow-card">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container font-serif text-sm font-bold text-secondary-container">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-on-surface-variant">{item}</p>
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-cream px-4 py-3 text-xs leading-relaxed text-on-surface-variant">
                  <Icon name="info" className="mt-px text-[16px] text-secondary" />
                  Wisatawan dari semua latar belakang disambut dengan hormat selama menjaga adab dan
                  ketenangan warga.
                </div>
              </div>
            )}

            {aktif === "ulasan" && (
              <div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-primary">Ulasan terverifikasi</h2>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      Hanya wisatawan dengan pesanan selesai yang dapat memberi ulasan.
                    </p>
                  </div>
                  <div className="rounded-xl border border-outline-variant/30 bg-white px-4 py-3 text-center shadow-card">
                    <p className="font-serif text-3xl font-bold text-primary">{destinasi.rating.toFixed(1)}</p>
                    <Rating value={destinasi.rating} count={destinasi.jumlahUlasan} />
                  </div>
                </div>
                {ulasan.length === 0 ? (
                  <div className="mt-5 rounded-xl bg-white p-8 text-center shadow-card">
                    <Icon name="rate_review" className="text-[34px] text-outline" />
                    <p className="mt-2 text-sm font-semibold text-primary">Belum ada ulasan tampil</p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      Ulasan akan muncul setelah wisatawan menyelesaikan kunjungan.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {ulasan.map((item) => (
                      <article key={item.id} className="rounded-xl border border-outline-variant/30 bg-white p-4 shadow-card">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-xs font-bold text-primary">
                              {item.pengguna.nama.split(" ").slice(0, 2).map((part) => part[0]).join("")}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-on-surface">{item.pengguna.nama}</p>
                              <p className="text-[11px] text-on-surface-variant">{formatTanggal(item.tanggal)}</p>
                            </div>
                          </div>
                          <Rating value={item.bintang} />
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{item.komentar}</p>
                        {item.foto && (
                          <div className="relative mt-3 h-40 w-full overflow-hidden rounded-lg">
                            <Image src={item.foto} alt="Foto ulasan" fill sizes="600px" className="object-cover" />
                          </div>
                        )}
                        <p className="mt-2 text-[11px] text-on-surface-variant">
                          Pelayanan: <span className="font-semibold text-primary">{item.bintangPelayanan}/5</span>
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <BookingCard destinasi={destinasi} />
          </div>
        </aside>
      </div>

      {destinasi.pemandu.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-semibold text-primary">Pemandu tersedia</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Pemandu lokal terverifikasi untuk destinasi ini.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {destinasi.pemandu.map((relasi) => (
              <GuideCard key={relasi.pemanduId} pemandu={relasi.pemandu} />
            ))}
          </div>
        </section>
      )}

      {destinasi.paket.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-semibold text-primary">Paket yang mencakup tempat ini</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {destinasi.paket.map((relasi) => (
              <PackageCard key={relasi.paketId} paket={relasi.paket} />
            ))}
          </div>
        </section>
      )}

      {penginapanTerdekat.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-semibold text-primary">Penginapan terdekat</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {penginapanTerdekat.map(({ item, jarak }) => (
              <LodgingCard key={item.id} penginapan={item} jarak={jarak} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: string; label: string; value: string }) {
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

function BookingCard({
  destinasi,
}: {
  destinasi: {
    id: string;
    nama: string;
    hargaTiket: number;
    statusVerifikasi: string;
    permataTersembunyi: boolean;
  };
}) {
  return (
    <div className="rounded-xl border border-outline-variant/40 bg-white p-5 shadow-card">
      <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
        {destinasi.hargaTiket === 0 ? "Registrasi kunjungan" : "Harga tiket masuk"}
      </p>
      <p className="mt-1 font-serif text-2xl font-bold text-primary">
        {destinasi.hargaTiket === 0 ? "Gratis" : formatRupiah(destinasi.hargaTiket)}
        {destinasi.hargaTiket === 0 ? (
          <span className="ml-1 text-xs font-medium text-on-surface-variant">(infaq sukarela)</span>
        ) : (
          <span className="ml-1 text-xs font-medium text-on-surface-variant">/orang</span>
        )}
      </p>
      <p className="mt-1 text-[11px] text-on-surface-variant">
        Biaya layanan {formatRupiah(5000)} per pesanan. Pembayaran disimulasikan.
      </p>
      <Link
        href={`/pesan?jenis=destinasi&id=${destinasi.id}`}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-container px-4 py-3 text-sm font-bold text-on-secondary-container shadow-card transition-colors hover:bg-[#d68f29]"
      >
        Pesan sekarang
        <Icon name="arrow_forward" className="text-[17px]" />
      </Link>
      <ul className="mt-4 space-y-2 border-t border-surface-container pt-3">
        {[
          "E-voucher dengan kode QR",
          "Registrasi kunjungan gratis atau berbayar",
          "Pembatalan sebelum bayar tersedia",
        ].map((item) => (
          <li key={item} className="flex items-start gap-1.5 text-[11px] text-on-surface-variant">
            <Icon name="check_circle" fill className="mt-px text-[14px] text-verified" />
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-verified">
        <Icon name="verified" className="text-[14px]" />
        {destinasi.statusVerifikasi === "Terverifikasi" ? "Mitra terverifikasi gampong" : "Menunggu verifikasi"}
      </p>
    </div>
  );
}
