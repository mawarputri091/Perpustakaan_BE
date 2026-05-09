exports.seed = async function (knex) {
  await knex('buku').insert([
    { 
      id: '1', 
      nama_buku: "Laskar Pelangi1", 
      harga_buku: 150000, 
      jenis_buku: "Novel",
      foto_buku: "public/uploads/1777895478152_742705589.jpg"
    },
    { 
      id: '2', 
      nama_buku: "Laskar Pelangi2", 
      harga_buku: 150000, 
      jenis_buku: "Novel",
      foto_buku: "public/uploads/1777895478152_742705589.jpg"
    },
    { 
      id: '3', 
      nama_buku: "Laskar Pelangi3", 
      harga_buku: 150000, 
      jenis_buku: "Novel",
      foto_buku: "public/uploads/1777895478152_742705589.jpg"
    },
  ])
  .onConflict('id')  // Jika ID sudah ada
    .ignore()  // Abaikan, tidak melakukan apa-apa
};