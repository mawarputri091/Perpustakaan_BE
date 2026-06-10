exports.seed = async function (knex) {
  await knex('peminjaman').del()

  await knex('peminjaman').insert([
    {
      id: '20000000-0000-0000-0000-000000000001',
      siswa_id: '10000000-0000-0000-0000-000000000001',
      buku_id: 'c761e155-7d7c-4ad7-9aef-032f1356c170', // ✅ Laskar Pelangi
      tanggal_pinjam: new Date('2026-04-01'),
      tanggal_kembali: new Date('2026-04-08'),
      tanggal_dikembalikan: null,
      status: 'dipinjam',
      denda: 0,
      jumlah_perpanjangan: 0
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      siswa_id: '10000000-0000-0000-0000-000000000002',
      buku_id: '72b10c32-cefe-421c-95db-d887c9630d71', // ✅ The Alchemist
      tanggal_pinjam: new Date('2026-05-03'),
      tanggal_kembali: new Date('2026-05-10'),
      tanggal_dikembalikan: null,
      status: 'dipinjam',
      denda: 0,
      jumlah_perpanjangan: 0
    },
    {
      id: '20000000-0000-0000-0000-000000000003',
      siswa_id: '10000000-0000-0000-0000-000000000003',
      buku_id: '3c599847-f901-42d4-820f-e6a7e6944084', // ✅ The Brothers Karamazov
      tanggal_pinjam: new Date('2026-04-01'),
      tanggal_kembali: new Date('2026-04-08'),
      tanggal_dikembalikan: null,
      status: 'dipinjam',
      denda: 0,
      jumlah_perpanjangan: 0
    }
  ])
}