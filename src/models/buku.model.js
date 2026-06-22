const db = require('../config/db');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const formatFoto = (rows) => rows.map(row => ({
    ...row,
    foto_buku: row.foto_buku ? `${BASE_URL}/uploads/${row.foto_buku}` : null,
    pdf_buku:  row.pdf_buku  ? `${BASE_URL}/uploads/pdfs/${row.pdf_buku}` : null
}));


exports.getAll = async () => {
    const [rows] = await db.query(
        'SELECT * FROM buku WHERE deleted_at IS NULL'
    );
    return formatFoto(rows);
};

exports.getByName = async (nama_buku) => {
    const [rows] = await db.query(
        'SELECT * FROM buku WHERE nama_buku = ? AND deleted_at IS NULL',
        [nama_buku]
    );
    return rows[0] ? formatFoto(rows)[0] : null;
};

exports.getById = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM buku WHERE id = ? AND deleted_at IS NULL',
        [id]
    );
    return rows[0] ? formatFoto(rows)[0] : null;
};

// ✅ FUNGSI BARU: getById tanpa format URL (raw filename)
// Dipakai oleh service untuk operasi filesystem (hapus file lama) & update internal.
exports.getByIdRaw = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM buku WHERE id = ? AND deleted_at IS NULL',
        [id]
    );
    return rows[0] || null;
};

exports.create = async (data) => {
    await db.query(
        'INSERT INTO buku (id, nama_buku, harga_buku, jenis_buku, foto_buku, pdf_buku, stok, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [
            data.id,
            data.nama_buku,
            data.harga_buku,
            data.jenis_buku,
            data.foto_buku || null,
            data.pdf_buku  || null,
            data.stok      || 0
        ]
    );
};

exports.update = async (id, data) => {
    // Catatan: COALESCE(?, kolom) di sini mengandalkan nilai NULL (bukan string kosong "")
    // untuk "skip update" dan mempertahankan nilai lama. Service WAJIB mengirim null
    // (bukan undefined / "") kalau field tidak ingin diubah.
    const [result] = await db.query(
        `UPDATE buku SET 
            nama_buku  = COALESCE(?, nama_buku),
            harga_buku = COALESCE(?, harga_buku),
            jenis_buku = COALESCE(?, jenis_buku),
            foto_buku  = COALESCE(?, foto_buku),
            pdf_buku   = COALESCE(?, pdf_buku),
            updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL`,
        [data.nama_buku, data.harga_buku, data.jenis_buku, data.foto_buku, data.pdf_buku, id]
    );
    return result;
};


// Update PDF saja (juga dipakai untuk SET pdf_buku = NULL saat hapus PDF)
exports.updatePDF = async (id, pdf_buku) => {
    const [result] = await db.query(
        'UPDATE buku SET pdf_buku = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
        [pdf_buku, id]
    );
    return result;
};

exports.delete = async (id) => {
    await db.query(
        'UPDATE buku SET deleted_at = NOW() WHERE id = ?',
        [id]
    );
};

exports.getByIdIncludeDeleted = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM buku WHERE id = ?',
        [id]
    );
    return rows[0];
};

exports.hardDelete = async (id) => {
    const [result] = await db.query(
        'DELETE FROM buku WHERE id = ?',
        [id]
    );
    return result;
};
