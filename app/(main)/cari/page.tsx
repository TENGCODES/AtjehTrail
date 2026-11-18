import Link from "next/link";
import { DestinationCard } from "@/components/destination-card";
import { GuideCard } from "@/components/guide-card";
import { Icon } from "@/components/icon";
import { LodgingCard } from "@/components/lodging-card";
import { PackageCard } from "@/components/package-card";
import { SearchForm } from "@/components/search-form";
import { prisma } from "@/lib/db";

export const metadata = { title: "Pencarian" };

const populer = [
  "Masjid Raya Baiturrahman",
  "Pantai Lhok Mee",
  "Museum Tsunami",
  "Pemandu sejarah",
  "Homestay Aceh Besar",
];

type Props = {
  searchParams: Promise<{ q?: string; tanggal?: string }>;
};

export default async function CariPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();

  const [destinasi, penginapan, pemandu, paket] = q
    ? await Promise.all([
        prisma.destinasi.findMany({
          where: {
            OR: [
              { nama: { contains: q } },
              { deskripsi: { contains: q } },
              { kategori: { contains: q } },
              { wilayah: { contains: q } },
            ],
          },
          orderBy: { populer: "desc" },
          take: 6,
        }),
        prisma.penginapan.findMany({
          where: { OR: [{ nama: { contains: q } }, { deskripsi: { contains: q } }, { jenis: { contains: q } }] },
          take: 4,
        }),
        prisma.pemandu.findMany({
          where: {
            OR: [
              { nama: { contains: q } },
              { keahlian: { contains: q } },
              { area: { contains: q } },
              { deskripsi: { contains: q } },
            ],
          },
          take: 4,
        }),
        prisma.paket.findMany({
          where: { OR: [{ judul: { contains: q } }, { deskripsi: { contains: q } }] },
          take: 4,
        }),
      ])
    : [[], [], [], []];

  const total = destinasi.length + penginapan.length + pemandu.length + paket.length;

  return (
    <div className="container-page py-6 sm:py-10">
      <div className="rounded-xl bg-primary-container p-5 text-white sm:p-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary-container">
          Pencarian
        </p>
        <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">Cari di seluruh AtjehTrail</h1>
        <SearchForm defaultValue={q} populer={populer} />
      </div>

      {!q && (
        <div className="mt-8 rounded-xl border border-dashed border-outline-variant/60 bg-white p-6 text-center">
          <Icon name="travel_explore" className="text-[40px] text-secondary" />
          <h2 className="mt-2 font-serif text-xl font-semibold text-primary">
            Mulai dari kata kunci
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-on-surface-variant">
            Hasil dikelompokkan menjadi destinasi, penginapan, pemandu, dan paket tour. Setiap hasil
            menuju halaman detailnya.
          </p>
        </div>
      )}

      {q && (
        <div className="mt-6 space-y-9">
          <p className="text-sm text-on-surface-variant">
            Menampilkan <span className="font-bold text-primary">{total}</span> hasil untuk{" "}
            <span className="font-bold text-primary">&ldquo;{q}&rdquo;</span>
            {params.tanggal ? ` · tanggal ${params.tanggal}` : ""}
          </p>

          {total === 0 && (
            <div className="rounded-xl bg-white p-8 text-center shadow-card">
              <Icon name="search_off" className="text-[36px] text-outline" />
              <h2 className="mt-2 font-serif text-lg font-semibold text-primary">
                Belum ada hasil yang cocok
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Coba kata kunci lain atau telusuri seluruh katalog lewat menu Jelajah.
              </p>
              <Link
                href="/jelajah"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-4 py-2.5 text-xs font-bold text-white"
              >
                Buka Jelajah
                <Icon name="arrow_forward" className="text-[15px]" />
              </Link>
            </div>
          )}

          {destinasi.length > 0 && (
            <section>
              <HasilHeading icon="explore" label="Destinasi" count={destinasi.length} />
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {destinasi.map((item) => (
                  <DestinationCard key={item.id} destinasi={item} />
                ))}
              </div>
            </section>
          )}

          {penginapan.length > 0 && (
            <section>
              <HasilHeading icon="cottage" label="Penginapan" count={penginapan.length} />
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {penginapan.map((item) => (
                  <LodgingCard key={item.id} penginapan={item} />
                ))}
              </div>
            </section>
          )}

          {pemandu.length > 0 && (
            <section>
              <HasilHeading icon="badge" label="Pemandu" count={pemandu.length} />
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pemandu.map((item) => (
                  <GuideCard key={item.id} pemandu={item} />
                ))}
              </div>
            </section>
          )}

          {paket.length > 0 && (
            <section>
              <HasilHeading icon="luggage" label="Paket Tour" count={paket.length} />
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {paket.map((item) => (
                  <PackageCard key={item.id} paket={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function HasilHeading({ icon, label, count }: { icon: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-secondary-container">
        <Icon name={icon} className="text-[18px]" />
      </span>
      <h2 className="font-serif text-xl font-semibold text-primary">{label}</h2>
      <span className="rounded bg-surface-container px-1.5 py-0.5 text-[11px] font-bold text-on-surface-variant">
        {count}
      </span>
    </div>
  );
}
