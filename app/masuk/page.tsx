import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/icon";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth";
import { daftarAction, masukAction, masukDemoAction } from "@/lib/actions/auth";

export const metadata = { title: "Masuk & Daftar" };

type Props = {
  searchParams: Promise<{ mode?: string; error?: string; next?: string }>;
};

export default async function MasukPage({ searchParams }: Props) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(params.next && params.next.startsWith("/") ? params.next : "/beranda");

  const mode = params.mode === "daftar" ? "daftar" : "masuk";
  const next = params.next && params.next.startsWith("/") ? params.next : "/beranda";

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="relative hidden w-[44%] overflow-hidden bg-primary-container lg:block">
        <Image
          src="/images/hero/onboarding.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-40"
          sizes="44vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary-container/80 to-primary" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
          <Logo tone="dark" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary-container">
              Selamat datang kembali
            </p>
            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight">
              Satu akun untuk seluruh perjalanan Anda di Aceh.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              Simpan favorit, pesan destinasi, pemandu, penginapan, dan paket tour, lalu kelola
              e-voucher dalam satu tempat.
            </p>
          </div>
          <p className="text-xs text-white/50">Banda Aceh &amp; Aceh Besar · Prototipe 2026</p>
        </div>
      </aside>

      <main className="flex flex-1 flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            href="/beranda"
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-low"
          >
            <Icon name="arrow_back" className="text-[16px]" />
            Beranda
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <div className="grid grid-cols-2 rounded-lg bg-surface-container p-1">
            <Link
              href={`/masuk?next=${encodeURIComponent(next)}`}
              className={`rounded-md px-4 py-2.5 text-center text-sm font-bold transition-colors ${
                mode === "masuk" ? "bg-white text-primary shadow-card" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Masuk
            </Link>
            <Link
              href={`/masuk?mode=daftar&next=${encodeURIComponent(next)}`}
              className={`rounded-md px-4 py-2.5 text-center text-sm font-bold transition-colors ${
                mode === "daftar" ? "bg-white text-primary shadow-card" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Daftar
            </Link>
          </div>

          {params.error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-error-container px-3 py-2.5 text-xs font-semibold text-on-error-container">
              <Icon name="error" className="text-[16px]" />
              {params.error === "email"
                ? "Email atau nomor telepon sudah terdaftar."
                : params.error === "daftar"
                  ? "Lengkapi data dengan benar. Kata sandi minimal 6 karakter."
                  : "Email/nomor telepon atau kata sandi tidak sesuai."}
            </div>
          )}

          {mode === "masuk" ? (
            <>
              <h2 className="mt-6 font-serif text-2xl font-bold text-primary">Masuk ke AtjehTrail</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Gunakan akun Anda untuk melanjutkan pesanan.
              </p>
              <form action={masukAction} className="mt-5 space-y-4">
                <input type="hidden" name="next" value={next} />
                <Field label="Email atau nomor telepon" icon="alternate_email">
                  <input
                    name="identitas"
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="nama@email.com atau 0812..."
                    className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
                  />
                </Field>
                <Field label="Kata sandi" icon="lock">
                  <input
                    name="sandi"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="Masukkan kata sandi"
                    className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
                  />
                </Field>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-secondary-container px-4 py-3 text-sm font-bold text-on-secondary-container shadow-card transition-colors hover:bg-[#d68f29]"
                >
                  Masuk
                </button>
              </form>

              <details className="mt-4 text-xs text-on-surface-variant">
                <summary className="cursor-pointer font-semibold text-primary hover:underline">
                  Lupa kata sandi?
                </summary>
                <p className="mt-2 rounded-lg bg-surface-container-low px-3 py-2 leading-relaxed">
                  Pada prototipe ini, pemulihan kata sandi disimulasikan. Silakan gunakan akun demo
                  di bawah atau daftar akun baru.
                </p>
              </details>

              <div className="mt-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                  Akun demo
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <DemoButton email="wisatawan@atjehtrail.id" label="Wisatawan" icon="person" next={next} />
                  <DemoButton email="mitra@atjehtrail.id" label="Calon mitra" icon="handshake" next={next} />
                </div>
                <p className="mt-2 text-[11px] text-on-surface-variant">
                  Sandi kedua akun: <span className="font-bold text-primary">demo123</span>
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-6 font-serif text-2xl font-bold text-primary">Buat akun baru</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Satu akun untuk memesan dan mengusulkan tempat.
              </p>
              <form action={daftarAction} className="mt-5 space-y-3.5">
                <input type="hidden" name="next" value={next} />
                <Field label="Nama lengkap" icon="badge">
                  <input
                    name="nama"
                    required
                    minLength={3}
                    placeholder="Nama sesuai identitas"
                    className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
                  />
                </Field>
                <Field label="Nomor telepon" icon="call">
                  <input
                    name="telepon"
                    required
                    minLength={8}
                    inputMode="tel"
                    placeholder="0812..."
                    className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
                  />
                </Field>
                <Field label="Email" icon="alternate_email">
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="nama@email.com"
                    className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
                  />
                </Field>
                <Field label="Kata sandi" icon="lock">
                  <input
                    name="sandi"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
                  />
                </Field>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-secondary-container px-4 py-3 text-sm font-bold text-on-secondary-container shadow-card transition-colors hover:bg-[#d68f29]"
                >
                  Daftar &amp; mulai
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1 text-xs font-bold text-on-surface-variant">
        <Icon name={icon} className="text-[15px]" />
        {label}
      </span>
      {children}
    </label>
  );
}

function DemoButton({
  email,
  label,
  icon,
  next,
}: {
  email: string;
  label: string;
  icon: string;
  next: string;
}) {
  return (
    <form action={masukDemoAction}>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="next" value={next} />
      <button
        type="submit"
        className="flex w-full items-center gap-2 rounded-lg border border-outline-variant/50 bg-white px-3 py-2.5 text-left text-xs font-bold text-primary transition-colors hover:border-primary hover:bg-surface-container-low"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-container text-secondary-container">
          <Icon name={icon} className="text-[16px]" />
        </span>
        {label}
      </button>
    </form>
  );
}
