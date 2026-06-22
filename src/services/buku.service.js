const bukuModel = require('../models/buku.model');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ✅ Path absolut ke folder upload (sesuai upload.middleware.js)
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');
const PDF_DIR = path.join(__dirname, '../../public/uploads/pdfs');

// ✅ Helper: pisahkan files berdasarkan fieldname (karena route pakai upload.any())
const pickFiles = (files) => {
    if (!files || !Array.isArray(files)) return { foto: null, pdf: null };
    const foto = files.find(f => f.fieldname === 'foto_buku') || null;
    const pdf  = files.find(f => f.fieldname === 'pdf_buku')  || null;
    return { foto, pdf };
};

// ✅ Helper: hapus file fisik dengan aman
const safeUnlink = (fullPath, label) => {
    try {
        if (fullPath && fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`${label} berhasil dihapus: ${fullPath}`);
        }
    } catch (err) {
        console.error(`Gagal menghapus ${label}:`, err.message);
    }
};

// CREATE - Membuat data buku baru
exports.createData = async (data, files) => {
    if (!data.nama_buku || !data.harga_buku || !data.jenis_buku) {
        const error = new Error('INVALID_PAYLOAD');
        error.statusCode = 400;
        throw error;
    }

    const existingBuku = await bukuModel.getByName(data.nama_buku);
    if (existingBuku) {
        const error = new Error('Buku duplikat! Nama buku ini sudah ada di database.');
        error.statusCode = 409;
        throw error;
    }

    const id = crypto.randomUUID();

    // ✅ Pisahkan foto & pdf dari array files
    const { foto, pdf } = pickFiles(files);

    const newData = {
        id,
        nama_buku: data.nama_buku,
        harga_buku: data.harga_buku,
        jenis_buku: data.jenis_buku,
        foto_buku: foto ? foto.filename : null,
        pdf_buku:  pdf  ? pdf.filename  : null
    };

    await bukuModel.create(newData);
    return newData;
};

// GET ALL - Mendapatkan semua buku
exports.getAllData = async () => {
    const buku = await bukuModel.getAll();
    return buku;
};

// GET BY ID - Mendapatkan buku berdasarkan id
exports.getDataById = async (id) => {
    const buku = await bukuModel.getById(id);

    if (!buku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    return buku;
};

// UPDATE - Mengupdate buku
exports.updateData = async (id, data, files) => {
    // ✅ Pakai getByIdRaw supaya foto_buku/pdf_buku masih berupa nama file (bukan URL)
    const existingBuku = await bukuModel.getByIdRaw(id);
    if (!existingBuku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    // ✅ Pisahkan foto & pdf dari array files
    const { foto, pdf } = pickFiles(files);

    // Jika ada foto baru → hapus foto lama
    if (foto && existingBuku.foto_buku) {
        safeUnlink(path.join(UPLOAD_DIR, existingBuku.foto_buku), 'Foto lama');
    }

    // Jika ada pdf baru → hapus pdf lama
    if (pdf && existingBuku.pdf_buku) {
        safeUnlink(path.join(PDF_DIR, existingBuku.pdf_buku), 'PDF lama');
    }

    // Siapkan data untuk update
    const updateData = {
        nama_buku:  data.nama_buku  || existingBuku.nama_buku,
        harga_buku: data.harga_buku || existingBuku.harga_buku,
        jenis_buku: data.jenis_buku || existingBuku.jenis_buku,
        foto_buku:  foto ? foto.filename : existingBuku.foto_buku,
        pdf_buku:   pdf  ? pdf.filename  : existingBuku.pdf_buku,
        updated_at: new Date()
    };

    await bukuModel.update(id, updateData);
    return { id, ...updateData };
};

// DELETE - Soft delete buku
exports.deleteData = async (id) => {
    const existingBuku = await bukuModel.getById(id);
    if (!existingBuku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    await bukuModel.delete(id);
    return true;
};

// HARD DELETE - Menghapus buku secara permanen
exports.hardDeleteData = async (id) => {
    // getByIdIncludeDeleted sudah return raw row, jadi field foto_buku/pdf_buku masih nama file
    const existingBuku = await bukuModel.getByIdIncludeDeleted(id);

    if (!existingBuku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    if (existingBuku.foto_buku) {
        safeUnlink(path.join(UPLOAD_DIR, existingBuku.foto_buku), `Foto ${existingBuku.foto_buku}`);
    }

    if (existingBuku.pdf_buku) {
        safeUnlink(path.join(PDF_DIR, existingBuku.pdf_buku), `PDF ${existingBuku.pdf_buku}`);
    }

    await bukuModel.hardDelete(id);
    return true;
};

// Upload PDF untuk buku
exports.uploadPDF = async (id, file) => {
    // ✅ Pakai getByIdRaw supaya pdf_buku masih berupa nama file
    const existingBuku = await bukuModel.getByIdRaw(id);
    if (!existingBuku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    // Hapus PDF lama jika ada
    if (existingBuku.pdf_buku) {
        safeUnlink(path.join(PDF_DIR, existingBuku.pdf_buku), `PDF lama ${existingBuku.pdf_buku}`);
    }

    // Simpan PDF baru
    const pdf_buku = file.filename;
    await bukuModel.updatePDF(id, pdf_buku);

    // Ambil data terbaru (dengan URL lengkap untuk response)
    const updatedBuku = await bukuModel.getById(id);
    return updatedBuku;
};

// Hapus PDF saja
exports.deletePDF = async (id) => {
    // ✅ Pakai getByIdRaw supaya pdf_buku masih berupa nama file
    const existingBuku = await bukuModel.getByIdRaw(id);
    if (!existingBuku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    if (!existingBuku.pdf_buku) {
        const error = new Error('Buku ini tidak memiliki PDF');
        error.statusCode = 404;
        throw error;
    }

    // Hapus file PDF fisik
    safeUnlink(path.join(PDF_DIR, existingBuku.pdf_buku), `PDF ${existingBuku.pdf_buku}`);

    // Update database: set pdf_buku = null
    await bukuModel.updatePDF(id, null);

    return true;
};