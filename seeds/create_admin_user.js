/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const { hash } = require("bcrypt");

exports.seed = async function (knex) {
  const hashedPassword1 = await hash('1', 10)
  const hashedPassword2 = await hash('2', 10)
  const hashedPassword3 = await hash('3', 10)
  
  await knex('users')
    .insert([
      {
        id: "10000000-0000-0000-0000-000000000001",
        username: 'admin',
        password: hashedPassword1,
        role: 'admin'
      },
      {
        id: "10000000-0000-0000-0000-000000000002",
        username: 'berbayar',
        password: hashedPassword2,
        role: 'berbayar'
      },
      {
        id: "10000000-0000-0000-0000-000000000003",
        username: 'gratis',
        password: hashedPassword3,
        role: 'gratis'
      }
    ])
    .onConflict('id')  // Jika ID sudah ada
    .ignore()  // Abaikan, tidak melakukan apa-apa
};