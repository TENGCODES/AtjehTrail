"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { bisakahUlas } from "@/lib/business";
import { prisma } from "@/lib/db";
import { simpanGambar } from "@/lib/upload";

export async function kirimUlasanAction(formData: FormData) {
  const user = await requireUser("/pesanan");
  const pesananId = String(formData.get("pesananId") ?? "");
  const bintang = Math.min(5, Math.max(1, Number(formData.get("bintang") ?? 5)));
  const bintangPelayanan = Math.min(5, Math.max(1, Number(formData.get("bintangPelayanan") ?? 5)));
  const komentar = String(formData.get("komentar") ?? "").trim();

  const pesanan = await prisma.pesanan.findUnique({
    where: { id: pesananId },
    include: { ulasan: true },
  });

  if (!pesanan || pesanan.penggunaId !== user.id || !bisakahUlas(pesanan)) {
    redirect("/pesanan?error=ulasan");
  }
  if (komentar.length < 10) {
    redirect(`/pesanan/${pesananId}/ulasan?error=komentar`);
  }

  let foto: string | null = null;
  const file = formData.get("foto");
  if (file instanceof File && file.size > 0) {
    try {
      foto = await simpanGambar(file, "ulasan");
    } catch {
      redirect(`/pesanan/${pesananId}/ulasan?error=foto`);
    }
  }

  await prisma.ulasan.create({
    data: {
      pesananId: pesanan.id,
      penggunaId: user.id,
      targetJenis: pesanan.jenisLayanan,
      targetId: pesanan.layananId,
      bintang,
      bintangPelayanan,
      komentar,
      foto,
      tanggal: new Date(),
    },
  });

  await perbaruiAgregat(pesanan.jenisLayanan, pesanan.layananId, bintang);
  revalidatePath("/", "layout");
  redirect("/pesanan?tab=selesai&ulasan=sukses");
}

async function perbaruiAgregat(jenis: string, targetId: string, bintang: number) {
  const label = jenis === "destinasi" ? "destinasi" : jenis;
  if (label === "destinasi") {
    const current = await prisma.destinasi.findUnique({ where: { id: targetId } });
    if (!current) return;
    const jumlah = current.jumlahUlasan + 1;
    const rating = (current.rating * current.jumlahUlasan + bintang) / jumlah;
    await prisma.destinasi.update({
      where: { id: targetId },
      data: { jumlahUlasan: jumlah, rating: Math.round(rating * 10) / 10 },
    });
  } else if (label === "penginapan") {
    const current = await prisma.penginapan.findUnique({ where: { id: targetId } });
    if (!current) return;
    const jumlah = current.jumlahUlasan + 1;
    const rating = (current.rating * current.jumlahUlasan + bintang) / jumlah;
    await prisma.penginapan.update({
      where: { id: targetId },
      data: { jumlahUlasan: jumlah, rating: Math.round(rating * 10) / 10 },
    });
  } else if (label === "pemandu") {
    const current = await prisma.pemandu.findUnique({ where: { id: targetId } });
    if (!current) return;
    const jumlah = current.jumlahUlasan + 1;
    const rating = (current.rating * current.jumlahUlasan + bintang) / jumlah;
    await prisma.pemandu.update({
      where: { id: targetId },
      data: { jumlahUlasan: jumlah, rating: Math.round(rating * 10) / 10 },
    });
  } else if (label === "paket") {
    const current = await prisma.paket.findUnique({ where: { id: targetId } });
    if (!current) return;
    const jumlah = current.jumlahUlasan + 1;
    const rating = (current.rating * current.jumlahUlasan + bintang) / jumlah;
    await prisma.paket.update({
      where: { id: targetId },
      data: { jumlahUlasan: jumlah, rating: Math.round(rating * 10) / 10 },
    });
  }
}
