"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { jarakKm } from "@/lib/geo";
import { Icon } from "./icon";

type DestinasiDekat = {
  id: string;
  slug: string;
  nama: string;
  kategori: string;
  wilayah: string;
  jarakPusat: number;
  koordinatLat: number;
  koordinatLng: number;
};

type Koordinat = { lat: number; lng: number };

function mintaLokasi(onSukses: (lokasi: Koordinat) => void, onGagal: () => void) {
  if (!("geolocation" in navigator)) {
    onGagal();
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (posisi) => onSukses({ lat: posisi.coords.latitude, lng: posisi.coords.longitude }),
    onGagal,
    { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 },
  );
}

export function NearbyDestinations({ destinations }: { destinations: DestinasiDekat[] }) {
  const [lokasi, setLokasi] = useState<Koordinat | null>(null);
  const [status, setStatus] = useState<"memuat" | "aktif" | "gagal">("memuat");

  const cariLokasi = useCallback(() => {
    mintaLokasi(
      (posisi) => {
        setLokasi(posisi);
        setStatus("aktif");
      },
      () => {
        setLokasi(null);
        setStatus("gagal");
      },
    );
  }, []);

  useEffect(() => {
    cariLokasi();
  }, [cariLokasi]);

  function coba() {
    setStatus("memuat");
    cariLokasi();
  }

  const daftar = destinations
    .map((destinasi) => ({
      ...destinasi,
      jarak: lokasi
        ? jarakKm(lokasi, {
            lat: destinasi.koordinatLat,
            lng: destinasi.koordinatLng,
          })
        : destinasi.jarakPusat,
    }))
    .sort((a, b) => a.jarak - b.jarak)
    .slice(0, 3);

  return (
    <div className="mt-3">
      <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-on-surface-variant">
        <Icon
          name={status === "aktif" ? "my_location" : "near_me"}
          className="text-[14px] text-secondary"
        />
        {status === "memuat"
          ? "Mendeteksi lokasi Anda..."
          : status === "aktif"
            ? "Diurutkan dari lokasi Anda."
            : "Lokasi tidak aktif—menampilkan jarak dari pusat kota."}
        {status === "gagal" && (
          <button
            type="button"
            onClick={coba}
            className="font-bold text-secondary hover:underline"
          >
            Coba lagi
          </button>
        )}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {daftar.map((destinasi, index) => (
          <Link
            key={destinasi.id}
            href={`/destinasi/${destinasi.slug}`}
            className="group flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-white p-3 shadow-card transition-all hover:shadow-card-hover"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container font-serif text-sm font-bold text-secondary-container">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-serif text-sm font-semibold text-primary group-hover:text-secondary">
                {destinasi.nama}
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-[11px] text-on-surface-variant">
                <Icon name="near_me" className="text-[13px]" />
                {destinasi.jarak.toLocaleString("id-ID", { maximumFractionDigits: 1 })} km{" "}
                {status === "aktif" ? "dari lokasi Anda" : "dari pusat kota"}
              </span>
            </span>
            <Icon name="chevron_right" className="text-[18px] text-outline" />
          </Link>
        ))}
      </div>
    </div>
  );
}
