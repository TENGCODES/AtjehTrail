import Link from "next/link";
import { redirect } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { Icon } from "@/components/icon";
import { requireUser } from "@/lib/auth";
import { ambilLayanan } from "@/lib/service";

export const metadata = { title: "Halaman Pesan" };

type Props = {
  searchParams: Promise<{ jenis?: string; id?: string; error?: string }>;
};

export default async function PesanPage({ searchParams }: Props) {
  const p = await searchParams;
  const jenis = p.jenis ?? "";
  const id = p.id ?? "";
  const user = await requireUser(`/pesan?jenis=${jenis}&id=${id}`);
  const layanan = await ambilLayanan(jenis, id);
  if (!layanan) redirect("/jelajah");

  return (
    <div className="container-page py-6 sm:py-8">
      <nav className="flex flex-wrap items-center gap-1 text-[11px] text-on-surface-variant" aria-label="Breadcrumb">
        <Link href="/beranda" className="hover:text-primary">Beranda</Link>
        <Icon name="chevron_right" className="text-[13px]" />
        <Link href={`/jelajah?tab=${jenis === "paket" ? "paket" : jenis}`} className="hover:text-primary">
          {jenis === "paket" ? "Paket Tour" : jenis === "penginapan" ? "Penginapan" : jenis === "pemandu" ? "Pemandu" : "Destinasi"}
        </Link>
        <Icon name="chevron_right" className="text-[13px]" />
        <span className="font-semibold text-primary">Pesan</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">Langkah 1 dari 3</p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-primary sm:text-3xl">Selesaikan pesanan</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Lengkapi data, pilih layanan tambahan, lalu simulasikan pembayaran.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
          {["Data pesanan", "Pembayaran", "E-voucher"].map((step, index) => (
            <span key={step} className="flex items-center gap-1.5">
              {index > 0 && <Icon name="chevron_right" className="text-[13px] text-outline" />}
              <span
                className={`rounded-full px-2.5 py-1 ${
                  index === 0 ? "bg-primary-container text-secondary-container" : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {step}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_300px]">
        <div className="max-w-3xl">
          <BookingForm layanan={layanan} user={{ nama: user.nama, telepon: user.telepon }} error={p.error} />
        </div>
        <aside className="space-y-3 lg:sticky lg:top-24">
          <div className="rounded-xl border border-outline-variant/40 bg-white p-4 shadow-card">
            <h2 className="font-serif text-base font-semibold text-primary">Bantuan pesanan</h2>
            <ul className="mt-2 space-y-2 text-[11px] leading-relaxed text-on-surface-variant">
              <li className="flex gap-1.5">
                <Icon name="support_agent" className="mt-px text-[15px] text-secondary" />
                Tim concierge membantu perubahan jadwal selama pesanan belum dikonfirmasi mitra.
              </li>
              <li className="flex gap-1.5">
                <Icon name="payments" className="mt-px text-[15px] text-secondary" />
                Pembayaran hanya simulasi. Tidak ada dana yang benar-benar ditarik.
              </li>
              <li className="flex gap-1.5">
                <Icon name="event_available" className="mt-px text-[15px] text-secondary" />
                Batas ulasan 14 hari setelah kunjungan berstatus selesai.
              </li>
            </ul>
          </div>
          <div className="rounded-xl bg-cream p-4 text-[11px] leading-relaxed text-on-surface-variant">
            <p className="inline-flex items-center gap-1.5 font-bold text-primary">
              <Icon name="verified" className="text-[15px] text-verified" />
              Mitra terverifikasi
            </p>
            <p className="mt-1.5">
              Layanan dalam pesanan ini berasal dari mitra yang diverifikasi melalui gampong atau
              kelompok sadar wisata.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
