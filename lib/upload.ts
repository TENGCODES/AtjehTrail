import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAKS_UKURAN = 4 * 1024 * 1024;

const EKSTENSI_GAMBAR: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

const EKSTENSI_DOKUMEN: Record<string, string> = {
  ...EKSTENSI_GAMBAR,
  "application/pdf": ".pdf",
};

async function simpan(
  file: File,
  folder: string,
  daftarEkstensi: Record<string, string>,
) {
  if (file.size > MAKS_UKURAN) {
    throw new Error("UKURAN");
  }

  const ekstensi = daftarEkstensi[file.type];
  if (!ekstensi) {
    throw new Error("TIPE");
  }

  const nama = `${Date.now()}-${randomUUID().slice(0, 8)}${ekstensi}`;
  const map = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(map, { recursive: true });
  await writeFile(path.join(map, nama), Buffer.from(await file.arrayBuffer()));

  return `/uploads/${folder}/${nama}`;
}

export function simpanGambar(file: File, folder: string) {
  return simpan(file, folder, EKSTENSI_GAMBAR);
}

export function simpanDokumen(file: File, folder: string) {
  return simpan(file, folder, EKSTENSI_DOKUMEN);
}
