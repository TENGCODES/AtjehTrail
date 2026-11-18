import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/icon";
import { StarInput } from "@/components/star-input";
import { requireUser } from "@/lib/auth";
import { BATAS_ULASAN_HARI, bisakahUlas, JENIS_LAYANAN, sisaHariUlas } from "@/lib/business";
import { prisma } from "@/lib/db";
import { formatTanggal } from "@/lib/format";
import { kirimUlasanAction } from "@/lib/actions/review";

export const metadata = { title: "Beri Ulasan" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function UlasanPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;
  const user = await requireUser(`/pesanan/${id}/ulasan`);

  const pesanan = await prisma.pesanan.findUnique({
    where: { id },
    include: { ulasan: true },
  });
  if (!pesanan || pesanan.penggunaId !== user.id) redirect("/pesanan");
  if (!bisakahUlas(pesanan)) redirect("/pesanan?error=ulasan");

  const label = JENIS_LAYANAN[pesanan.jenisLayanan] ?? "layanan";

  return (
    <div className="container-page max-w-2xl py-6 sm:py-8">
      <nav className="flex items-center gap-1 text-[11px] text-on-surface-variant">
        <Link href="/pesanan?tab=selesai" className="hover:text-primary">Pesanan</Link>
        <Icon name="chevron_right" className="text-[13px]" />
        <span className="font-semibold text-primary">Beri ulasan</span>
      </nav>

      <div className="mt-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">Ulasan terverifikasi</p>
        <h1 className="mt-1 font-serif text-2xl font-bold text-primary sm:text-3xl">Bagikan pengalaman Anda</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Ulasan hanya tersedia untuk pesanan selesai, maksimal {BATAS_ULASAN_HARI} hari setelah
          kunjungan, dan satu ulasan per pesanan.
        </p>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-outline-variant/40 bg-white p-3 shadow-card">
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-container-high">
          <Image
            src={
              pesanan.jenisLayanan === "destinasi"
                ? "/images/destinasi/masjid-raya.jpg"
                : pesanan.jenisLayanan === "paket"
                  ? "/images/paket/jejak-sejarah.jpg"
                  : pesanan.jenisLayanan === "penginapan"
                    ? "/images/penginapan/gampong-nusa.jpg"
                    : "/images/pemandu/mirza.jpg"
            }
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">{label}</p>
          <p className="truncate font-serif text-base font-semibold text-primary">{pesanan.layananNama}</p>
          <p className="mt-0.5 text-[11px] text-on-surface-variant">
            {formatTanggal(pesanan.tanggal)} · {pesanan.jumlahOrang} orang · sisa {sisaHariUlas(pesanan.selesaiAt)} hari
          </p>
        </div>
        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          Selesai
        </span>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-error-container px-3 py-2.5 text-xs font-semibold text-on-error-container">
          <Icon name="error" className="text-[16px]" />
          {error === "komentar"
            ? "Komentar minimal 10 karakter."
            : error === "foto"
              ? "Foto harus berupa gambar maksimal 4 MB."
              : "Periksa kembali data ulasan."}
        </div>
      )}

      <form action={kirimUlasanAction} className="mt-5 space-y-4">
        <input type="hidden" name="pesananId" value={pesanan.id} />

        <section className="space-y-4 rounded-xl border border-outline-variant/40 bg-white p-4 shadow-card">
          <StarInput name="bintang" label={`Bintang ${label.toLowerCase()}`} />
          <StarInput name="bintangPelayanan" label="Bintang pelayanan" defaultValue={5} />
        </section>

        <section className="rounded-xl border border-outline-variant/40 bg-white p-4 shadow-card">
          <label className="block">
            <span className="text-xs font-bold text-on-surface-variant">Komentar</span>
            <textarea
              name="komentar"
              required
              minLength={10}
              rows={4}
              placeholder="Ceritakan pengalaman Anda: pelayanan, kebersihan, pemandu, atau hal yang berkesan."
              className="mt-1.5 w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
            />
          </label>
          <label className="mt-3 block">
            <span className="text-xs font-bold text-on-surface-variant">Foto (opsional)</span>
            <input
              type="file"
              name="foto"
              accept="image/*"
              className="mt-1.5 block w-full cursor-pointer rounded-lg border border-dashed border-outline-variant/60 bg-surface-container-low px-3 py-2.5 text-xs text-on-surface-variant file:mr-3 file:rounded file:border-0 file:bg-primary-container file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
            />
            <span className="mt-1 block text-[10px] text-on-surface-variant">JPG/PNG, maksimal 4 MB.</span>
          </label>
        </section>

        <div className="rounded-xl bg-cream p-4 text-[11px] leading-relaxed text-on-surface-variant">
          <p className="inline-flex items-center gap-1.5 font-bold text-primary">
            <Icon name="info" className="text-[15px] text-secondary" />
            Aturan ulasan
          </p>
          <ul className="mt-1.5 list-inside list-disc space-y-1">
            <li>Satu ulasan untuk setiap pesanan.</li>
            <li>Hanya pesanan berstatus Selesai yang dapat diulas.</li>
            <li>Batas waktu {BATAS_ULASAN_HARI} hari setelah kunjungan selesai.</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-secondary-container px-5 py-3 text-sm font-bold text-on-secondary-container shadow-card transition-colors hover:bg-[#d68f29]"
          >
            <Icon name="send" className="text-[16px]" />
            Kirim ulasan
          </button>
          <Link
            href="/pesanan?tab=selesai"
            className="inline-flex items-center justify-center rounded-lg border border-outline-variant/50 px-4 py-3 text-sm font-bold text-on-surface-variant hover:border-primary hover:text-primary"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
