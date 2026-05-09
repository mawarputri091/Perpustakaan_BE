exports.seed = async function (knex) {
  await knex('peminjaman').insert([
    {
      id: '20000000-0000-0000-0000-000000000001',
      siswa_id: '10000000-0000-0000-0000-000000000001', // siswa 1
      buku_id: '1',                                      // Laskar Pelangi1
      tanggal_pinjam: new Date('2026-05-01'),
      tanggal_kembali: new Date('2026-05-08'),
      tanggal_dikembalikan: null,
      status: 'dipinjam'
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      siswa_id: '10000000-0000-0000-0000-000000000002', // siswa 2
      buku_id: '2',                                      // Laskar Pelangi2
      tanggal_pinjam: new Date('2026-04-20'),
      tanggal_kembali: new Date('2026-04-27'),
      tanggal_dikembalikan: new Date('2026-04-30'),
      status: 'terlambat'
    }
  ])
}