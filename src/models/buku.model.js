const db = require('../config/db');

// Untuk mengambil semua buku yang belum dihapus
exports.getAll = async () => {
    const [rows] = await db.query(
        'SELECT * FROM buku WHERE deleted_at IS NULL OR deleted_at = "0000-00-00 00:00:00"'
    );
    return rows;
};

// Mencari buku berdasarkan nama
exports.getByName = async (nama_buku) => {
    const [rows] = await db.query(
        'SELECT * FROM buku WHERE nama_buku = ? AND (deleted_at IS NULL OR deleted_at = "0000-00-00 00:00:00")', 
        [nama_buku]
    );
    return rows[0];
};

// Mendapatkan buku berdasarkan ID
exports.getById = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM buku WHERE id = ? AND (deleted_at IS NULL OR deleted_at = "0000-00-00 00:00:00")',
        [id]
    );
    return rows[0];
};

// Menyimpan buku baru
exports.create = async (data) => {
    await db.query(
        'INSERT INTO buku (id, nama_buku, harga_buku, jenis_buku, foto_buku, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [data.id, data.nama_buku, data.harga_buku, data.jenis_buku, data.foto_buku]
    );
};

// Mengupdate buku berdasarkan ID
exports.update = async (id, data) => {
    const [result] = await db.query(
        `UPDATE buku SET 
            nama_buku = COALESCE(?, nama_buku),
            harga_buku = COALESCE(?, harga_buku),
            jenis_buku = COALESCE(?, jenis_buku),
            foto_buku = COALESCE(?, foto_buku),
            updated_at = NOW()
        WHERE id = ? AND (deleted_at IS NULL OR deleted_at = "0000-00-00 00:00:00")`,
        [data.nama_buku, data.harga_buku, data.jenis_buku, data.foto_buku, id]
    );
    return result;
};

// Mendapatkan buku termasuk yang sudah soft delete
exports.getByIdIncludeDeleted = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM buku WHERE id = ?',
        [id]
    );
    return rows[0];
};

// Hard delete - Menghapus data secara permanen
exports.hardDelete = async (id) => {
    const [result] = await db.query(
        'DELETE FROM buku WHERE id = ?',
        [id]
    );
    return result;
};