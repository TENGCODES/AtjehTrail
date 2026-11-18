"use server";

import { redirect } from "next/navigation";
import { clearSession, hashPassword, setSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

function safeNext(value: FormDataEntryValue | null) {
  const next = String(value ?? "");
  return next.startsWith("/") ? next : "/beranda";
}

export async function masukAction(formData: FormData) {
  const identitas = String(formData.get("identitas") ?? "").trim();
  const sandi = String(formData.get("sandi") ?? "");
  const next = safeNext(formData.get("next"));

  const user = await prisma.pengguna.findFirst({
    where: {
      OR: [{ email: identitas.toLowerCase() }, { telepon: identitas }],
    },
  });

  if (!user || !verifyPassword(sandi, user.passwordHash)) {
    redirect(`/masuk?error=1&next=${encodeURIComponent(next)}`);
  }

  await setSession(user.id);
  redirect(next);
}

export async function masukDemoAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const next = safeNext(formData.get("next"));
  const user = await prisma.pengguna.findUnique({ where: { email } });
  if (!user) redirect("/masuk?error=1");
  await setSession(user.id);
  redirect(next);
}

export async function daftarAction(formData: FormData) {
  const nama = String(formData.get("nama") ?? "").trim();
  const telepon = String(formData.get("telepon") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const sandi = String(formData.get("sandi") ?? "");
  const next = safeNext(formData.get("next"));

  if (nama.length < 3 || telepon.length < 8 || !email.includes("@") || sandi.length < 6) {
    redirect(`/masuk?mode=daftar&error=daftar&next=${encodeURIComponent(next)}`);
  }

  const existing = await prisma.pengguna.findFirst({
    where: { OR: [{ email }, { telepon }] },
  });
  if (existing) {
    redirect(`/masuk?mode=daftar&error=email&next=${encodeURIComponent(next)}`);
  }

  const user = await prisma.pengguna.create({
    data: {
      nama,
      telepon,
      email,
      passwordHash: hashPassword(sandi),
      peran: "wisatawan",
    },
  });

  await setSession(user.id);
  redirect(next);
}

export async function keluarAction() {
  await clearSession();
  redirect("/beranda");
}
