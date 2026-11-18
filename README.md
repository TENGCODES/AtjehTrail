# AtjehTrail

Prototipe platform wisata terpadu **Banda Aceh & Aceh Besar**: destinasi, penginapan, pemandu lokal, dan paket tour dalam satu aplikasi. Dibuat untuk tugas mata kuliah Digital Entrepreneurship.

Stack: **Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Prisma + SQLite**. Pembayaran hanya simulasi, tanpa layanan berbayar.

## Menjalankan

Prasyarat: Node.js 20+ dan npm.

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Buka http://localhost:3000.

Reset cepat ke data seed:

```bash
npm run db:reset
```

Perintah lain:

```bash
npm run build   # build produksi
npm run lint    # ESLint
npm run db:seed # seed ulang tanpa hapus migrasi
npm start       # jalankan hasil build
```

## Akun demo

| Peran | Email | Sandi |
| --- | --- | --- |
| Wisatawan | `wisatawan@atjehtrail.id` | `demo123` |
| Calon mitra | `mitra@atjehtrail.id` | `demo123` |

Tombol masuk sekali klik tersedia di halaman **Masuk** (tab Wisatawan / Calon mitra).

## Alur demo lengkap

1. Beranda → pilih destinasi (contoh **Masjid Raya Baiturrahman**).
2. Detail destinasi → **Pesan sekarang**.
3. Halaman Pesan → isi tanggal/jumlah orang, kode promo `ATJEHTRAIL` (potongan Rp10.000), pilih metode pembayaran simulasi → **Bayar & buat e-voucher**.
4. Konfirmasi menampilkan kode pesanan + **e-voucher QR** (bisa disimpan lewat tombol cetak).
5. **Pesanan** → **Konfirmasi selesai** → **Beri ulasan** (bintang, komentar, foto opsional).
6. Ulasan hanya bisa dikirim satu kali, maksimal 14 hari setelah pesanan selesai.

Alur lain: cari (A4), filter/tampilan peta (A5), detail pemandu/penginapan/paket (A7–A9), usulkan tempat (A15), daftar mitra (A16).

## Layar (Lampiran A)

| Kode | Layar | Rute |
| --- | --- | --- |
| A1 | Pengantar (3 slide) | `/` |
| A2 | Masuk & Daftar | `/masuk` (`?mode=daftar`) |
| A3 | Beranda | `/beranda` |
| A4 | Pencarian | `/cari` |
| A5 | Jelajah (tab + filter + urutan + peta) | `/jelajah` |
| A6 | Detail Destinasi | `/destinasi/[slug]` |
| A7 | Detail Pemandu | `/pemandu/[id]` |
| A8 | Detail Penginapan | `/penginapan/[id]` |
| A9 | Detail Paket | `/paket/[slug]` |
| A10 | Halaman Pesan | `/pesan?jenis=&id=` |
| A11 | Konfirmasi & E-voucher | `/konfirmasi/[kode]` |
| A12 | Pesanan (Berlangsung/Selesai) | `/pesanan` |
| A13 | Beri Ulasan | `/pesanan/[id]/ulasan` |
| A14 | Profil | `/profil` |
| A15 | Usulkan Tempat | `/usulkan` |
| A16 | Daftar Mitra | `/mitra` |

Dasbor mitra tidak dibuat, sesuai laporan.

## Aturan bisnis

- Biaya layanan **Rp5.000 per pesanan**.
- Komisi (hanya tersimpan di data, tidak ditampilkan ke wisatawan): tiket 8%, pemandu 15%, penginapan 10%, paket 12%.
- Status pesanan: Menunggu Pembayaran → Terkonfirmasi → Selesai / Dibatalkan.
- Pembayaran **simulasi** (transfer bank, dompet digital, QRIS); tidak ada payment gateway.
- Ulasan hanya untuk pesanan **Selesai**, satu per pesanan, maksimal **14 hari**, dan hanya oleh pemilik pesanan.
- Transportasi bukan layanan terpisah; hanya opsi **antar-jemput** pada pesanan/paket.
- Lencana yang dipakai: **Terverifikasi** dan **Permata Tersembunyi** (verifikasi melalui gampong/kelompok sadar wisata).

## Data seed

- 12 destinasi dari Tabel 2.2 (4 ditandai Permata Tersembunyi: Gampong Nusa, Air Terjun Seuhom, Air Terjun Kuta Malaka, Pantai Lhok Seudu).
- 3 paket dari Tabel 4.1: Rp275.000, Rp350.000, Rp300.000 per orang, minimal 4 orang.
- 5 penginapan, 5 pemandu, 12 pesanan contoh, ulasan, usulan, favorit, promo/banner.
- Jam buka, harga tiket, koordinat, dan konten lain adalah **data contoh** untuk prototipe.
- Gambar disimpan lokal di `public/images`. Seluruh 12 destinasi memakai foto asli: Wikimedia Commons (CC0/CC BY/CC BY-SA) dan artikel publik untuk enam destinasi kecil. Penginapan, pemandu, dan paket Healing Alam memakai ilustrasi Unsplash. Rincian di `public/images/ATTRIBUTION.md`.

## Struktur

```
app/
  page.tsx                     A1
  masuk/                       A2
  konfirmasi/[kode]/           A11
  (main)/                      layout dengan navbar + bottom nav
    beranda/ cari/ jelajah/
    destinasi/[slug]/ pemandu/[id]/ penginapan/[id]/ paket/[slug]/
    pesan/ pesanan/ pesanan/[id]/ulasan/ profil/ usulkan/ mitra/
components/                    kartu, badge, form, navigasi, peta, QR
lib/                           Prisma, auth cookie, aturan bisnis, server actions
prisma/schema.prisma           entitas Lampiran B
prisma/seed.ts                 data contoh
reference/                     laporan PDF + ekspor desain Stitch
```

## Kredit foto

- Foto asli (12 destinasi + hero + 2 paket): Wikimedia Commons (CC0 / CC BY 4.0 / CC BY-SA 3.0 / CC BY-SA 4.0) dan artikel publik untuk enam destinasi kecil. Foto artikel publik hanya untuk prototipe akademik non-komersial; ganti bila proyek dikomersialkan.
- Ilustrasi: Unsplash (bukan foto lokasi sebenarnya) untuk penginapan, pemandu, dan paket Healing Alam.
- Daftar lengkap pemotret, lisensi, dan tautan sumber: `public/images/ATTRIBUTION.md` (juga ditautkan di footer).

## Catatan prototipe

- Autentikasi memakai cookie sesi sederhana + scrypt (bukan NextAuth).
- Pesanan baru berstatus **Menunggu Pembayaran**; pembayaran disimulasikan di halaman konfirmasi, lalu e-voucher/QR muncul. Pembatalan tersedia untuk pesanan pending dan pesanan terkonfirmasi sebelum tanggal kunjungan.
- Tanggal pemandu wajib dipilih dari kalender ketersediaan; validasi dilakukan lagi di server.
- "Dekat Saya" meminta izin lokasi browser dan memakai jarak haversine; jika ditolak, jarak dihitung dari pusat Banda Aceh.
- Foto profil, foto ulasan, foto usulan, dan dokumen mitra diunggah ke `public/uploads` (lokal, maksimal 4 MB per file; gambar/PDF untuk dokumen).
- Peta memakai embed OpenStreetMap; tampilan peta Jelajah berupa peta skematik.
- Halaman detail memakai peta OSM dan tombol arah ke Google Maps.
- Riwayat pencarian disimpan di `localStorage` browser (maksimal 5 pencarian).
- Konten dan angka dapat disesuaikan di `prisma/seed.ts` lalu jalankan `npm run db:reset`.
