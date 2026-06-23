exports.up = function(knex) {
  return knex.schema.alterTable('peminjaman', function(table) {
    // CEK apakah kolom sudah ada sebelum menambah
    // Cara 1: Gunakan raw query (MySQL)
    return knex.raw(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'peminjaman' 
      AND COLUMN_NAME = 'jenis_peminjaman'
    `).then(result => {
      const count = result[0][0].count;
      
      if (count === 0) {
        // Hanya tambah jika belum ada
        return knex.schema.alterTable('peminjaman', function(table) {
          table.enum('jenis_peminjaman', ['online', 'offline', 'fisik']).nullable();
          table.string('nama_peminjam_offline').nullable();
          table.uuid('siswa_id').nullable().alter();
          table.enum('status', ['menunggu', 'dipinjam', 'dikembalikan', 'terlambat'])
            .defaultTo('menunggu').alter();
        });
      } else {
        console.log('Kolom sudah ada, skip migration');
        return knex.schema.alterTable('peminjaman', function(table) {
          // Hanya alter yang belum ada
          table.uuid('siswa_id').nullable().alter();
          table.enum('status', ['menunggu', 'dipinjam', 'dikembalikan', 'terlambat'])
            .defaultTo('menunggu').alter();
        });
      }
    });
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('peminjaman', function(table) {
    table.dropColumn('jenis_peminjaman');
    table.dropColumn('nama_peminjam_offline');
    table.uuid('siswa_id').notNullable().alter();
    table.string('status').defaultTo('dipinjam').alter();
  });
};