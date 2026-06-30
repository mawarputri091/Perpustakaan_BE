// Migration: menambahkan kolom untuk fitur register baru.
// Catatan: kolom 'role' SUDAH ADA dari migration awal (defaultTo('user')).
// Di skema baru ini, 'role' dipakai untuk menyimpan SEMUA status sekaligus:
// 'admin' | 'gratis' | 'premium' — TIDAK ada kolom membership terpisah.
exports.up = async function(knex) {
  const hasName = await knex.schema.hasColumn('users', 'name');
  const hasEmail = await knex.schema.hasColumn('users', 'email');
  const hasNoTelp = await knex.schema.hasColumn('users', 'no_telp');

  return knex.schema.table('users', function(table) {
    if (!hasName) {
      table.string('name').nullable();
    }
    if (!hasEmail) {
      table.string('email').nullable().unique();
    }
    if (!hasNoTelp) {
      table.string('no_telp').nullable();
    }
  });
};

exports.down = async function(knex) {
  const hasName = await knex.schema.hasColumn('users', 'name');
  const hasEmail = await knex.schema.hasColumn('users', 'email');
  const hasNoTelp = await knex.schema.hasColumn('users', 'no_telp');

  return knex.schema.table('users', function(table) {
    if (hasName) table.dropColumn('name');
    if (hasEmail) table.dropColumn('email');
    if (hasNoTelp) table.dropColumn('no_telp');
  });
};