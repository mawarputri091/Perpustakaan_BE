// Migration cleanup: migrasi rombak total fitur auth/register.
// Sebelumnya role & membership dipisah (role: admin/user, membership: gratis/premium).
// Sekarang digabung jadi 1 kolom 'role' saja (admin/gratis/premium).
//
// Migration ini:
// 1. Mindahin data dari kolom 'membership' ke kolom 'role', KECUALI untuk user
//    yang role-nya 'admin' (admin tidak boleh ketimpa jadi gratis/premium).
// 2. Hapus kolom 'membership' setelah datanya aman dipindah.
exports.up = async function(knex) {
  const hasMembership = await knex.schema.hasColumn('users', 'membership');

  if (hasMembership) {
    // Pindahkan nilai membership ke role, untuk user yang role-nya BUKAN admin.
    // Contoh: role lama 'user' + membership 'premium' → role baru jadi 'premium'.
    await knex.raw(`
      UPDATE users 
      SET role = membership 
      WHERE role != 'admin'
    `);

    // Setelah data aman dipindah, baru hapus kolom membership
    await knex.schema.table('users', function(table) {
      table.dropColumn('membership');
    });
  }
};

exports.down = async function(knex) {
  const hasMembership = await knex.schema.hasColumn('users', 'membership');

  if (!hasMembership) {
    await knex.schema.table('users', function(table) {
      table.string('membership').notNullable().defaultTo('gratis');
    });

    // Kembalikan data: kalau role bukan admin, salin balik ke membership,
    // lalu role dikembalikan jadi 'user' (perkiraan kasar, tidak 100% akurat
    // karena info asli role vs membership lama sudah tercampur).
    await knex.raw(`
      UPDATE users 
      SET membership = role 
      WHERE role != 'admin'
    `);
    await knex.raw(`
      UPDATE users 
      SET role = 'user' 
      WHERE role != 'admin'
    `);
  }
};