"use client";

import Image from "next/image";
import { useState } from "react";
import { buatPesananAction } from "@/lib/actions/booking";
import {
  BIAYA_LAYANAN,
  TARIF_ANTAR_JEMPUT,
  TARIF_PEMANDU_TAMBAHAN,
} from "@/lib/business";
import { formatRupiah, formatTanggal } from "@/lib/format";
import type { LayananRingkas } from "@/lib/service";
import { Icon } from "./icon";

const PROMO = "ATJEHTRAIL";
const POTONGAN = 10000;

export function BookingForm({
  layanan,
  user,
  error,
}: {
  layanan: LayananRingkas;
  user: { nama: string; telepon: string };
  error?: string;
}) {
  const [jumlahOrang, setJumlahOrang] = useState(layanan.minimalOrang);
  const [jumlahMalam, setJumlahMalam] = useState(1);
  const [antarJemput, setAntarJemput] = useState(false);
  const [pemanduTambahan, setPemanduTambahan] = useState(false);
  const [promo, setPromo] = useState("");
  const [metode, setMetode] = useState("QRIS");

  const subtotal =
    layanan.jenis === "penginapan"
      ? layanan.harga * Math.max(1, jumlahMalam)
      : layanan.jenis === "pemandu"
        ? layanan.harga
        : layanan.harga * Math.max(1, jumlahOrang);
  const biayaAntar = antarJemput ? TARIF_ANTAR_JEMPUT : 0;
  const biayaPemandu = pemanduTambahan ? TARIF_PEMANDU_TAMBAHAN : 0;
  const validPromo = promo.trim().toUpperCase() === PROMO;
  const diskon = validPromo ? Math.min(POTONGAN, subtotal) : 0;
  const total = Math.max(0, subtotal + biayaAntar + biayaPemandu + BIAYA_LAYANAN - diskon);

  return (
    <form action={buatPesananAction} className="space-y-4">
      <input type="hidden" name="jenis" value={layanan.jenis} />
      <input type="hidden" name="layananId" value={layanan.id} />

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-error-container px-3 py-2.5 text-xs font-semibold text-on-error-container">
          <Icon name="error" className="text-[16px]" />
          {error === "data"
            ? "Lengkapi tanggal, nama, dan nomor telepon."
            : error === "malam"
              ? "Jumlah malam minimal 1."
              : error === "minimal"
                ? `Paket ini minimal ${layanan.minimalOrang} orang.`
                : error === "promo"
                  ? "Kode promo tidak dikenal."
                  : error === "tanggal"
                    ? "Tanggal yang dipilih tidak tersedia untuk pemandu ini."
                    : "Periksa kembali data pesanan Anda."}
        </div>
      )}

      <section className="rounded-xl border border-outline-variant/40 bg-white p-4 shadow-card">
        <h2 className="font-serif text-lg font-semibold text-primary">Ringkasan layanan</h2>
        <div className="mt-3 flex gap-3">
          <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-container-high">
            <Image src={layanan.foto} alt={layanan.nama} fill sizes="100px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">{layanan.jenis}</p>
            <p className="mt-0.5 font-serif text-base font-semibold leading-snug text-primary">{layanan.nama}</p>
            <p className="mt-1 text-xs text-on-surface-variant">
              {layanan.jenis === "penginapan"
                ? `${formatRupiah(layanan.harga)}/malam`
                : layanan.jenis === "pemandu"
                  ? `${formatRupiah(layanan.harga)}/sesi`
                  : `${formatRupiah(layanan.harga)}/orang`}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 flex items-center gap-1 text-[11px] font-bold text-on-surface-variant">
              <Icon name="calendar_month" className="text-[14px]" />
              {layanan.jenis === "penginapan" ? "Tanggal masuk" : "Tanggal kunjungan"}
            </span>
            {layanan.tanggalTersedia?.length ? (
              <select
                name="tanggal"
                required
                defaultValue={layanan.tanggalDefault}
                className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
              >
                {layanan.tanggalTersedia.map((tanggal) => (
                  <option key={tanggal} value={tanggal}>
                    {formatTanggal(tanggal)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="date"
                name="tanggal"
                required
                defaultValue={layanan.tanggalDefault}
                className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
              />
            )}
          </label>

          {layanan.jenis === "penginapan" ? (
            <label className="block">
              <span className="mb-1 flex items-center gap-1 text-[11px] font-bold text-on-surface-variant">
                <Icon name="nights_stay" className="text-[14px]" />
                Jumlah malam
              </span>
              <input
                type="number"
                name="jumlahMalam"
                min={1}
                max={30}
                value={jumlahMalam}
                onChange={(event) => setJumlahMalam(Number(event.target.value))}
                className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
              />
            </label>
          ) : (
            <label className="block">
              <span className="mb-1 flex items-center gap-1 text-[11px] font-bold text-on-surface-variant">
                <Icon name="group" className="text-[14px]" />
                Jumlah orang
                {layanan.jenis === "paket" && ` (min. ${layanan.minimalOrang})`}
              </span>
              <input
                type="number"
                name="jumlahOrang"
                min={layanan.minimalOrang}
                max={40}
                value={jumlahOrang}
                onChange={(event) => setJumlahOrang(Number(event.target.value))}
                className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
              />
            </label>
          )}
        </div>

        {layanan.jenis === "penginapan" && (
          <label className="mt-3 block">
            <span className="mb-1 flex items-center gap-1 text-[11px] font-bold text-on-surface-variant">
              <Icon name="group" className="text-[14px]" />
              Jumlah tamu
            </span>
            <input
              type="number"
              name="jumlahOrang"
              min={1}
              max={20}
              defaultValue={2}
              className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
            />
          </label>
        )}
      </section>

      <section className="rounded-xl border border-outline-variant/40 bg-white p-4 shadow-card">
        <h2 className="font-serif text-lg font-semibold text-primary">Data pemesan</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-on-surface-variant">Nama lengkap</span>
            <input
              name="namaPemesan"
              required
              minLength={3}
              defaultValue={user.nama}
              className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-on-surface-variant">Nomor telepon</span>
            <input
              name="teleponPemesan"
              required
              minLength={8}
              defaultValue={user.telepon}
              className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
            />
          </label>
        </div>
        <label className="mt-3 block">
          <span className="mb-1 block text-[11px] font-bold text-on-surface-variant">Catatan (opsional)</span>
          <textarea
            name="catatan"
            rows={2}
            placeholder="Kebutuhan khusus, jumlah anak, atau permintaan lain."
            className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
          />
        </label>
      </section>

      <section className="rounded-xl border border-outline-variant/40 bg-white p-4 shadow-card">
        <h2 className="font-serif text-lg font-semibold text-primary">Layanan tambahan</h2>
        <div className="mt-2 space-y-2">
          {layanan.antarJemputTersedia && (
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-outline-variant/40 px-3 py-2.5">
              <span className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                <Icon name="airport_shuttle" className="text-[18px] text-secondary" />
                Antar-jemput
                <span className="font-normal text-on-surface-variant">+{formatRupiah(TARIF_ANTAR_JEMPUT)}</span>
              </span>
              <input
                type="checkbox"
                name="antarJemput"
                checked={antarJemput}
                onChange={(event) => setAntarJemput(event.target.checked)}
                className="h-4 w-4 accent-primary-container"
              />
            </label>
          )}
          {layanan.pemanduTersedia && (
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-outline-variant/40 px-3 py-2.5">
              <span className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                <Icon name="badge" className="text-[18px] text-secondary" />
                Pemandu tambahan
                <span className="font-normal text-on-surface-variant">+{formatRupiah(TARIF_PEMANDU_TAMBAHAN)}</span>
              </span>
              <input
                type="checkbox"
                name="pemanduTambahan"
                checked={pemanduTambahan}
                onChange={(event) => setPemanduTambahan(event.target.checked)}
                className="h-4 w-4 accent-primary-container"
              />
            </label>
          )}
          {!layanan.antarJemputTersedia && !layanan.pemanduTersedia && (
            <p className="rounded-lg bg-surface-container-low px-3 py-2.5 text-xs text-on-surface-variant">
              {layanan.catatan ?? "Layanan tambahan tidak tersedia untuk item ini."}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant/40 bg-white p-4 shadow-card">
        <h2 className="font-serif text-lg font-semibold text-primary">Kode promo</h2>
        <div className="mt-2 flex gap-2">
          <input
            name="promo"
            value={promo}
            onChange={(event) => setPromo(event.target.value)}
            placeholder="Contoh: ATJEHTRAIL"
            className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2 text-sm uppercase outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
          />
        </div>
        <p className="mt-1.5 text-[11px] text-on-surface-variant">
          {validPromo
            ? `Promo berlaku: potongan ${formatRupiah(POTONGAN)}.`
            : "Voucher perdana ATJEHTRAIL memberi potongan Rp10.000."}
        </p>
      </section>

      <section className="rounded-xl border border-outline-variant/40 bg-white p-4 shadow-card">
        <h2 className="font-serif text-lg font-semibold text-primary">Metode pembayaran (simulasi)</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {[
            { id: "Transfer bank", icon: "account_balance" },
            { id: "Dompet digital", icon: "wallet" },
            { id: "QRIS", icon: "qr_code_2" },
          ].map((item) => (
            <label
              key={item.id}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors ${
                metode === item.id ? "border-primary bg-surface-container-low text-primary" : "border-outline-variant/50 text-on-surface-variant"
              }`}
            >
              <input
                type="radio"
                name="metodePembayaran"
                value={item.id}
                checked={metode === item.id}
                onChange={() => setMetode(item.id)}
                className="h-4 w-4 accent-primary-container"
              />
              <Icon name={item.icon} className="text-[18px]" />
              {item.id}
            </label>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-on-surface-variant">
          Tidak ada transaksi nyata. Prototipe tidak terhubung ke payment gateway.
        </p>
      </section>

      <section className="rounded-xl border border-outline-variant/40 bg-white p-4 shadow-card">
        <h2 className="font-serif text-lg font-semibold text-primary">Rincian harga</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label="Harga layanan" value={formatRupiah(subtotal)} />
          {biayaAntar > 0 && <Row label="Antar-jemput" value={formatRupiah(biayaAntar)} />}
          {biayaPemandu > 0 && <Row label="Pemandu tambahan" value={formatRupiah(biayaPemandu)} />}
          <Row label="Biaya layanan" value={formatRupiah(BIAYA_LAYANAN)} />
          {diskon > 0 && <Row label="Potongan promo" value={`-${formatRupiah(diskon)}`} accent />}
          <div className="flex items-center justify-between border-t border-surface-container pt-2.5">
            <dt className="font-serif text-base font-semibold text-primary">Total</dt>
            <dd className="text-lg font-bold text-primary">{formatRupiah(total)}</dd>
          </div>
        </dl>
        <button
          type="submit"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-container px-4 py-3 text-sm font-bold text-on-secondary-container shadow-card transition-colors hover:bg-[#d68f29]"
        >
          Lanjut ke pembayaran
          <Icon name="lock" className="text-[16px]" />
        </button>
        <p className="mt-2 text-center text-[10px] text-on-surface-variant">
          Dengan menekan tombol, Anda menyetujui simulasi pemesanan prototipe.
        </p>
      </section>
    </form>
  );
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-on-surface-variant">{label}</dt>
      <dd className={accent ? "font-semibold text-verified" : "font-semibold text-on-surface"}>{value}</dd>
    </div>
  );
}
