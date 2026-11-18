"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { simpanGambar } from "@/lib/upload";

export async function perbaruiFotoProfilAction(formData: FormData) {
  const user = await requireUser("/profil");
  const file = formData.get("foto");

  if (!(file instanceof File) || file.size === 0) {
    redirect("/profil?error=foto");
  }

  let foto = "";
  try {
    foto = await simpanGambar(file, "profil");
  } catch {
    redirect("/profil?error=foto");
  }

  await prisma.pengguna.update({
    where: { id: user.id },
    data: { foto },
  });

  revalidatePath("/profil");
  redirect("/profil?foto=ok");
}
