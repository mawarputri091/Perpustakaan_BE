// File: migrations/xxxxxx_add_stok_to_buku.js
exports.up = async function(knex) {
  const hasStok = await knex.schema.hasColumn('buku', 'stok');
  
  if (!hasStok) {
    return knex.schema.table('buku', function(table) {
      table.integer('stok').notNullable().defaultTo(0);
    });
  }
};

exports.down = async function(knex) {
  const hasStok = await knex.schema.hasColumn('buku', 'stok');
  
  if (hasStok) {
    return knex.schema.table('buku', function(table) {
      table.dropColumn('stok');
    });
  }
};