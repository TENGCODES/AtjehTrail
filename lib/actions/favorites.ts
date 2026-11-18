"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function toggleFavoritAction(formData: FormData) {
  const next = String(formData.get("next") ?? "/beranda");
  const user = await requireUser(next);
  const jenis = String(formData.get("jenis") ?? "destinasi");
  const targetId = String(formData.get("targetId") ?? "");

  const existing = await prisma.favorit.findUnique({
    where: { penggunaId_jenis_targetId: { penggunaId: user.id, jenis, targetId } },
  });

  if (existing) {
    await prisma.favorit.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorit.create({
      data: { penggunaId: user.id, jenis, targetId },
    });
  }

  revalidatePath(next);
  revalidatePath("/profil");
  redirect(next);
}

export async function hapusFavoritAction(formData: FormData) {
  const user = await requireUser("/profil");
  const id = String(formData.get("id") ?? "");
  const favorit = await prisma.favorit.findUnique({ where: { id } });
  if (favorit && favorit.penggunaId === user.id) {
    await prisma.favorit.delete({ where: { id } });
  }
  revalidatePath("/profil");
  redirect("/profil#favorit");
}
