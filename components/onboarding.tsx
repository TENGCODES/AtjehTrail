"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icon";

const slides = [
  {
    gambar: "/images/destinasi/masjid-raya.jpg",
    ikon: "explore",
    judul: "Temukan destinasi, dari yang ikonik hingga tersembunyi",
    teks: "Jelajahi Banda Aceh dan Aceh Besar: situs sejarah, pantai, air terjun, hingga permata tersembunyi yang diverifikasi warga gampong.",
  },
  {
    gambar: "/images/paket/jejak-sejarah.jpg",
    ikon: "confirmation_number",
    judul: "Pesan langsung dalam satu alur",
    teks: "Tiket destinasi, pemandu lokal, penginapan, dan paket tour lengkap dengan harga transparan serta e-voucher.",
  },
  {
    gambar: "/images/destinasi/gampong-nusa.jpg",
    ikon: "volunteer_activism",
    judul: "Dukung masyarakat lokal Aceh",
    teks: "Setiap pesanan terhubung dengan pengelola, pemandu, dan homestay warga yang terverifikasi bersama gampong.",
  },
];

export function Onboarding() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const terakhir = index === slides.length - 1;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-primary-container text-white">
      <Image
        src={slide.gambar}
        alt=""
        fill
        priority
        className="object-cover opacity-35"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary-container/80 to-primary" />

      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
            <Icon name="mosque" className="text-[21px]" />
          </span>
          <span className="font-serif text-lg font-bold">AtjehTrail</span>
        </div>
        <Link
          href="/beranda"
          className="rounded-lg px-3 py-2 text-xs font-bold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          Lewati
        </Link>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-end px-5 pb-10 sm:px-8">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container shadow-float">
          <Icon name={slide.ikon} className="text-[26px]" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary-container">
          Wisata terpadu Aceh
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold leading-tight sm:text-4xl">{slide.judul}</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">{slide.teks}</p>

        <div className="mt-8 flex items-center gap-1.5" aria-label={`Slide ${index + 1} dari ${slides.length}`}>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Buka slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-secondary-container" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (terakhir ? router.push("/masuk") : setIndex(index + 1))}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-secondary-container px-5 py-3 text-sm font-bold text-on-secondary-container shadow-card transition-colors hover:bg-[#d68f29]"
          >
            {terakhir ? "Mulai" : "Lanjut"}
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
          {index > 0 && (
            <button
              type="button"
              onClick={() => setIndex(index - 1)}
              aria-label="Slide sebelumnya"
              className="rounded-lg border border-white/25 p-3 text-white/80 transition-colors hover:bg-white/10"
            >
              <Icon name="arrow_back" className="text-[18px]" />
            </button>
          )}
        </div>
        <p className="mt-4 text-center text-[11px] text-white/50">
          Prototipe tugas Digital Entrepreneurship · Universitas Islam Negeri Ar-Raniry
        </p>
      </div>
    </div>
  );
}
