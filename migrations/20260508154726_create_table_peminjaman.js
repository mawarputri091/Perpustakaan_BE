exports.up = function(knex) {
  return knex.schema.createTableIfNotExists('peminjaman', function(table) {
    table.uuid('id').primary()
    table.uuid('siswa_id').notNullable()
    table.uuid('buku_id').notNullable()
    table.timestamp('tanggal_pinjam').notNullable()
    table.timestamp('tanggal_kembali').notNullable()       // deadline pengembalian
    table.timestamp('tanggal_dikembalikan').nullable()     // diisi saat buku dikembalikan
    table.string('status').defaultTo('dipinjam')           // dipinjam | dikembalikan | terlambat
    table.integer('jumlah_perpanjangan').defaultTo(0)      // tracking berapa kali diperpanjang
    table.integer('denda').defaultTo(0)                    // denda keterlambatan (Rp 2.000/hari)
    table.timestamps(true, true)
    table.timestamp('deleted_at').nullable()
  })
}

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('peminjaman')
}