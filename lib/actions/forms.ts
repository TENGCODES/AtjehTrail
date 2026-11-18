"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseJson } from "@/lib/format";
import { simpanDokumen, simpanGambar } from "@/lib/upload";

export async function usulkanTempatAction(formData: FormData) {
  const user = await requireUser("/usulkan");

  const nama = String(formData.get("nama") ?? "").trim();
  const kategori = String(formData.get("kategori") ?? "").trim();
  const lokasi = String(formData.get("lokasi") ?? "").trim();
  const deskripsi = String(formData.get("deskripsi") ?? "").trim();
  const akses = String(formData.get("akses") ?? "").trim();
  const biaya = String(formData.get("biaya") ?? "").trim();
  const kontakPengelola = String(formData.get("kontakPengelola") ?? "").trim();
  const fotoFile = formData.get("foto");
  const pernyataanIzin = formData.get("pernyataanIzin") === "on";

  if (nama.length < 3 || kategori.length < 3 || lokasi.length < 3 || deskripsi.length < 20) {
    redirect("/usulkan?error=data");
  }
  if (!pernyataanIzin) {
    redirect("/usulkan?error=izin");
  }

  let foto: string | null = null;
  if (fotoFile instanceof File && fotoFile.size > 0) {
    try {
      foto = await simpanGambar(fotoFile, "usulan");
    } catch {
      redirect("/usulkan?error=foto");
    }
  }

  await prisma.usulanTempat.create({
    data: {
      penggunaId: user.id,
      nama,
      kategori,
      lokasi,
      deskripsi,
      akses,
      biaya,
      kontakPengelola,
      foto,
      pernyataanIzin,
      status: "Menunggu Verifikasi",
    },
  });

  revalidatePath("/usulkan");
  redirect("/usulkan?sukses=1");
}

export async function daftarMitraAction(formData: FormData) {
  const user = await requireUser("/mitra");

  const jenis = String(formData.get("jenis") ?? "").trim();
  const namaUsaha = String(formData.get("namaUsaha") ?? "").trim();
  const kontak = String(formData.get("kontak") ?? "").trim();
  const keterangan = String(formData.get("keterangan") ?? "").trim();
  const setuju = formData.get("setuju") === "on";

  if (!jenis || namaUsaha.length < 3 || kontak.length < 8) {
    redirect("/mitra?error=data");
  }
  if (!setuju) {
    redirect("/mitra?error=setuju");
  }

  const lama = parseJson<string[]>(user.mitra?.dokumen ?? null, []);
  const slot = ["dokumenIdentitas", "dokumenLokasi", "dokumenGampong"];
  const dokumen: string[] = [];
  for (let i = 0; i < slot.length; i++) {
    const file = formData.get(slot[i]);
    if (file instanceof File && file.size > 0) {
      try {
        dokumen.push(await simpanDokumen(file, "mitra"));
      } catch {
        redirect("/mitra?error=dokumen");
      }
    } else if (lama[i]) {
      dokumen.push(lama[i]);
    }
  }

  await prisma.mitra.upsert({
    where: { penggunaId: user.id },
    update: {
      jenis,
      namaUsaha,
      kontak,
      keterangan,
      dokumen: JSON.stringify(dokumen),
      statusVerifikasi: "Menunggu Verifikasi",
    },
    create: {
      penggunaId: user.id,
      jenis,
      namaUsaha,
      kontak,
      keterangan,
      dokumen: JSON.stringify(dokumen),
      statusVerifikasi: "Menunggu Verifikasi",
    },
  });

  revalidatePath("/mitra");
  redirect("/mitra?sukses=1");
}
