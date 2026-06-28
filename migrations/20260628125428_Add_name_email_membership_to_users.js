// Migration: menambahkan kolom untuk fitur register & membership.
exports.up = async function(knex) {
  const hasName = await knex.schema.hasColumn('users', 'name');
  const hasEmail = await knex.schema.hasColumn('users', 'email');
  const hasMembership = await knex.schema.hasColumn('users', 'membership');

  return knex.schema.table('users', function(table) {
    if (!hasName) {
      table.string('name').nullable();
    }
    if (!hasEmail) {
      table.string('email').nullable().unique();
    }
    if (!hasMembership) {
      // 'gratis' | 'premium' — terpisah dari kolom role (admin/user)
      table.string('membership').notNullable().defaultTo('gratis');
    }
  });
};

exports.down = async function(knex) {
  const hasName = await knex.schema.hasColumn('users', 'name');
  const hasEmail = await knex.schema.hasColumn('users', 'email');
  const hasMembership = await knex.schema.hasColumn('users', 'membership');

  return knex.schema.table('users', function(table) {
    if (hasName) table.dropColumn('name');
    if (hasEmail) table.dropColumn('email');
    if (hasMembership) table.dropColumn('membership');
  });
};