// Migration: mengubah peminjaman.siswa_id menjadi nullable + tambah kolom
// untuk mendukung transaksi offline (pengunjung yang tidak punya akun siswa).
exports.up = async function(knex) {
  const hasNamaPeminjam = await knex.schema.hasColumn('peminjaman', 'nama_peminjam_offline');
  const hasJenis = await knex.schema.hasColumn('peminjaman', 'jenis_peminjaman');

  // 1. Ubah siswa_id jadi nullable (MySQL: perlu redefinisi kolom)
  await knex.raw('ALTER TABLE peminjaman MODIFY siswa_id CHAR(36) NULL');

  // 2. Tambah kolom baru kalau belum ada
  return knex.schema.table('peminjaman', function(table) {
    if (!hasNamaPeminjam) {
      table.string('nama_peminjam_offline').nullable();
    }
    if (!hasJenis) {
      table.string('jenis_peminjaman').notNullable().defaultTo('online'); // 'online' | 'offline'
    }
  });
};

exports.down = async function(knex) {
  const hasNamaPeminjam = await knex.schema.hasColumn('peminjaman', 'nama_peminjam_offline');
  const hasJenis = await knex.schema.hasColumn('peminjaman', 'jenis_peminjaman');

  await knex.schema.table('peminjaman', function(table) {
    if (hasNamaPeminjam) table.dropColumn('nama_peminjam_offline');
    if (hasJenis) table.dropColumn('jenis_peminjaman');
  });

  // Catatan: siswa_id sengaja TIDAK dikembalikan ke NOT NULL di sini,
  // karena kalau sudah ada data offline (siswa_id = NULL), rollback akan gagal.
};