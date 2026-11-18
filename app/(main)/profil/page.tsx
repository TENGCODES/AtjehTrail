import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { DestinationCard } from "@/components/destination-card";
import { Rating } from "@/components/rating";
import { requireUser, initials } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { JENIS_LAYANAN } from "@/lib/business";
import { hapusFavoritAction } from "@/lib/actions/favorites";
import { keluarAction } from "@/lib/actions/auth";
import { perbaruiFotoProfilAction } from "@/lib/actions/profile";

export const metadata = { title: "Profil" };

type Props = { searchParams: Promise<{ foto?: string; error?: string }> };

export default async function ProfilPage({ searchParams }: Props) {
  const p = await searchParams;
  const user = await requireUser("/profil");
  const [pesanan, favorit, ulasan] = await Promise.all([
    prisma.pesanan.findMany({ where: { penggunaId: user.id } }),
    prisma.favorit.findMany({ where: { penggunaId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.ulasan.findMany({ where: { penggunaId: user.id }, orderBy: { tanggal: "desc" } }),
  ]);

  const favoritDestinasiIds = favorit.filter((item) => item.jenis === "destinasi").map((item) => item.targetId);
  const destinasiFavorit = await prisma.destinasi.findMany({ where: { id: { in: favoritDestinasiIds } } });

  const targetIds = (jenis: string) => ulasan.filter((item) => item.targetJenis === jenis).map((item) => item.targetId);
  const [destinasiUlas, penginapanUlas, pemanduUlas, paketUlas] = await Promise.all([
    prisma.destinasi.findMany({ where: { id: { in: targetIds("destinasi") } }, select: { id: true, nama: true } }),
    prisma.penginapan.findMany({ where: { id: { in: targetIds("penginapan") } }, select: { id: true, nama: true } }),
    prisma.pemandu.findMany({ where: { id: { in: targetIds("pemandu") } }, select: { id: true, nama: true } }),
    prisma.paket.findMany({ where: { id: { in: targetIds("paket") } }, select: { id: true, judul: true } }),
  ]);
  const namaTarget = new Map<string, string>();
  destinasiUlas.forEach((item) => namaTarget.set(`destinasi:${item.id}`, item.nama));
  penginapanUlas.forEach((item) => namaTarget.set(`penginapan:${item.id}`, item.nama));
  pemanduUlas.forEach((item) => namaTarget.set(`pemandu:${item.id}`, item.nama));
  paketUlas.forEach((item) => namaTarget.set(`paket:${item.id}`, item.judul));

  const totalBelanja = pesanan
    .filter((item) => ["Terkonfirmasi", "Selesai"].includes(item.status))
    .reduce((total, item) => total + item.total, 0);

  return (
    <div className="container-page py-6 sm:py-8">
      {p.foto === "ok" && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-verified/30 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-800">
          <Icon name="check_circle" className="text-[16px]" />
          Foto profil berhasil diperbarui.
        </div>
      )}
      {p.error === "foto" && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-error-container px-3 py-2.5 text-xs font-semibold text-on-error-container">
          <Icon name="error" className="text-[16px]" />
          Pilih foto JPG, PNG, WebP, atau AVIF maksimal 4 MB.
        </div>
      )}
      <section className="overflow-hidden rounded-2xl bg-primary-container text-white">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-7">
          {user.foto ? (
            <Image
              src={user.foto}
              alt={user.nama}
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-secondary-container font-serif text-2xl font-bold text-on-secondary-container">
              {initials(user.nama)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary-container">
              {user.mitra ? "Akun mitra" : "Wisatawan"}
            </p>
            <h1 className="mt-0.5 font-serif text-2xl font-bold">{user.nama}</h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/70">
              <span className="inline-flex items-center gap-1">
                <Icon name="alternate_email" className="text-[14px]" />
                {user.email}
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="call" className="text-[14px]" />
                {user.telepon}
              </span>
            </div>
            <form action={perbaruiFotoProfilAction} className="mt-3 flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-[10px] font-bold text-white/80 transition-colors hover:bg-white/20">
                <Icon name="photo_camera" className="text-[14px]" />
                {user.foto ? "Ganti foto" : "Unggah foto"}
                <input
                  type="file"
                  name="foto"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  required
                  className="sr-only"
                />
              </label>
              <button
                type="submit"
                className="rounded-lg bg-secondary-container px-2.5 py-1.5 text-[10px] font-bold text-on-secondary-container"
              >
                Simpan
              </button>
            </form>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center sm:min-w-[260px]">
            <Stat label="Pesanan" value={String(pesanan.length)} />
            <Stat label="Ulasan" value={String(ulasan.length)} />
            <Stat label="Favorit" value={String(favorit.length)} />
          </div>
        </div>
        {user.mitra && (
          <div className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-white/5 px-5 py-3 text-xs sm:px-7">
            <Icon name="handshake" className="text-[16px] text-secondary-container" />
            Mitra: <span className="font-bold">{user.mitra.namaUsaha}</span>
            <span className="rounded border border-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
              {user.mitra.statusVerifikasi}
            </span>
            <Link href="/mitra" className="ml-auto font-bold text-secondary-container hover:underline">
              Kelola pengajuan
            </Link>
          </div>
        )}
      </section>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section id="favorit" className="rounded-xl border border-outline-variant/30 bg-white p-4 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-serif text-xl font-semibold text-primary">Favorit</h2>
              <span className="rounded bg-surface-container px-2 py-0.5 text-[11px] font-bold text-on-surface-variant">
                {favorit.length} destinasi
              </span>
            </div>
            {destinasiFavorit.length === 0 ? (
              <p className="mt-3 rounded-lg bg-surface-container-low px-4 py-6 text-center text-xs text-on-surface-variant">
                Belum ada destinasi tersimpan. Tekan tombol Favorit di halaman destinasi.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {destinasiFavorit.map((destinasi) => {
                  const fav = favorit.find((item) => item.targetId === destinasi.id && item.jenis === "destinasi");
                  return (
                    <div key={destinasi.id} className="flex items-center gap-3 rounded-lg border border-outline-variant/30 p-2.5">
                      <Link href={`/destinasi/${destinasi.slug}`} className="min-w-0 flex-1">
                        <p className="truncate font-serif text-sm font-semibold text-primary hover:text-secondary">
                          {destinasi.nama}
                        </p>
                        <p className="mt-0.5 text-[11px] text-on-surface-variant">
                          {destinasi.kategori} · {destinasi.wilayah} · {destinasi.rating.toFixed(1)}
                        </p>
                      </Link>
                      {fav && (
                        <form action={hapusFavoritAction}>
                          <input type="hidden" name="id" value={fav.id} />
                          <button
                            type="submit"
                            aria-label={`Hapus ${destinasi.nama} dari favorit`}
                            className="rounded-lg p-2 text-outline transition-colors hover:bg-error-container hover:text-error"
                          >
                            <Icon name="delete" className="text-[18px]" />
                          </button>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {destinasiFavorit.length > 0 && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {destinasiFavorit.slice(0, 2).map((destinasi) => (
                  <DestinationCard key={destinasi.id} destinasi={destinasi} />
                ))}
              </div>
            )}
          </section>

          <section id="ulasan" className="rounded-xl border border-outline-variant/30 bg-white p-4 shadow-card">
            <h2 className="font-serif text-xl font-semibold text-primary">Ulasan saya</h2>
            {ulasan.length === 0 ? (
              <p className="mt-3 rounded-lg bg-surface-container-low px-4 py-6 text-center text-xs text-on-surface-variant">
                Ulasan tersedia setelah pesanan selesai. Buka menu Pesanan untuk menulis ulasan.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {ulasan.map((item) => (
                  <article key={item.id} className="rounded-lg border border-outline-variant/30 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-primary">
                        {namaTarget.get(`${item.targetJenis}:${item.targetId}`) ?? JENIS_LAYANAN[item.targetJenis]}
                      </p>
                      <Rating value={item.bintang} />
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{item.komentar}</p>
                    <p className="mt-1 text-[10px] text-outline">
                      {formatTanggal(item.tanggal)} · pelayanan {item.bintangPelayanan}/5
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-outline-variant/30 bg-white p-4 shadow-card">
            <h2 className="font-serif text-lg font-semibold text-primary">Menu</h2>
            <div className="mt-2 space-y-1">
              <MenuRow href="#favorit" icon="favorite" label="Favorit" />
              <MenuRow href="#ulasan" icon="rate_review" label="Ulasan Saya" />
              <MenuRow href="/usulkan" icon="add_location_alt" label="Usulkan Tempat" />
              <MenuRow href="/mitra" icon="handshake" label="Daftar Mitra" />
            </div>
            <details className="mt-2 rounded-lg border border-outline-variant/30">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-xs font-semibold text-on-surface-variant [&::-webkit-details-marker]:hidden">
                <Icon name="notifications" className="text-[18px]" />
                Pengaturan notifikasi
              </summary>
              <div className="space-y-2 border-t border-surface-container px-3 py-2.5 text-[11px] text-on-surface-variant">
                <label className="flex items-center justify-between gap-2">
                  Notifikasi email
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary-container" />
                </label>
                <label className="flex items-center justify-between gap-2">
                  Notifikasi WhatsApp
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary-container" />
                </label>
                <p className="text-[10px] text-outline">Preferensi disimulasikan pada prototipe.</p>
              </div>
            </details>
            <details className="mt-1 rounded-lg border border-outline-variant/30">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-xs font-semibold text-on-surface-variant [&::-webkit-details-marker]:hidden">
                <Icon name="help" className="text-[18px]" />
                Bantuan
              </summary>
              <div className="border-t border-surface-container px-3 py-2.5 text-[11px] leading-relaxed text-on-surface-variant">
                Hubungi concierge AtjehTrail di <span className="font-semibold text-primary">bantuan@atjehtrail.id</span>{" "}
                atau 0651-555-2026 (Senin–Jumat, 09.00–17.00 WIB).
              </div>
            </details>
            <form action={keluarAction} className="mt-2">
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold text-error transition-colors hover:bg-error-container"
              >
                <Icon name="logout" className="text-[18px]" />
                Keluar akun
              </button>
            </form>
          </section>

          <section className="rounded-xl bg-cream p-4 text-[11px] leading-relaxed text-on-surface-variant">
            <p className="inline-flex items-center gap-1.5 font-bold text-primary">
              <Icon name="savings" className="text-[16px] text-secondary" />
              Total transaksi
            </p>
            <p className="mt-1 font-serif text-xl font-bold text-primary">{formatRupiah(totalBelanja)}</p>
            <p className="mt-1">Akumulasi pesanan terkonfirmasi dan selesai (simulasi).</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 px-2 py-2">
      <p className="font-serif text-xl font-bold text-white">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">{label}</p>
    </div>
  );
}

function MenuRow({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
    >
      <Icon name={icon} className="text-[18px]" />
      {label}
      <Icon name="chevron_right" className="ml-auto text-[16px] text-outline" />
    </Link>
  );
}
