import { prisma } from "./db";
import { parseJson } from "./format";

export type LayananRingkas = {
  jenis: string;
  id: string;
  nama: string;
  foto: string;
  harga: number;
  satuan: string;
  minimalOrang: number;
  butuhMalam: boolean;
  tanggalDefault: string;
  tanggalTersedia?: string[];
  antarJemputTersedia: boolean;
  pemanduTersedia: boolean;
  catatan?: string;
};

export async function ambilLayanan(jenis: string, id: string): Promise<LayananRingkas | null> {
  if (jenis === "destinasi") {
    const data = await prisma.destinasi.findUnique({ where: { id } });
    if (!data) return null;
    return {
      jenis,
      id,
      nama: data.nama,
      foto: data.foto,
      harga: data.hargaTiket,
      satuan: "orang",
      minimalOrang: 1,
      butuhMalam: false,
      tanggalDefault: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
      antarJemputTersedia: true,
      pemanduTersedia: true,
    };
  }
  if (jenis === "penginapan") {
    const data = await prisma.penginapan.findUnique({ where: { id } });
    if (!data) return null;
    return {
      jenis,
      id,
      nama: data.nama,
      foto: data.foto,
      harga: data.hargaPerMalam,
      satuan: "malam",
      minimalOrang: 1,
      butuhMalam: true,
      tanggalDefault: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
      antarJemputTersedia: true,
      pemanduTersedia: true,
    };
  }
  if (jenis === "pemandu") {
    const data = await prisma.pemandu.findUnique({ where: { id } });
    if (!data) return null;
    const tanggalTersedia = parseJson<string[]>(data.ketersediaan, []).filter(Boolean);
    return {
      jenis,
      id,
      nama: data.nama,
      foto: data.foto,
      harga: data.tarif,
      satuan: "sesi",
      minimalOrang: 1,
      butuhMalam: false,
      tanggalDefault:
        tanggalTersedia[0] ?? new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
      tanggalTersedia,
      antarJemputTersedia: true,
      pemanduTersedia: false,
    };
  }
  if (jenis === "paket") {
    const data = await prisma.paket.findUnique({ where: { id } });
    if (!data) return null;
    return {
      jenis,
      id,
      nama: data.judul,
      foto: data.foto,
      harga: data.hargaPerOrang,
      satuan: "orang",
      minimalOrang: data.minimalOrang,
      butuhMalam: false,
      tanggalDefault: data.tanggalKeberangkatan,
      antarJemputTersedia: !data.antarJemput,
      pemanduTersedia: !data.pemandu,
      catatan: data.antarJemput ? "Paket sudah termasuk antar-jemput." : undefined,
    };
  }
  return null;
}

export async function petaFotoPesanan(
  pesanan: { jenisLayanan: string; layananId: string }[],
) {
  const ids = (jenis: string) =>
    pesanan.filter((item) => item.jenisLayanan === jenis).map((item) => item.layananId);

  const [destinasi, penginapan, pemandu, paket] = await Promise.all([
    prisma.destinasi.findMany({
      where: { id: { in: ids("destinasi") } },
      select: { id: true, foto: true, slug: true },
    }),
    prisma.penginapan.findMany({
      where: { id: { in: ids("penginapan") } },
      select: { id: true, foto: true },
    }),
    prisma.pemandu.findMany({
      where: { id: { in: ids("pemandu") } },
      select: { id: true, foto: true },
    }),
    prisma.paket.findMany({
      where: { id: { in: ids("paket") } },
      select: { id: true, foto: true, slug: true },
    }),
  ]);

  const map = new Map<string, { foto: string; href: string }>();
  destinasi.forEach((item) => map.set(`destinasi:${item.id}`, { foto: item.foto, href: `/destinasi/${item.slug}` }));
  penginapan.forEach((item) => map.set(`penginapan:${item.id}`, { foto: item.foto, href: `/penginapan/${item.id}` }));
  pemandu.forEach((item) => map.set(`pemandu:${item.id}`, { foto: item.foto, href: `/pemandu/${item.id}` }));
  paket.forEach((item) => map.set(`paket:${item.id}`, { foto: item.foto, href: `/paket/${item.slug}` }));
  return map;
}
