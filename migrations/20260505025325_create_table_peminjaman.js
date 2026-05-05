/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// migrations/20260505000000_create_table_peminjaman.js
exports.up = function(knex) {
  return knex.schema.createTable('peminjaman', (table) => {
    table.increments('id').primary();
    table.integer('siswa_id').unsigned().notNullable();
    table.integer('buku_id').unsigned().notNullable();
    table.date('tanggal_pinjam').notNullable();
    table.date('tanggal_jatuh_tempo').notNullable();
    table.date('tanggal_kembali');
    table.enum('status', ['dipinjam', 'dikembalikan', 'terlambat']).defaultTo('dipinjam');
    table.integer('denda').defaultTo(0);
    table.text('keterangan');
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('siswa_id').references('id').on('siswa').onDelete('RESTRICT');
    table.foreign('buku_id').references('id').on('buku').onDelete('RESTRICT');
    
    // Index untuk performa query
    table.index('siswa_id');
    table.index('buku_id');
    table.index('status');
    table.index('tanggal_pinjam');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('peminjaman');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
