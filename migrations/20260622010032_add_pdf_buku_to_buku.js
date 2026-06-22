exports.up = async function(knex) {
  const hasColumn = await knex.schema.hasColumn('buku', 'pdf_buku');
  if (!hasColumn) {
    return knex.schema.alterTable('buku', function(table) {
      table.string('pdf_buku').nullable();
    });
  }
};

exports.down = function(knex) {
  return knex.schema.alterTable('buku', function(table) {
    table.dropColumn('pdf_buku');
  });
};