import Link from "next/link";
import { Icon } from "@/components/icon";
import { StatusPesanan } from "@/components/badges";
import { requireUser } from "@/lib/auth";
import { formatTanggal, parseJson } from "@/lib/format";
import { daftarMitraAction } from "@/lib/actions/forms";

export const metadata = { title: "Daftar Mitra" };

type Props = { searchParams: Promise<{ sukses?: string; error?: string }> };

export default async function MitraPage({ searchParams }: Props) {
  const p = await searchParams;
  const user = await requireUser("/mitra");
  const mitra = user.mitra;
  const dokumen = parseJson<string[]>(mitra?.dokumen ?? null, []);

  return (
    <div className="container-page max-w-3xl py-6 sm:py-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">Kolaborasi ekosistem</p>
      <h1 className="mt-1 font-serif text-2xl font-bold text-primary sm:text-3xl">Daftar menjadi mitra</h1>
      <p className="mt-1.5 text-sm text-on-surface-variant">
        Pengelola destinasi, penginapan, pemandu, dan penyelenggara paket dapat mengajukan kemitraan.
        Pengajuan diverifikasi melalui gampong atau kelompok sadar wisata.
      </p>

      {p.sukses === "1" && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-verified/30 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-800">
          <Icon name="check_circle" className="text-[16px]" />
          Pengajuan terkirim. Status: Menunggu Verifikasi.
        </div>
      )}
      {p.error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-error-container px-3 py-2.5 text-xs font-semibold text-on-error-container">
          <Icon name="error" className="text-[16px]" />
          {p.error === "setuju"
            ? "Persetujuan kode etik wajib dicentang."
            : p.error === "dokumen"
              ? "Dokumen harus berupa JPG, PNG, WebP, AVIF, atau PDF maksimal 4 MB."
              : "Lengkapi jenis mitra, nama usaha, dan kontak."}
        </div>
      )}

      {mitra && (
        <section className="mt-4 rounded-xl border border-outline-variant/40 bg-white p-4 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">Status pengajuan</p>
              <h2 className="mt-0.5 font-serif text-lg font-semibold text-primary">{mitra.namaUsaha}</h2>
              <p className="mt-0.5 text-[11px] text-on-surface-variant">
                {mitra.jenis} · diajukan {formatTanggal(mitra.createdAt)}
              </p>
            </div>
            <StatusPesanan status={mitra.statusVerifikasi} />
          </div>
          {dokumen.length > 0 && (
            <div className="mt-2 flex flex-wrap items-start gap-1.5 text-[11px] text-on-surface-variant">
              <Icon name="attach_file" className="mt-0.5 text-[14px]" />
              <span>Dokumen:</span>
              <ul className="flex flex-wrap gap-x-3 gap-y-1">
                {dokumen.map((berkas, index) => {
                  const nama = berkas.split("/").pop() ?? berkas;
                  return (
                    <li key={`${berkas}-${index}`}>
                      {berkas.startsWith("/uploads/") ? (
                        <a
                          href={berkas}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-primary hover:underline"
                        >
                          {nama}
                        </a>
                      ) : (
                        nama
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <p className="mt-2 rounded-lg bg-surface-container-low px-3 py-2 text-[11px] leading-relaxed text-on-surface-variant">
            {mitra.statusVerifikasi === "Terverifikasi"
              ? "Selamat, pengajuan Anda telah terverifikasi. Dasbor mitra tidak dirancang pada prototipe ini."
              : mitra.statusVerifikasi === "Perlu Perbaikan"
                ? "Pengajuan perlu perbaikan. Silakan perbarui data dan unggah dokumen yang diminta."
                : "Pengajuan sedang ditinjau admin dan dikonfirmasi ke gampong. Anda dapat memperbarui data di bawah."}
          </p>
        </section>
      )}

      <form action={daftarMitraAction} className="mt-5 space-y-4">
        <section className="rounded-xl border border-outline-variant/40 bg-white p-4 shadow-card">
          <h2 className="font-serif text-lg font-semibold text-primary">Jenis mitra</h2>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {["Pengelola destinasi", "Penginapan", "Pemandu", "Penyelenggara paket"].map((jenis) => (
              <label
                key={jenis}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/50 px-3 py-2.5 text-xs font-semibold text-on-surface-variant has-[:checked]:border-primary has-[:checked]:bg-surface-container-low has-[:checked]:text-primary"
              >
                <input
                  type="radio"
                  name="jenis"
                  value={jenis}
                  required
                  defaultChecked={mitra?.jenis === jenis || (!mitra && jenis === "Pengelola destinasi")}
                  className="h-4 w-4 accent-primary-container"
                />
                {jenis}
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold text-on-surface-variant">Nama usaha / komunitas</span>
              <input
                name="namaUsaha"
                required
                minLength={3}
                defaultValue={mitra?.namaUsaha}
                placeholder="Contoh: Homestay Gampong Nusa"
                className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold text-on-surface-variant">Kontak</span>
              <input
                name="kontak"
                required
                minLength={8}
                defaultValue={mitra?.kontak ?? user.telepon}
                placeholder="Nomor telepon atau email"
                className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
              />
            </label>
          </div>

          <label className="mt-3 block">
            <span className="mb-1 block text-[11px] font-bold text-on-surface-variant">Keterangan layanan</span>
            <textarea
              name="keterangan"
              rows={3}
              defaultValue={mitra?.keterangan ?? ""}
              placeholder="Jelaskan layanan, lokasi, kapasitas, atau keahlian Anda."
              className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
            />
          </label>
        </section>

        <section className="rounded-xl border border-outline-variant/40 bg-white p-4 shadow-card">
          <h2 className="font-serif text-lg font-semibold text-primary">Unggah dokumen</h2>
          <p className="mt-1 text-[11px] text-on-surface-variant">
            File diunggah ke folder lokal prototipe (maks. 4 MB per file; JPG, PNG, WebP, AVIF, atau PDF).
          </p>
          <div className="mt-3 space-y-2">
            <FileField name="dokumenIdentitas" label="Identitas (KTP / SIM)" />
            <FileField name="dokumenLokasi" label="Foto lokasi usaha" />
            <FileField name="dokumenGampong" label="Surat konfirmasi gampong / izin lahan" />
          </div>
        </section>

        <label className="flex cursor-pointer items-start gap-2 rounded-xl bg-cream p-4 text-[11px] leading-relaxed text-on-surface-variant">
          <input type="checkbox" name="setuju" className="mt-0.5 h-4 w-4 accent-primary-container" />
          Saya menyetujui kode etik mitra AtjehTrail: menjaga kejujuran informasi, menghormati adat dan
          syariat setempat, serta mengutamakan keselamatan dan kenyamanan wisatawan.
        </label>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-container px-5 py-3 text-sm font-bold text-on-secondary-container shadow-card transition-colors hover:bg-[#d68f29]"
        >
          <Icon name="send" className="text-[16px]" />
          {mitra ? "Perbarui pengajuan" : "Kirim pengajuan"}
        </button>
      </form>

      <div className="mt-6 rounded-xl bg-primary-container p-4 text-[11px] leading-relaxed text-white/75">
        <p className="inline-flex items-center gap-1.5 font-bold text-secondary-container">
          <Icon name="verified" className="text-[16px]" />
          Verifikasi tiga lapis
        </p>
        <ol className="mt-2 list-inside list-decimal space-y-1">
          <li>Pemeriksaan berkas identitas, foto lokasi, dan surat gampong.</li>
          <li>Tinjauan admin dan komunikasi dengan mitra serta lembaga lokal.</li>
          <li>Pemberian status Menunggu Verifikasi atau Terverifikasi.</li>
        </ol>
        <p className="mt-2 text-white/60">
          Dasbor mitra tidak dirancang pada prototipe ini, sesuai laporan.
        </p>
        <Link href="/profil" className="mt-2 inline-flex items-center gap-1 font-bold text-secondary-container hover:underline">
          Kembali ke profil
          <Icon name="arrow_forward" className="text-[14px]" />
        </Link>
      </div>
    </div>
  );
}

function FileField({ name, label }: { name: string; label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold text-on-surface-variant">{label}</span>
      <input
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp,image/avif,application/pdf"
        className="block w-full cursor-pointer rounded-lg border border-dashed border-outline-variant/60 bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant file:mr-3 file:rounded file:border-0 file:bg-primary-container file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
      />
    </label>
  );
}
