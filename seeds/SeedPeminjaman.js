// seeds/seedPeminjaman.js
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('peminjaman').del();
  
  // Pastikan data siswa dan buku sudah ada
  const siswa = await knex('siswa').select('id');
  const buku = await knex('buku').select('id');
  
  if (siswa.length === 0 || buku.length === 0) {
    console.log('⚠️  Error: Data siswa atau buku tidak ditemukan. Jalankan seed siswa dan buku terlebih dahulu.');
    return;
  }
  
  // Insert 3 contoh data peminjaman
  await knex('peminjaman').insert([
    {
      siswa_id: siswa[0].id,      // Menggunakan siswa pertama
      buku_id: buku[0].id,         // Menggunakan buku pertama
      tanggal_pinjam: '2026-05-01',
      tanggal_jatuh_tempo: '2026-05-08',
      tanggal_kembali: null,       // Belum dikembalikan
      status: 'dipinjam',
      denda: 0,
      keterangan: 'Peminjaman pertama',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      siswa_id: siswa[0].id,      // Siswa yang sama meminjam buku lain
      buku_id: buku[1].id,         // Menggunakan buku kedua
      tanggal_pinjam: '2026-05-02',
      tanggal_jatuh_tempo: '2026-05-09',
      tanggal_kembali: null,       // Belum dikembalikan
      status: 'dipinjam',
      denda: 0,
      keterangan: 'Peminjaman kedua',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      siswa_id: siswa[1].id,      // Menggunakan siswa kedua
      buku_id: buku[0].id,         // Menggunakan buku pertama (buku yang sama dipinjam siswa lain)
      tanggal_pinjam: '2026-04-25',
      tanggal_jatuh_tempo: '2026-05-02',
      tanggal_kembali: '2026-05-04', // Telat dikembalikan
      status: 'dikembalikan',
      denda: 2000,                  // Telat 2 hari x 1000 = 2000
      keterangan: 'Dikembalikan terlambat 2 hari karena lupa',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);
  
  console.log('✅ 3 contoh data peminjaman berhasil ditambahkan');
  console.log('📊 Detail peminjaman:');
  console.log('   - Siswa 1 meminjam Buku 1 (status: dipinjam)');
  console.log('   - Siswa 1 meminjam Buku 2 (status: dipinjam)');
  console.log('   - Siswa 2 meminjam Buku 1 (status: dikembalikan dengan denda Rp 2.000)');
};