export const BIAYA_LAYANAN = 5000;
export const TARIF_ANTAR_JEMPUT = 50000;
export const TARIF_PEMANDU_TAMBAHAN = 150000;
export const BATAS_ULASAN_HARI = 14;

export const KOMISI: Record<string, number> = {
  destinasi: 0.08,
  pemandu: 0.15,
  penginapan: 0.1,
  paket: 0.12,
};

export const JENIS_LAYANAN: Record<string, string> = {
  destinasi: "Destinasi",
  pemandu: "Pemandu",
  penginapan: "Penginapan",
  paket: "Paket Tour",
};

export const STATUS_PESANAN = [
  "Menunggu Pembayaran",
  "Terkonfirmasi",
  "Selesai",
  "Dibatalkan",
] as const;

export function hitungKomisi(jenis: string, subtotal: number) {
  return Math.round((KOMISI[jenis] ?? 0) * subtotal);
}

export function statusPesananClass(status: string) {
  switch (status) {
    case "Terkonfirmasi":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Selesai":
      return "bg-primary-container text-white border-primary-container";
    case "Dibatalkan":
      return "bg-error-container text-on-error-container border-red-200";
    default:
      return "bg-amber-50 text-amber-800 border-amber-200";
  }
}

export function bisakahUlas(order: {
  status: string;
  selesaiAt: Date | null;
  ulasan?: unknown;
}) {
  if (order.status !== "Selesai" || order.ulasan) return false;
  if (!order.selesaiAt) return false;
  const batas = new Date(order.selesaiAt.getTime() + BATAS_ULASAN_HARI * 86_400_000);
  return new Date() <= batas;
}

export function sisaHariUlas(selesaiAt: Date | null) {
  if (!selesaiAt) return 0;
  const batas = new Date(selesaiAt.getTime() + BATAS_ULASAN_HARI * 86_400_000);
  return Math.max(0, Math.ceil((batas.getTime() - Date.now()) / 86_400_000));
}

export function buatKodePesanan() {
  const now = new Date();
  const stamp = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const acak = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ATJ-${stamp}-${acak}`;
}
