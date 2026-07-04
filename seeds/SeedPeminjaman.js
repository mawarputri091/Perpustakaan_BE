// seeds/20260623_peminjaman_seed.js

exports.seed = async function (knex) {
  // Hapus data lama
  await knex('peminjaman').del()

  // Insert data seed
  await knex('peminjaman').insert([
    // 1. Peminjaman Online - Sedang Dipinjam
    {
      id: '20000000-0000-0000-0000-000000000001',
      siswa_id: '10000000-0000-0000-0000-000000000001',
      buku_id: 'c761e155-7d7c-4ad7-9aef-032f1356c170', // Laskar Pelangi
      jenis_peminjaman: 'online',
      nama_peminjam_offline: null,
      tanggal_pinjam: new Date('2026-04-01'),
      tanggal_kembali: new Date('2026-04-08'),
      tanggal_dikembalikan: null,
      status: 'dipinjam',
      jumlah_perpanjangan: 0,
      denda: 0,
      created_at: new Date('2026-06-23 11:49:24'),
      updated_at: new Date('2026-06-23 11:49:24'),
      deleted_at: null
    },
    // 2. Peminjaman Online - Sudah Dikembalikan Terlambat
    {
      id: '20000000-0000-0000-0000-000000000002',
      siswa_id: '10000000-0000-0000-0000-000000000002',
      buku_id: '72b10c32-cefe-421c-95db-d887c9630d71', // The Alchemist
      jenis_peminjaman: 'online',
      nama_peminjam_offline: null,
      tanggal_pinjam: new Date('2026-05-03'),
      tanggal_kembali: new Date('2026-05-10'),
      tanggal_dikembalikan: new Date('2026-06-23 11:50:18'),
      status: 'terlambat',
      jumlah_perpanjangan: 0,
      denda: 90000,
      created_at: new Date('2026-06-23 11:49:24'),
      updated_at: new Date('2026-06-23 11:50:18'),
      deleted_at: null
    },
    // 3. Peminjaman Online - Sudah Dikembalikan Terlambat
    {
      id: '20000000-0000-0000-0000-000000000003',
      siswa_id: '10000000-0000-0000-0000-000000000003',
      buku_id: '3c599847-f901-42d4-820f-e6a7e6944084', // The Brothers Karamazov
      jenis_peminjaman: 'online',
      nama_peminjam_offline: null,
      tanggal_pinjam: new Date('2026-04-01'),
      tanggal_kembali: new Date('2026-04-08'),
      tanggal_dikembalikan: new Date('2026-06-23 11:50:20'),
      status: 'terlambat',
      jumlah_perpanjangan: 0,
      denda: 154000,
      created_at: new Date('2026-06-23 11:49:24'),
      updated_at: new Date('2026-06-23 11:50:20'),
      deleted_at: null
    },
    // 4. Peminjaman Online - Sudah Dikembalikan Tepat Waktu
    {
      id: 'bb4b6be6-2a17-4bef-bdc5-643e331fb19d',
      siswa_id: '10000000-0000-0000-0000-000000000001',
      buku_id: '01bde5c8-8ea0-4a83-b803-3ac4dc88f944', // The Communist Manifesto
      jenis_peminjaman: 'online',
      nama_peminjam_offline: null,
      tanggal_pinjam: new Date('2026-06-23 11:54:47'),
      tanggal_kembali: new Date('2026-06-30 11:54:47'),
      tanggal_dikembalikan: new Date('2026-06-23 11:54:53'),
      status: 'dikembalikan',
      jumlah_perpanjangan: 0,
      denda: 0,
      created_at: new Date('2026-06-23 11:54:40'),
      updated_at: new Date('2026-06-23 11:54:53'),
      deleted_at: null
    },
    // 5. Peminjaman Offline - Sudah Dikembalikan
    {
      id: 'bd737a7c-30a9-44d9-8b20-ae0331b931c5',
      siswa_id: null,
      buku_id: '01bde5c8-8ea0-4a83-b803-3ac4dc88f944', // The Communist Manifesto
      jenis_peminjaman: 'offline',
      nama_peminjam_offline: 'FX',
      tanggal_pinjam: new Date('2026-06-23 12:00:03'),
      tanggal_kembali: new Date('2026-06-30 12:00:03'),
      tanggal_dikembalikan: new Date('2026-06-23 12:10:32'),
      status: 'dikembalikan',
      jumlah_perpanjangan: 0,
      denda: 0,
      created_at: new Date('2026-06-23 12:00:02'),
      updated_at: new Date('2026-06-23 12:10:32'),
      deleted_at: null
    },
    // 6. Peminjaman Online - Sudah Dikembalikan
    {
      id: 'abd1545f-950f-4f58-877e-0098563d737d',
      siswa_id: '10000000-0000-0000-0000-000000000001',
      buku_id: '01bde5c8-8ea0-4a83-b803-3ac4dc88f944', // The Communist Manifesto
      jenis_peminjaman: 'online',
      nama_peminjam_offline: null,
      tanggal_pinjam: new Date('2026-06-23 12:52:36'),
      tanggal_kembali: new Date('2026-06-30 12:52:36'),
      tanggal_dikembalikan: new Date('2026-06-23 12:52:45'),
      status: 'dikembalikan',
      jumlah_perpanjangan: 0,
      denda: 0,
      created_at: new Date('2026-06-23 12:52:32'),
      updated_at: new Date('2026-06-23 12:52:44'),
      deleted_at: null
    },
    // 7. Peminjaman Offline - Sudah Dikembalikan
    {
      id: '9e27a136-4dcc-40b1-a01b-384ff0e665c4',
      siswa_id: null,
      buku_id: '01bde5c8-8ea0-4a83-b803-3ac4dc88f944', // The Communist Manifesto
      jenis_peminjaman: 'offline',
      nama_peminjam_offline: 'FX',
      tanggal_pinjam: new Date('2026-06-23 12:52:42'),
      tanggal_kembali: new Date('2026-06-30 12:52:42'),
      tanggal_dikembalikan: new Date('2026-06-23 12:52:47'),
      status: 'dikembalikan',
      jumlah_perpanjangan: 0,
      denda: 0,
      created_at: new Date('2026-06-23 12:52:42'),
      updated_at: new Date('2026-06-23 12:52:46'),
      deleted_at: null
    },
    // 8. Peminjaman Offline - Sudah Dikembalikan
    {
      id: 'a60a1bd4-014e-47be-b126-cf8414b4e483',
      siswa_id: null,
      buku_id: '01bde5c8-8ea0-4a83-b803-3ac4dc88f944', // The Communist Manifesto
      jenis_peminjaman: 'offline',
      nama_peminjam_offline: 'FX',
      tanggal_pinjam: new Date('2026-06-23 12:57:01'),
      tanggal_kembali: new Date('2026-06-30 12:57:01'),
      tanggal_dikembalikan: new Date('2026-06-23 12:57:05'),
      status: 'dikembalikan',
      jumlah_perpanjangan: 0,
      denda: 0,
      created_at: new Date('2026-06-23 12:57:00'),
      updated_at: new Date('2026-06-23 12:57:04'),
      deleted_at: null
    },
    // 9. Peminjaman Online - Sedang Dipinjam
    {
      id: 'af62d2f8-efa9-4714-b73e-4613827e2a31',
      siswa_id: '10000000-0000-0000-0000-000000000001',
      buku_id: '01bde5c8-8ea0-4a83-b803-3ac4dc88f944', // The Communist Manifesto
      jenis_peminjaman: 'online',
      nama_peminjam_offline: null,
      tanggal_pinjam: new Date('2026-06-23 12:59:31'),
      tanggal_kembali: new Date('2026-06-30 12:59:31'),
      tanggal_dikembalikan: null,
      status: 'dipinjam',
      jumlah_perpanjangan: 0,
      denda: 0,
      created_at: new Date('2026-06-23 12:59:20'),
      updated_at: new Date('2026-06-23 12:59:31'),
      deleted_at: null
    },
    // 10. Peminjaman Online - Menunggu Konfirmasi
    {
      id: '3f0e6a1c-7778-41a3-ae56-3fdf7dcd3ba1',
      siswa_id: '10000000-0000-0000-0000-000000000003',
      buku_id: '01bde5c8-8ea0-4a83-b803-3ac4dc88f944', // The Communist Manifesto
      jenis_peminjaman: 'online',
      nama_peminjam_offline: null,
      tanggal_pinjam: new Date('2026-06-23 13:01:15'),
      tanggal_kembali: new Date('2026-06-30 13:01:15'),
      tanggal_dikembalikan: null,
      status: 'menunggu',
      jumlah_perpanjangan: 0,
      denda: 0,
      created_at: new Date('2026-06-23 13:01:15'),
      updated_at: new Date('2026-06-23 13:01:15'),
      deleted_at: null
    }
  ])

  // Optional: Reset auto-increment (untuk MySQL)
  // await knex.raw('ALTER TABLE peminjaman AUTO_INCREMENT = 1')
}

// Atau jika ingin menggunakan batch insert untuk data banyak:
// exports.seed = async function (knex) {
//   await knex('peminjaman').del()
//   
//   const peminjamanData = [
//     // ... data di atas
//   ]
//   
//   // Batch insert per 100 data
//   const chunkSize = 100
//   for (let i = 0; i < peminjamanData.length; i += chunkSize) {
//     const chunk = peminjamanData.slice(i, i + chunkSize)
//     await knex('peminjaman').insert(chunk)
//   }
// }