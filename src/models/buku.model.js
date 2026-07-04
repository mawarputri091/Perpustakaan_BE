const db = require('../config/db');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Ubah nama file (foto_buku/pdf_buku) jadi URL lengkap yang bisa diakses dari luar
const formatFoto = (rows) => rows.map(row => ({
    ...row,
    foto_buku: row.foto_buku ? `${BASE_URL}/uploads/${row.foto_buku}` : null,
    pdf_buku: row.pdf_buku ? `${BASE_URL}/uploads/pdfs/${row.pdf_buku}` : null
}));

// ========== READ ==========

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

// Versi tanpa format URL (raw filename).
// Dipakai oleh service untuk operasi filesystem (hapus file lama) & update internal,
// supaya tidak salah path karena foto_buku/pdf_buku sudah berbentuk URL lengkap.
exports.getByIdRaw = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM buku WHERE id = ? AND deleted_at IS NULL',
        [id]
    );
    return rows[0] || null;
};

exports.getByIdIncludeDeleted = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM buku WHERE id = ?',
        [id]
    );
    return rows[0] || null;
};

// ========== CREATE ==========

exports.create = async (data) => {
    console.log('💾 INSERT DATA:', {
        id: data.id,
        nama_buku: data.nama_buku,
        foto_buku: data.foto_buku,
        pdf_buku: data.pdf_buku,
        stok: data.stok
    });
    
    await db.query(
        `INSERT INTO buku (id, nama_buku, harga_buku, jenis_buku, foto_buku, pdf_buku, stok, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
            data.id,
            data.nama_buku,
            data.harga_buku,
            data.jenis_buku,
            data.foto_buku || null,
            data.pdf_buku || null,
            data.stok || 0
        ]
    );
};

// ========== UPDATE ==========

// Catatan: COALESCE(?, kolom) mengandalkan nilai NULL (bukan string kosong "")
// untuk "skip update" dan mempertahankan nilai lama. Service WAJIB mengirim null
// (bukan undefined / "") kalau field tidak ingin diubah.
exports.update = async (id, data) => {
    console.log('💾 UPDATE DATA:', {
        id,
        nama_buku: data.nama_buku,
        foto_buku: data.foto_buku,
        pdf_buku: data.pdf_buku,
        stok: data.stok
    });
    
    const [result] = await db.query(
        `UPDATE buku SET 
            nama_buku = COALESCE(?, nama_buku),
            harga_buku = COALESCE(?, harga_buku),
            jenis_buku = COALESCE(?, jenis_buku),
            stok = COALESCE(?, stok),
            foto_buku = COALESCE(?, foto_buku),
            pdf_buku = COALESCE(?, pdf_buku),
            updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL`,
        [
            data.nama_buku,
            data.harga_buku,
            data.jenis_buku,
            data.stok,
            data.foto_buku,
            data.pdf_buku,
            id
        ]
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

// ========== TAMBAHAN: UPDATE FOTO ==========

// Update FOTO saja (dipakai untuk SET foto_buku = NULL saat hapus foto)
exports.updateFoto = async (id, foto_buku) => {
    const [result] = await db.query(
        'UPDATE buku SET foto_buku = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
        [foto_buku, id]
    );
    return result;
};

// ========== DELETE ==========

exports.delete = async (id) => {
    await db.query(
        'UPDATE buku SET deleted_at = NOW() WHERE id = ?',
        [id]
    );
};

exports.hardDelete = async (id) => {
    const [result] = await db.query(
        'DELETE FROM buku WHERE id = ?',
        [id]
    );
    return result;
};

// ========== TAMBAHAN: UPDATE FOTO & PDF BERSAMAAN ==========

// Update Foto dan PDF sekaligus
exports.updateFotoPdf = async (id, foto_buku, pdf_buku) => {
    const [result] = await db.query(
        'UPDATE buku SET foto_buku = ?, pdf_buku = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
        [foto_buku, pdf_buku, id]
    );
    return result;
};