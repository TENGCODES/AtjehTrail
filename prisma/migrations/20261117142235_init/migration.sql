-- CreateTable
CREATE TABLE "Pengguna" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "telepon" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "peran" TEXT NOT NULL DEFAULT 'wisatawan',
    "foto" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Mitra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "penggunaId" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "namaUsaha" TEXT NOT NULL,
    "kontak" TEXT NOT NULL,
    "statusVerifikasi" TEXT NOT NULL DEFAULT 'Menunggu Verifikasi',
    "dokumen" TEXT,
    "keterangan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Mitra_penggunaId_fkey" FOREIGN KEY ("penggunaId") REFERENCES "Pengguna" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Destinasi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "wilayah" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "koordinatLat" REAL NOT NULL,
    "koordinatLng" REAL NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "sejarah" TEXT NOT NULL,
    "jamBuka" TEXT NOT NULL,
    "hargaTiket" INTEGER NOT NULL DEFAULT 0,
    "tingkatKesulitan" TEXT NOT NULL DEFAULT 'Mudah',
    "fasilitas" TEXT NOT NULL,
    "etika" TEXT NOT NULL,
    "akses" TEXT NOT NULL,
    "statusVerifikasi" TEXT NOT NULL DEFAULT 'Terverifikasi',
    "permataTersembunyi" BOOLEAN NOT NULL DEFAULT false,
    "foto" TEXT NOT NULL,
    "galeri" TEXT NOT NULL,
    "populer" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "jumlahUlasan" INTEGER NOT NULL DEFAULT 0,
    "jarakPusat" REAL NOT NULL DEFAULT 0,
    "mitraId" TEXT,
    CONSTRAINT "Destinasi_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "Mitra" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Penginapan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mitraId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "fasilitas" TEXT NOT NULL,
    "aturan" TEXT NOT NULL,
    "hargaPerMalam" INTEGER NOT NULL,
    "koordinatLat" REAL NOT NULL,
    "koordinatLng" REAL NOT NULL,
    "foto" TEXT NOT NULL,
    "galeri" TEXT NOT NULL,
    "jamMasuk" TEXT NOT NULL,
    "jamKeluar" TEXT NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0,
    "jumlahUlasan" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Penginapan_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "Mitra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pemandu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mitraId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "bahasa" TEXT NOT NULL,
    "keahlian" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "tarif" INTEGER NOT NULL,
    "ketersediaan" TEXT NOT NULL,
    "foto" TEXT NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0,
    "jumlahUlasan" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Pemandu_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "Mitra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Paket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mitraId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "durasi" TEXT NOT NULL,
    "itinerary" TEXT NOT NULL,
    "inklusi" TEXT NOT NULL,
    "eksklusi" TEXT NOT NULL,
    "hargaPerOrang" INTEGER NOT NULL,
    "minimalOrang" INTEGER NOT NULL DEFAULT 4,
    "kuota" INTEGER NOT NULL,
    "tanggalKeberangkatan" TEXT NOT NULL,
    "titikKumpul" TEXT NOT NULL,
    "antarJemput" BOOLEAN NOT NULL DEFAULT false,
    "pemandu" BOOLEAN NOT NULL DEFAULT true,
    "foto" TEXT NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0,
    "jumlahUlasan" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Paket_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "Mitra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaketDestinasi" (
    "paketId" TEXT NOT NULL,
    "destinasiId" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("paketId", "destinasiId"),
    CONSTRAINT "PaketDestinasi_paketId_fkey" FOREIGN KEY ("paketId") REFERENCES "Paket" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PaketDestinasi_destinasiId_fkey" FOREIGN KEY ("destinasiId") REFERENCES "Destinasi" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PemanduDestinasi" (
    "pemanduId" TEXT NOT NULL,
    "destinasiId" TEXT NOT NULL,

    PRIMARY KEY ("pemanduId", "destinasiId"),
    CONSTRAINT "PemanduDestinasi_pemanduId_fkey" FOREIGN KEY ("pemanduId") REFERENCES "Pemandu" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PemanduDestinasi_destinasiId_fkey" FOREIGN KEY ("destinasiId") REFERENCES "Destinasi" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pesanan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "penggunaId" TEXT NOT NULL,
    "jenisLayanan" TEXT NOT NULL,
    "layananId" TEXT NOT NULL,
    "layananNama" TEXT NOT NULL,
    "tanggal" TEXT NOT NULL,
    "tanggalSelesai" TEXT,
    "jumlahOrang" INTEGER NOT NULL DEFAULT 1,
    "jumlahMalam" INTEGER NOT NULL DEFAULT 0,
    "subtotal" INTEGER NOT NULL,
    "biayaLayanan" INTEGER NOT NULL DEFAULT 5000,
    "diskon" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Menunggu Pembayaran',
    "kodeVoucher" TEXT NOT NULL,
    "metodePembayaran" TEXT,
    "tambahanPemandu" BOOLEAN NOT NULL DEFAULT false,
    "antarJemput" BOOLEAN NOT NULL DEFAULT false,
    "namaPemesan" TEXT NOT NULL,
    "teleponPemesan" TEXT NOT NULL,
    "catatan" TEXT,
    "komisi" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "selesaiAt" DATETIME,
    CONSTRAINT "Pesanan_penggunaId_fkey" FOREIGN KEY ("penggunaId") REFERENCES "Pengguna" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ulasan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pesananId" TEXT NOT NULL,
    "penggunaId" TEXT NOT NULL,
    "targetJenis" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "bintang" INTEGER NOT NULL,
    "bintangPelayanan" INTEGER NOT NULL,
    "komentar" TEXT NOT NULL,
    "foto" TEXT,
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ulasan_pesananId_fkey" FOREIGN KEY ("pesananId") REFERENCES "Pesanan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ulasan_penggunaId_fkey" FOREIGN KEY ("penggunaId") REFERENCES "Pengguna" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UsulanTempat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "penggunaId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "akses" TEXT NOT NULL,
    "biaya" TEXT NOT NULL,
    "kontakPengelola" TEXT NOT NULL,
    "foto" TEXT,
    "pernyataanIzin" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'Menunggu Verifikasi',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsulanTempat_penggunaId_fkey" FOREIGN KEY ("penggunaId") REFERENCES "Pengguna" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PromoBanner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "tujuan" TEXT NOT NULL,
    "tipe" TEXT NOT NULL DEFAULT 'banner',
    "kode" TEXT,
    "periode" TEXT,
    "pemilik" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Favorit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "penggunaId" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Favorit_penggunaId_fkey" FOREIGN KEY ("penggunaId") REFERENCES "Pengguna" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Pengguna_email_key" ON "Pengguna"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Mitra_penggunaId_key" ON "Mitra"("penggunaId");

-- CreateIndex
CREATE UNIQUE INDEX "Destinasi_slug_key" ON "Destinasi"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Paket_slug_key" ON "Paket"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Pesanan_kode_key" ON "Pesanan"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Pesanan_kodeVoucher_key" ON "Pesanan"("kodeVoucher");

-- CreateIndex
CREATE UNIQUE INDEX "Ulasan_pesananId_key" ON "Ulasan"("pesananId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorit_penggunaId_jenis_targetId_key" ON "Favorit"("penggunaId", "jenis", "targetId");
