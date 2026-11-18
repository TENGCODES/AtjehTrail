import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { Icon } from "@/components/icon";
import { Logo } from "@/components/logo";
import { PrintButton } from "@/components/print-button";
import { requireUser } from "@/lib/auth";
import { bayarPesananAction } from "@/lib/actions/booking";
import { JENIS_LAYANAN } from "@/lib/business";
import { prisma } from "@/lib/db";
import { formatRupiah, formatTanggal } from "@/lib/format";

export const metadata = { title: "Konfirmasi & E-voucher" };

type Props = { params: Promise<{ kode: string }> };

export default async function KonfirmasiPage({ params }: Props) {
  const { kode } = await params;
  const user = await requireUser(`/konfirmasi/${kode}`);
  const pesanan = await prisma.pesanan.findUnique({ where: { kode } });
  if (!pesanan) notFound();
  if (pesanan.penggunaId !== user.id) redirect("/pesanan");

  const pending = pesanan.status === "Menunggu Pembayaran";
  const batal = pesanan.status === "Dibatalkan";
  const aktif = !pending && !batal;

  const qr = aktif
    ? await QRCode.toDataURL(
        `ATJEHTRAIL|${pesanan.kode}|${pesanan.kodeVoucher}|${pesanan.namaPemesan}|${pesanan.tanggal}`,
        { width: 240, margin: 1, color: { dark: "#103629", light: "#ffffff" } },
      )
    : null;

  return (
    <div>
      <header className="no-print border-b border-outline-variant/40 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo compact />
          <Link href="/pesanan" className="text-xs font-bold text-primary hover:underline">
            Pesanan saya
          </Link>
        </div>
      </header>
      <div className="container-page max-w-3xl py-8">
        <div className="text-center">
          <span
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full shadow-card ${
              pending
                ? "bg-secondary-container text-on-secondary-container"
                : batal
                  ? "bg-surface-container text-on-surface-variant"
                  : "bg-verified text-white"
            }`}
          >
            <Icon
              name={pending ? "payments" : batal ? "cancel" : "check"}
              className="text-[34px]"
            />
          </span>
          <p
            className={`mt-4 text-[11px] font-bold uppercase tracking-[0.16em] ${
              pending ? "text-secondary" : batal ? "text-on-surface-variant" : "text-verified"
            }`}
          >
            {pending
              ? "Menunggu pembayaran"
              : batal
                ? "Pesanan dibatalkan"
                : "Pembayaran simulasi berhasil"}
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-primary">
            {pending ? "Selesaikan pembayaran" : batal ? "Pesanan dibatalkan" : "Pesanan dikonfirmasi"}
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            {pending
              ? "Pesanan sudah dibuat. Simulasikan pembayaran untuk membuka e-voucher."
              : batal
                ? "Pesanan ini dibatalkan dan tidak memiliki e-voucher aktif."
                : "E-voucher Anda sudah siap. Tunjukkan kode QR saat tiba di lokasi."}
          </p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-outline-variant/50 bg-white px-3 py-1.5 text-xs font-bold text-primary shadow-card">
            <Icon name="confirmation_number" className="text-[16px] text-secondary" />
            {pesanan.kode}
          </p>
        </div>

        <div className="print-card mt-6 overflow-hidden rounded-xl border border-outline-variant/40 bg-white shadow-card">
          <div className="flex items-center justify-between gap-3 bg-primary-container px-5 py-4 text-white">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-secondary-container">
                E-voucher AtjehTrail
              </p>
              <p className="mt-0.5 font-serif text-lg font-semibold">
                {JENIS_LAYANAN[pesanan.jenisLayanan] ?? "Pesanan"}
              </p>
            </div>
            <span className="rounded border border-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/80">
              {pesanan.status}
            </span>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-[200px_1fr]">
            {pending ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant/60 bg-surface-container-low p-5 text-center">
                <Icon name="payments" className="text-[46px] text-secondary" />
                <p className="mt-2 text-xs font-bold text-primary">Pembayaran simulasi</p>
                <p className="mt-1 text-[10px] leading-relaxed text-on-surface-variant">
                  E-voucher dan kode QR muncul setelah pembayaran diselesaikan.
                </p>
              </div>
            ) : batal ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant/60 bg-surface-container-low p-5 text-center">
                <Icon name="cancel" className="text-[46px] text-on-surface-variant" />
                <p className="mt-2 text-xs font-bold text-primary">E-voucher tidak aktif</p>
                <p className="mt-1 text-[10px] leading-relaxed text-on-surface-variant">
                  Buat pesanan baru bila ingin berkunjung.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant/60 bg-surface-container-low p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr!} alt={`Kode QR ${pesanan.kode}`} className="h-44 w-44" />
                <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Pindai untuk verifikasi
                </p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                {JENIS_LAYANAN[pesanan.jenisLayanan]}
              </p>
              <h2 className="mt-1 font-serif text-xl font-bold leading-snug text-primary">
                {pesanan.layananNama}
              </h2>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <Info label="Kode pesanan" value={pesanan.kode} />
                <Info label="Kode voucher" value={pesanan.kodeVoucher} />
                <Info
                  label={pesanan.jenisLayanan === "penginapan" ? "Tanggal masuk" : "Tanggal kunjungan"}
                  value={formatTanggal(pesanan.tanggal)}
                />
                {pesanan.tanggalSelesai && (
                  <Info label="Tanggal keluar" value={formatTanggal(pesanan.tanggalSelesai)} />
                )}
                <Info label="Peserta" value={`${pesanan.jumlahOrang} orang`} />
                {pesanan.jumlahMalam > 0 && (
                  <Info label="Durasi" value={`${pesanan.jumlahMalam} malam`} />
                )}
                <Info label="Pemesan" value={pesanan.namaPemesan} />
                <Info label="Metode" value={`${pesanan.metodePembayaran ?? "-"} (simulasi)`} />
              </dl>
              <div className="mt-3 rounded-lg bg-surface-container-low p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">
                    {pending ? "Total tagihan" : "Total dibayar"}
                  </span>
                  <span className="font-bold text-primary">{formatRupiah(pesanan.total)}</span>
                </div>
                <p className="mt-1 text-[10px] text-on-surface-variant">
                  Termasuk biaya layanan {formatRupiah(pesanan.biayaLayanan)}. Pembayaran
                  disimulasikan.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-outline-variant/40 px-5 py-3 text-[11px] leading-relaxed text-on-surface-variant">
            {pending
              ? "Klik Bayar sekarang untuk menyimulasikan pembayaran. Setelah berhasil, e-voucher dapat ditunjukkan kepada mitra."
              : batal
                ? "Pesanan ini sudah dibatalkan. Hubungi concierge bila membutuhkan bantuan."
                : "Tunjukkan e-voucher ini kepada mitra. Setelah kunjungan, konfirmasi selesai di halaman Pesanan untuk membuka kesempatan memberi ulasan."}
          </div>
        </div>

        {pending && (
          <form action={bayarPesananAction} className="no-print mt-4">
            <input type="hidden" name="id" value={pesanan.id} />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-container px-5 py-3 text-sm font-bold text-on-secondary-container shadow-card transition-colors hover:bg-[#d68f29]"
            >
              <Icon name="payments" className="text-[17px]" />
              Bayar sekarang (simulasi)
            </button>
          </form>
        )}

        <div className="no-print mt-5 flex flex-wrap items-center justify-center gap-2">
          {aktif && <PrintButton />}
          <Link
            href="/pesanan"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-primary"
          >
            <Icon name="receipt_long" className="text-[16px]" />
            Lihat pesanan
          </Link>
          <Link
            href="/beranda"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
          >
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
        {label}
      </dt>
      <dd className="mt-0.5 font-semibold text-on-surface">{value}</dd>
    </div>
  );
}
