exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('buku')
  if (!exists) {
    return knex.schema.createTable('buku', function(table) {
      table.uuid('id').primary();
      table.string('nama_buku').notNullable();
      table.decimal('harga_buku', 15, 2).notNullable();
      table.string('jenis_buku').notNullable();
      table.string('foto_buku').nullable();
      table.integer('stok').notNullable().defaultTo(0);
      table.timestamps(true, true);
      table.timestamp('deleted_at').nullable();
    });
  }
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('buku');
};