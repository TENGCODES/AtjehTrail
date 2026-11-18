"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  BIAYA_LAYANAN,
  TARIF_ANTAR_JEMPUT,
  TARIF_PEMANDU_TAMBAHAN,
  buatKodePesanan,
  hitungKomisi,
} from "@/lib/business";
import { prisma } from "@/lib/db";
import { parseJson } from "@/lib/format";

const PROMO: Record<string, number> = { ATJEHTRAIL: 10000 };

function angka(value: FormDataEntryValue | null, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export async function buatPesananAction(formData: FormData) {
  const jenis = String(formData.get("jenis") ?? "");
  const layananId = String(formData.get("layananId") ?? "");
  const user = await requireUser(`/pesan?jenis=${jenis}&id=${layananId}`);

  const tanggal = String(formData.get("tanggal") ?? "");
  const namaPemesan = String(formData.get("namaPemesan") ?? user.nama).trim();
  const teleponPemesan = String(formData.get("teleponPemesan") ?? user.telepon).trim();
  const catatan = String(formData.get("catatan") ?? "").trim();
  const metodePembayaran = String(formData.get("metodePembayaran") ?? "QRIS");
  const jumlahOrang = Math.max(1, angka(formData.get("jumlahOrang"), 1));
  const jumlahMalam = Math.max(0, angka(formData.get("jumlahMalam"), 0));
  const antarJemput = formData.get("antarJemput") === "on";
  const pemanduTambahan = formData.get("pemanduTambahan") === "on";
  const promo = String(formData.get("promo") ?? "").trim().toUpperCase();

  const kembali = `/pesan?jenis=${jenis}&id=${layananId}`;
  if (!tanggal || namaPemesan.length < 3 || teleponPemesan.length < 8) {
    redirect(`${kembali}&error=data`);
  }

  let layananNama = "";
  let subtotal = 0;
  let minimalOrang = 1;
  let tanggalTersedia: string[] = [];

  if (jenis === "destinasi") {
    const data = await prisma.destinasi.findUnique({ where: { id: layananId } });
    if (!data) redirect("/jelajah");
    layananNama = data.nama;
    subtotal = data.hargaTiket * jumlahOrang;
  } else if (jenis === "penginapan") {
    const data = await prisma.penginapan.findUnique({ where: { id: layananId } });
    if (!data) redirect("/jelajah?tab=penginapan");
    if (jumlahMalam < 1) redirect(`${kembali}&error=malam`);
    layananNama = data.nama;
    subtotal = data.hargaPerMalam * jumlahMalam;
  } else if (jenis === "pemandu") {
    const data = await prisma.pemandu.findUnique({ where: { id: layananId } });
    if (!data) redirect("/jelajah?tab=pemandu");
    layananNama = data.nama;
    subtotal = data.tarif;
    tanggalTersedia = parseJson<string[]>(data.ketersediaan, []).filter(Boolean);
  } else if (jenis === "paket") {
    const data = await prisma.paket.findUnique({ where: { id: layananId } });
    if (!data) redirect("/jelajah?tab=paket");
    layananNama = data.judul;
    minimalOrang = data.minimalOrang;
    subtotal = data.hargaPerOrang * jumlahOrang;
  } else {
    redirect("/jelajah");
  }

  if (jumlahOrang < minimalOrang) {
    redirect(`${kembali}&error=minimal`);
  }

  if (jenis === "pemandu" && !tanggalTersedia.includes(tanggal)) {
    redirect(`${kembali}&error=tanggal`);
  }

  if (promo && !PROMO[promo]) {
    redirect(`${kembali}&error=promo`);
  }

  const diskon = promo ? Math.min(PROMO[promo], subtotal) : 0;
  const biayaAntar = antarJemput ? TARIF_ANTAR_JEMPUT : 0;
  const biayaPemandu = pemanduTambahan ? TARIF_PEMANDU_TAMBAHAN : 0;
  const total = Math.max(0, subtotal + biayaAntar + biayaPemandu + BIAYA_LAYANAN - diskon);
  const kode = buatKodePesanan();

  let tanggalSelesai: string | null = null;
  if (jenis === "penginapan" && jumlahMalam > 0) {
    const mulai = new Date(tanggal);
    mulai.setDate(mulai.getDate() + jumlahMalam);
    tanggalSelesai = mulai.toISOString().slice(0, 10);
  }

  await prisma.pesanan.create({
    data: {
      kode,
      penggunaId: user.id,
      jenisLayanan: jenis,
      layananId,
      layananNama,
      tanggal,
      tanggalSelesai,
      jumlahOrang,
      jumlahMalam,
      subtotal,
      biayaLayanan: BIAYA_LAYANAN,
      diskon,
      total,
      status: "Menunggu Pembayaran",
      kodeVoucher: `VCH-${kode.replace("ATJ-", "")}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      metodePembayaran,
      tambahanPemandu: pemanduTambahan,
      antarJemput,
      namaPemesan,
      teleponPemesan,
      catatan: catatan || null,
      komisi: hitungKomisi(jenis, subtotal),
    },
  });

  revalidatePath("/pesanan");
  redirect(`/konfirmasi/${kode}`);
}

export async function bayarPesananAction(formData: FormData) {
  const user = await requireUser("/pesanan");
  const id = String(formData.get("id") ?? "");
  const pesanan = await prisma.pesanan.findUnique({ where: { id } });
  if (!pesanan || pesanan.penggunaId !== user.id) redirect("/pesanan");
  if (pesanan.status !== "Menunggu Pembayaran") redirect("/pesanan");

  await prisma.pesanan.update({
    where: { id },
    data: { status: "Terkonfirmasi", metodePembayaran: pesanan.metodePembayaran ?? "QRIS (simulasi)" },
  });
  revalidatePath("/pesanan");
  redirect(`/konfirmasi/${pesanan.kode}`);
}

export async function konfirmasiSelesaiAction(formData: FormData) {
  const user = await requireUser("/pesanan");
  const id = String(formData.get("id") ?? "");
  const pesanan = await prisma.pesanan.findUnique({ where: { id } });
  if (!pesanan || pesanan.penggunaId !== user.id) redirect("/pesanan");
  if (pesanan.status !== "Terkonfirmasi") redirect("/pesanan");

  await prisma.pesanan.update({
    where: { id },
    data: { status: "Selesai", selesaiAt: new Date() },
  });
  revalidatePath("/pesanan");
  redirect("/pesanan?tab=selesai&selesai=1");
}

export async function batalkanPesananAction(formData: FormData) {
  const user = await requireUser("/pesanan");
  const id = String(formData.get("id") ?? "");
  const pesanan = await prisma.pesanan.findUnique({ where: { id } });
  if (!pesanan || pesanan.penggunaId !== user.id) redirect("/pesanan");

  const hariIni = new Date().toISOString().slice(0, 10);
  const bolehBatal =
    pesanan.status === "Menunggu Pembayaran" ||
    (pesanan.status === "Terkonfirmasi" && pesanan.tanggal >= hariIni);
  if (!bolehBatal) redirect("/pesanan?error=batal");

  await prisma.pesanan.update({ where: { id }, data: { status: "Dibatalkan" } });
  revalidatePath("/pesanan");
  redirect("/pesanan");
}
