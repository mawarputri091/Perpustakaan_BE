exports.seed = async function (knex) {
  // Hapus data lama dulu sebelum insert
  await knex('buku').del()

  await knex('buku').insert([
    { 
      id: '1', 
      nama_buku: "Laskar Pelangi1", 
      harga_buku: 150000, 
      jenis_buku: "Novel",
      foto_buku: "public/uploads/1777895478152_742705589.jpg",
      stok: 5
    },
    { 
      id: '2', 
      nama_buku: "Laskar Pelangi2", 
      harga_buku: 150000, 
      jenis_buku: "Novel",
      foto_buku: "public/uploads/1777895478152_742705589.jpg",
      stok: 5
    },
    { 
      id: '3', 
      nama_buku: "Laskar Pelangi3", 
      harga_buku: 150000, 
      jenis_buku: "Novel",
      foto_buku: "public/uploads/1777895478152_742705589.jpg",
      stok: 5
    },
  ])
}
