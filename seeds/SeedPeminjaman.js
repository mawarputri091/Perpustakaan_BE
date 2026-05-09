exports.seed = async function (knex) {
  await knex('peminjaman').del()

  await knex('peminjaman').insert([
    {
      id: '20000000-0000-0000-0000-000000000001',
      siswa_id: '10000000-0000-0000-0000-000000000001',
      buku_id: '1',
      tanggal_pinjam: new Date('2026-04-01'),
      tanggal_kembali: new Date('2026-04-08'),  // sudah lewat → terlambat saat dikembalikan
      tanggal_dikembalikan: null,
      status: 'dipinjam',
      denda: 0,
      jumlah_perpanjangan: 0
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      siswa_id: '10000000-0000-0000-0000-000000000002',
      buku_id: '2',
      tanggal_pinjam: new Date('2026-05-03'),
      tanggal_kembali: new Date('2026-05-10'), // besok deadline → bisa perpanjang hari ini
      tanggal_dikembalikan: null,
      status: 'dipinjam',
      denda: 0,
      jumlah_perpanjangan: 0
    },
    {
      id: '20000000-0000-0000-0000-000000000003',
      siswa_id: '10000000-0000-0000-0000-000000000003',
      buku_id: '3',
      tanggal_pinjam: new Date('2026-04-01'),
      tanggal_kembali: new Date('2026-04-08'),  // sudah lewat → siap test terlambat
      tanggal_dikembalikan: null,
      status: 'dipinjam',
      denda: 0,
      jumlah_perpanjangan: 0
    }
  ])
}