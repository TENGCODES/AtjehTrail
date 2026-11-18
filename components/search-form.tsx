"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "./icon";

const KEY = "atjehtrail_riwayat_pencarian";
const MAKS = 5;

export function SearchForm({
  defaultValue = "",
  populer,
}: {
  defaultValue?: string;
  populer: string[];
}) {
  const [riwayat, setRiwayat] = useState<string[]>([]);

  useEffect(() => {
    let data: unknown = [];
    try {
      data = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
      // localStorage bisa diblokir; riwayat cukup dilewati.
    }

    const timer = setTimeout(() => {
      if (Array.isArray(data)) {
        setRiwayat(
          data
            .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
            .slice(0, MAKS),
        );
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  function simpan(q: string) {
    const bersih = q.trim();
    if (bersih.length < 2) return;
    const baru = [
      bersih,
      ...riwayat.filter((item) => item.toLowerCase() !== bersih.toLowerCase()),
    ].slice(0, MAKS);
    setRiwayat(baru);
    try {
      localStorage.setItem(KEY, JSON.stringify(baru));
    } catch {
      // Abaikan bila penyimpanan browser tidak tersedia.
    }
  }

  function hapus() {
    setRiwayat([]);
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Abaikan.
    }
  }

  return (
    <>
      <form
        action="/cari"
        onSubmit={(event) => {
          const data = new FormData(event.currentTarget);
          simpan(String(data.get("q") ?? ""));
        }}
        className="mt-4 flex flex-col gap-2 rounded-lg bg-white p-2 sm:flex-row"
      >
        <label className="flex flex-1 items-center gap-2 rounded px-2 py-1.5">
          <Icon name="search" className="text-[20px] text-on-surface-variant" />
          <input
            name="q"
            defaultValue={defaultValue}
            autoFocus
            placeholder="Destinasi, pemandu, penginapan, atau paket..."
            className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-outline"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-secondary-container px-5 py-2.5 text-sm font-bold text-on-secondary-container transition-colors hover:bg-[#d68f29]"
        >
          Cari
        </button>
      </form>

      {riwayat.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-white/60">
          <span className="font-semibold">Riwayat:</span>
          {riwayat.map((item) => (
            <Link
              key={item}
              href={`/cari?q=${encodeURIComponent(item)}`}
              className="rounded-full bg-white/10 px-2.5 py-1 font-semibold text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              {item}
            </Link>
          ))}
          <button
            type="button"
            onClick={hapus}
            className="ml-1 inline-flex items-center gap-0.5 font-semibold text-white/45 underline-offset-2 hover:text-white/80 hover:underline"
          >
            <Icon name="delete" className="text-[12px]" />
            Hapus
          </button>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-white/60">
        <span className="font-semibold">Pencarian populer:</span>
        {populer.map((item) => (
          <Link
            key={item}
            href={`/cari?q=${encodeURIComponent(item)}`}
            className="rounded-full bg-white/10 px-2.5 py-1 font-semibold text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            {item}
          </Link>
        ))}
      </div>
    </>
  );
}
