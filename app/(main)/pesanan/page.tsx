import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { StatusPesanan } from "@/components/badges";
import { requireUser } from "@/lib/auth";
import {
  bisakahUlas,
  JENIS_LAYANAN,
  sisaHariUlas,
} from "@/lib/business";
import { prisma } from "@/lib/db";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { petaFotoPesanan } from "@/lib/service";
import {
  batalkanPesananAction,
  bayarPesananAction,
  konfirmasiSelesaiAction,
} from "@/lib/actions/booking";

export const metadata = { title: "Pesanan" };

type Props = {
  searchParams: Promise<{ tab?: string; sukses?: string; ulasan?: string; error?: string; selesai?: string }>;
};

export default async function PesananPage({ searchParams }: Props) {
  const p = await searchParams;
  const user = await requireUser("/pesanan");

  const pesanan = await prisma.pesanan.findMany({
    where: { penggunaId: user.id },
    include: { ulasan: true },
    orderBy: { createdAt: "desc" },
  });
  const fotoMap = await petaFotoPesanan(pesanan);

  const berlangsung = pesanan.filter((item) => ["Menunggu Pembayaran", "Terkonfirmasi"].includes(item.status));
  const selesai = pesanan.filter((item) => ["Selesai", "Dibatalkan"].includes(item.status));
  const tab = p.tab === "selesai" ? "selesai" : "berlangsung";
  const daftar = tab === "selesai" ? selesai : berlangsung;
  const hariIni = new Date().toISOString().slice(0, 10);

  const pesan =
    p.selesai === "1"
      ? "Kunjungan ditandai selesai. Anda dapat memberi ulasan dalam 14 hari."
      : p.ulasan === "sukses"
        ? "Terima kasih, ulasan Anda sudah tersimpan."
        : p.error === "ulasan"
          ? "Ulasan tidak dapat dikirim: periksa status pesanan, batas 14 hari, atau ulasan yang sudah ada."
          : p.error === "batal"
            ? "Pesanan yang sudah lewat tanggal kunjungan tidak dapat dibatalkan."
            : null;

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">Pesanan saya</p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-primary sm:text-3xl">
            Pantau perjalanan Anda
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            E-voucher, status kunjungan, dan ulasan ada di satu tempat.
          </p>
        </div>
        <Link
          href="/jelajah"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-4 py-2.5 text-xs font-bold text-white"
        >
          <Icon name="explore" className="text-[16px]" />
          Jelajah lagi
        </Link>
      </div>

      {pesan && (
        <div
          className={`mt-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold ${
            p.error
              ? "border-red-200 bg-error-container text-on-error-container"
              : "border-verified/30 bg-emerald-50 text-emerald-800"
          }`}
        >
          <Icon name={p.error ? "error" : "check_circle"} className="text-[16px]" />
          {pesan}
        </div>
      )}

      <div className="mt-5 flex gap-1 border-b border-outline-variant/40">
        <Link
          href="/pesanan"
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-bold ${
            tab === "berlangsung" ? "border-secondary text-primary" : "border-transparent text-on-surface-variant"
          }`}
        >
          Berlangsung
          <span className="rounded bg-surface-container px-1.5 py-0.5 text-[10px]">{berlangsung.length}</span>
        </Link>
        <Link
          href="/pesanan?tab=selesai"
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-bold ${
            tab === "selesai" ? "border-secondary text-primary" : "border-transparent text-on-surface-variant"
          }`}
        >
          Selesai
          <span className="rounded bg-surface-container px-1.5 py-0.5 text-[10px]">{selesai.length}</span>
        </Link>
      </div>

      {daftar.length === 0 ? (
        <div className="mt-6 rounded-xl bg-white p-8 text-center shadow-card">
          <Icon name="receipt_long" className="text-[38px] text-outline" />
          <h2 className="mt-2 font-serif text-lg font-semibold text-primary">
            {tab === "berlangsung" ? "Belum ada pesanan berlangsung" : "Belum ada riwayat pesanan"}
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Mulai dari destinasi favorit atau paket tour pilihan.
          </p>
          <Link
            href="/jelajah"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-secondary-container px-4 py-2.5 text-xs font-bold text-on-secondary-container"
          >
            Jelajah destinasi
            <Icon name="arrow_forward" className="text-[15px]" />
          </Link>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {daftar.map((item) => {
            const media = fotoMap.get(`${item.jenisLayanan}:${item.layananId}`);
            const bisa = bisakahUlas(item);
            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-card"
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row">
                  <Link
                    href={media?.href ?? "/jelajah"}
                    className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg bg-surface-container-high sm:h-28 sm:w-40"
                  >
                    {media ? (
                      <Image src={media.foto} alt={item.layananNama} fill sizes="160px" className="object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center">
                        <Icon name="confirmation_number" className="text-[28px] text-outline" />
                      </span>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                          {JENIS_LAYANAN[item.jenisLayanan]} · {item.kode}
                        </p>
                        <h2 className="mt-0.5 font-serif text-lg font-semibold leading-snug text-primary">
                          {item.layananNama}
                        </h2>
                      </div>
                      <StatusPesanan status={item.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-on-surface-variant">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="calendar_month" className="text-[14px]" />
                        {formatTanggal(item.tanggal)}
                        {item.tanggalSelesai ? ` – ${formatTanggal(item.tanggalSelesai)}` : ""}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Icon name="group" className="text-[14px]" />
                        {item.jumlahOrang} orang
                        {item.jumlahMalam > 0 ? ` · ${item.jumlahMalam} malam` : ""}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-primary">
                        <Icon name="payments" className="text-[14px]" />
                        {formatRupiah(item.total)}
                      </span>
                    </div>
                    {item.antarJemput && (
                      <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-verified">
                        <Icon name="airport_shuttle" className="text-[13px]" />
                        Termasuk antar-jemput
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-surface-container pt-3">
                      {item.status === "Menunggu Pembayaran" && (
                        <>
                          <form action={bayarPesananAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-secondary-container px-3 py-2 text-[11px] font-bold text-on-secondary-container"
                            >
                              <Icon name="payments" className="text-[15px]" />
                              Bayar sekarang (simulasi)
                            </button>
                          </form>
                          <form action={batalkanPesananAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/50 px-3 py-2 text-[11px] font-bold text-on-surface-variant hover:border-error hover:text-error"
                            >
                              Batalkan
                            </button>
                          </form>
                        </>
                      )}

                      {item.status === "Terkonfirmasi" && (
                        <>
                          <Link
                            href={`/konfirmasi/${item.kode}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-3 py-2 text-[11px] font-bold text-white"
                          >
                            <Icon name="qr_code_2" className="text-[15px]" />
                            E-voucher
                          </Link>
                          <form action={konfirmasiSelesaiAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-verified/40 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-800"
                            >
                              <Icon name="task_alt" className="text-[15px]" />
                              Konfirmasi selesai
                            </button>
                          </form>
                          {item.tanggal >= hariIni && (
                            <form action={batalkanPesananAction}>
                              <input type="hidden" name="id" value={item.id} />
                              <button
                                type="submit"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/50 px-3 py-2 text-[11px] font-bold text-on-surface-variant hover:border-error hover:text-error"
                              >
                                Batalkan
                              </button>
                            </form>
                          )}
                        </>
                      )}

                      {item.status === "Selesai" && (
                        <>
                          <Link
                            href={`/konfirmasi/${item.kode}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/50 px-3 py-2 text-[11px] font-bold text-on-surface-variant hover:border-primary hover:text-primary"
                          >
                            <Icon name="qr_code_2" className="text-[15px]" />
                            Lihat e-voucher
                          </Link>
                          {item.ulasan ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-800">
                              <Icon name="star" fill className="text-[15px] text-secondary" />
                              Ulasan terkirim ({item.ulasan.bintang}/5)
                            </span>
                          ) : bisa ? (
                            <Link
                              href={`/pesanan/${item.id}/ulasan`}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-secondary-container px-3 py-2 text-[11px] font-bold text-on-secondary-container"
                            >
                              <Icon name="rate_review" className="text-[15px]" />
                              Beri ulasan · sisa {sisaHariUlas(item.selesaiAt)} hari
                            </Link>
                          ) : (
                            <span className="text-[11px] text-on-surface-variant">
                              Batas ulasan 14 hari telah lewat.
                            </span>
                          )}
                        </>
                      )}

                      {item.status === "Dibatalkan" && (
                        <span className="text-[11px] text-on-surface-variant">
                          Pesanan dibatalkan.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
