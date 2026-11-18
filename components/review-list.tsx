import Image from "next/image";
import { formatTanggal } from "@/lib/format";
import { Icon } from "./icon";
import { Rating } from "./rating";

type UlasanItem = {
  id: string;
  bintang: number;
  bintangPelayanan: number;
  komentar: string;
  foto: string | null;
  tanggal: Date;
  pengguna: { nama: string };
};

export function ReviewList({
  ulasan,
  rating,
  jumlah,
}: {
  ulasan: UlasanItem[];
  rating: number;
  jumlah: number;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-primary">Ulasan terverifikasi</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Hanya wisatawan dengan pesanan selesai yang dapat memberi ulasan.
          </p>
        </div>
        <div className="rounded-xl border border-outline-variant/30 bg-white px-4 py-3 text-center shadow-card">
          <p className="font-serif text-3xl font-bold text-primary">{rating.toFixed(1)}</p>
          <Rating value={rating} count={jumlah} />
        </div>
      </div>
      {ulasan.length === 0 ? (
        <div className="mt-4 rounded-xl bg-white p-8 text-center shadow-card">
          <Icon name="rate_review" className="text-[34px] text-outline" />
          <p className="mt-2 text-sm font-semibold text-primary">Belum ada ulasan tampil</p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Ulasan muncul setelah wisatawan menyelesaikan kunjungan.
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
              <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
                <Icon name="verified" className="text-[13px] text-verified" />
                Pelayanan {item.bintangPelayanan}/5 · pesanan terverifikasi
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
