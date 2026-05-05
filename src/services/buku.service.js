const bukuModel = require('../models/buku.model');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// CREATE - Membuat data buku baru
exports.createData = async (data, file) => {
    // Mengecek apakah ada data wajib yang kosong
    if (!data.nama_buku || !data.harga_buku || !data.jenis_buku) {
        const error = new Error('INVALID_PAYLOAD');
        error.statusCode = 400;
        throw error;
    }

    // Mencegah supaya buku duplikat
    const existingBuku = await bukuModel.getByName(data.nama_buku);
    if (existingBuku) {
        const error = new Error('Buku duplikat! Nama buku ini sudah ada di database.');
        error.statusCode = 409;
        throw error;
    }

    // Menyimpan ID unik
    const id = crypto.randomUUID();

    // Jika ada file foto, ambil nama filenya
    const foto_buku = file ? file.filename : null;

    const newData = {
        id,
        nama_buku: data.nama_buku,
        harga_buku: data.harga_buku,
        jenis_buku: data.jenis_buku,
        foto_buku: foto_buku
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
exports.updateData = async (id, data, file) => {
    // Cek apakah buku ada
    const existingBuku = await bukuModel.getById(id);
    if (!existingBuku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    // Jika ada file foto baru, hapus foto lama
    if (file && existingBuku.foto_buku) {
        const oldPhotoPath = path.join(__dirname, '../uploads', existingBuku.foto_buku);
        if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
        }
    }

    // Siapkan data untuk update
    const updateData = {
        nama_buku: data.nama_buku || existingBuku.nama_buku,
        harga_buku: data.harga_buku || existingBuku.harga_buku,
        jenis_buku: data.jenis_buku || existingBuku.jenis_buku,
        foto_buku: file ? file.filename : existingBuku.foto_buku,
        updated_at: new Date()
    };

    await bukuModel.update(id, updateData);
    
    return { id, ...updateData };
};

// DELETE - Soft delete buku
exports.deleteData = async (id) => {
    // Cek apakah buku ada
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
    // Cek apakah buku ada (termasuk yang sudah soft delete)
    const existingBuku = await bukuModel.getByIdIncludeDeleted(id);
    
    if (!existingBuku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    // Jika ada foto, hapus file fotonya juga
    if (existingBuku.foto_buku) {
        const photoPath = path.join(__dirname, '../uploads', existingBuku.foto_buku);
        if (fs.existsSync(photoPath)) {
            fs.unlinkSync(photoPath);
            console.log(`Foto ${existingBuku.foto_buku} berhasil dihapus`);
        }
    }

    await bukuModel.hardDelete(id);
    return true;
};