const bukuModel = require('../models/buku.model');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Path absolut ke folder upload (sesuai upload.middleware.js)
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');
const PDF_DIR = path.join(__dirname, '../../public/uploads/pdfs');

// Pisahkan files berdasarkan fieldname (karena route pakai upload.any())
const pickFiles = (files) => {
    if (!files || !Array.isArray(files)) return { foto: null, pdf: null };
    const foto = files.find(f => f.fieldname === 'foto_buku') || null;
    const pdf = files.find(f => f.fieldname === 'pdf_buku') || null;
    return { foto, pdf };
};

// Hapus file fisik dengan aman (tidak melempar error kalau file tidak ada)
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

// ========== CREATE ==========

exports.createData = async (data, files) => {
    // ... kode validasi bawaan ...

    const id = crypto.randomUUID();
    const { foto, pdf } = pickFiles(files);

    // Antisipasi nama field stok dari frontend ('stok' atau 'stok_awal')
    const inputStok = data.stok !== undefined ? data.stok : data.stok_awal;

    const newData = {
        id,
        nama_buku: data.nama_buku,
        harga_buku: data.harga_buku,
        jenis_buku: data.jenis_buku,
        stok: inputStok !== undefined ? Number(inputStok) : 0,
        foto_buku: foto ? foto.filename : null,
        pdf_buku: pdf ? pdf.filename : null
    };

    await bukuModel.create(newData);
    return newData;
};

// ========== READ ==========

exports.getAllData = async () => {
    const buku = await bukuModel.getAll();
    return buku;
};

exports.getDataById = async (id) => {
    const buku = await bukuModel.getById(id);

    if (!buku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    return buku;
};

// ========== UPDATE ==========

exports.updateData = async (id, data, files) => {
    const existingBuku = await bukuModel.getByIdRaw(id);
    if (!existingBuku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    const { foto, pdf } = pickFiles(files);

    if (foto && existingBuku.foto_buku) {
        safeUnlink(path.join(UPLOAD_DIR, existingBuku.foto_buku), 'Foto lama');
    }

    if (pdf && existingBuku.pdf_buku) {
        safeUnlink(path.join(PDF_DIR, existingBuku.pdf_buku), 'PDF lama');
    }

    // Antisipasi nama field stok dari frontend ('stok' atau 'stok_awal')
    const inputStok = data.stok !== undefined ? data.stok : data.stok_awal;

    const updateData = {
        nama_buku: data.nama_buku || existingBuku.nama_buku,
        harga_buku: data.harga_buku || existingBuku.harga_buku,
        jenis_buku: data.jenis_buku || existingBuku.jenis_buku,
        stok: inputStok !== undefined ? Number(inputStok) : existingBuku.stok,
        foto_buku: foto ? foto.filename : existingBuku.foto_buku,
        pdf_buku: pdf ? pdf.filename : existingBuku.pdf_buku,
        updated_at: new Date()
    };

    await bukuModel.update(id, updateData);
    return { id, ...updateData };
};

// ========== DELETE ==========

// Soft delete buku
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

// Hapus buku secara permanen (termasuk file fisik foto & PDF)
exports.hardDeleteData = async (id) => {
    // getByIdIncludeDeleted return raw row, jadi foto_buku/pdf_buku masih nama file
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

// ========== PDF KHUSUS ==========

// Upload PDF untuk buku (endpoint terpisah)
exports.uploadPDF = async (id, file) => {
    // Pakai getByIdRaw supaya pdf_buku masih berupa nama file
    const existingBuku = await bukuModel.getByIdRaw(id);
    if (!existingBuku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    if (existingBuku.pdf_buku) {
        safeUnlink(path.join(PDF_DIR, existingBuku.pdf_buku), `PDF lama ${existingBuku.pdf_buku}`);
    }

    const pdf_buku = file.filename;
    await bukuModel.updatePDF(id, pdf_buku);

    // Ambil data terbaru (dengan URL lengkap untuk response)
    const updatedBuku = await bukuModel.getById(id);
    return updatedBuku;
};

// Hapus PDF saja (tanpa hapus buku)
exports.deletePDF = async (id) => {
    // Pakai getByIdRaw supaya pdf_buku masih berupa nama file
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

    safeUnlink(path.join(PDF_DIR, existingBuku.pdf_buku), `PDF ${existingBuku.pdf_buku}`);

    await bukuModel.updatePDF(id, null);
    return true;
};