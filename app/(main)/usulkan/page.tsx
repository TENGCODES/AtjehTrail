import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { StatusPesanan } from "@/components/badges";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatTanggal } from "@/lib/format";
import { usulkanTempatAction } from "@/lib/actions/forms";

export const metadata = { title: "Usulkan Tempat" };

type Props = { searchParams: Promise<{ sukses?: string; error?: string }> };

export default async function UsulkanPage({ searchParams }: Props) {
  const p = await searchParams;
  const user = await requireUser("/usulkan");
  const usulan = await prisma.usulanTempat.findMany({
    where: { penggunaId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-page max-w-3xl py-6 sm:py-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">Partisipasi warga</p>
      <h1 className="mt-1 font-serif text-2xl font-bold text-primary sm:text-3xl">Usulkan tempat wisata</h1>
      <p className="mt-1.5 text-sm text-on-surface-variant">
        Bantu warga dan wisatawan menemukan permata tersembunyi. Usulan akan diperiksa bersama
        gampong atau kelompok sadar wisata sebelum tayang.
      </p>

      {p.sukses === "1" && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-verified/30 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-800">
          <Icon name="check_circle" className="text-[16px]" />
          Usulan terkirim. Status: Menunggu Verifikasi.
        </div>
      )}
      {p.error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-error-container px-3 py-2.5 text-xs font-semibold text-on-error-container">
          <Icon name="error" className="text-[16px]" />
          {p.error === "izin"
            ? "Pernyataan izin pemilik lahan wajib dicentang."
            : p.error === "foto"
              ? "Foto harus berupa JPG, PNG, WebP, atau AVIF maksimal 4 MB."
              : "Lengkapi nama, kategori, lokasi, dan deskripsi minimal 20 karakter."}
        </div>
      )}

      <form action={usulkanTempatAction} className="mt-5 space-y-4">
        <section className="rounded-xl border border-outline-variant/40 bg-white p-4 shadow-card">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nama tempat" icon="landscape">
              <input
                name="nama"
                required
                minLength={3}
                placeholder="Contoh: Air Terjun Gle Meuh"
                className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
              />
            </Field>
            <Field label="Kategori" icon="category">
              <select
                name="kategori"
                required
                className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
              >
                {["Alam", "Sejarah", "Budaya", "Religi", "Edukasi Bencana", "Desa Wisata"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Lokasi (alamat / titik peta)" icon="location_on">
              <input
                name="lokasi"
                required
                minLength={3}
                placeholder="Gampong, kecamatan, kabupaten/kota"
                className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
              />
            </Field>
            <Field label="Biaya masuk" icon="payments">
              <input
                name="biaya"
                placeholder="Contoh: Gratis atau Rp5.000"
                className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
              />
            </Field>
          </div>

          <label className="mt-3 block">
            <span className="mb-1 flex items-center gap-1 text-[11px] font-bold text-on-surface-variant">
              <Icon name="description" className="text-[14px]" />
              Deskripsi tempat
            </span>
            <textarea
              name="deskripsi"
              required
              minLength={20}
              rows={3}
              placeholder="Ceritakan keunikan, sejarah singkat, atau daya tarik tempat ini."
              className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
            />
          </label>

          <label className="mt-3 block">
            <span className="mb-1 flex items-center gap-1 text-[11px] font-bold text-on-surface-variant">
              <Icon name="route" className="text-[14px]" />
              Akses
            </span>
            <input
              name="akses"
              placeholder="Kondisi jalan, kendaraan yang disarankan, waktu tempuh."
              className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
            />
          </label>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Kontak pengelola" icon="call">
              <input
                name="kontakPengelola"
                placeholder="Nama dan nomor telepon"
                className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
              />
            </Field>
            <Field label="Foto tempat (opsional)" icon="photo_camera">
              <input
                type="file"
                name="foto"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="block w-full cursor-pointer rounded-lg border border-dashed border-outline-variant/60 bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant file:mr-3 file:rounded file:border-0 file:bg-primary-container file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
              />
            </Field>
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-2 rounded-lg bg-cream p-3 text-[11px] leading-relaxed text-on-surface-variant">
            <input type="checkbox" name="pernyataanIzin" className="mt-0.5 h-4 w-4 accent-primary-container" />
            Saya menyatakan memiliki izin atau telah menghubungi pemilik lahan untuk tempat yang
            berada di tanah warga, dan data yang saya isi benar.
          </label>
        </section>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-container px-5 py-3 text-sm font-bold text-on-secondary-container shadow-card transition-colors hover:bg-[#d68f29]"
        >
          <Icon name="send" className="text-[16px]" />
          Kirim usulan
        </button>
      </form>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-serif text-xl font-semibold text-primary">Usulan saya</h2>
          <span className="rounded bg-surface-container px-2 py-0.5 text-[11px] font-bold text-on-surface-variant">
            {usulan.length}
          </span>
        </div>
        {usulan.length === 0 ? (
          <p className="mt-3 rounded-xl bg-white px-4 py-6 text-center text-xs text-on-surface-variant shadow-card">
            Belum ada usulan. Tempat yang Anda kirim akan tampil di sini beserta status verifikasinya.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {usulan.map((item) => (
              <article key={item.id} className="rounded-xl border border-outline-variant/30 bg-white p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">{item.kategori}</p>
                    <h3 className="mt-0.5 font-serif text-base font-semibold text-primary">{item.nama}</h3>
                    <p className="mt-0.5 text-[11px] text-on-surface-variant">{item.lokasi}</p>
                  </div>
                  <StatusPesanan status={item.status} />
                </div>
                {item.foto && (
                  <Image
                    src={item.foto}
                    alt={`Foto ${item.nama}`}
                    width={320}
                    height={180}
                    className="mt-2 h-32 w-full max-w-[240px] rounded-lg object-cover"
                  />
                )}
                <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">{item.deskripsi}</p>
                <p className="mt-2 text-[10px] text-outline">Dikirim {formatTanggal(item.createdAt)}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="mt-6 rounded-xl bg-primary-container p-4 text-[11px] leading-relaxed text-white/75">
        <p className="inline-flex items-center gap-1.5 font-bold text-secondary-container">
          <Icon name="verified" className="text-[16px]" />
          Alur verifikasi
        </p>
        <p className="mt-1.5">
          Usulan diperiksa berkas dan lokasinya, dikomunikasikan dengan gampong atau kelompok sadar
          wisata, lalu diberi status Menunggu Verifikasi, Disetujui, atau Perlu Perbaikan.
        </p>
        <Link href="/mitra" className="mt-2 inline-flex items-center gap-1 font-bold text-secondary-container hover:underline">
          Ingin mendaftar sebagai mitra?
          <Icon name="arrow_forward" className="text-[14px]" />
        </Link>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1 text-[11px] font-bold text-on-surface-variant">
        <Icon name={icon} className="text-[14px]" />
        {label}
      </span>
      {children}
    </label>
  );
}
