const bukuService = require('../services/buku.service');
const fs = require('fs');
const path = require('path');

// CREATE - Menambah buku baru (TIDAK DIUBAH)
exports.createBuku = async (req, res) => {
    try {
        const buku = await bukuService.createData(req.body, req.file);

        res.status(201).json({
            status: 'success',
            message: 'Buku berhasil ditambah',
            data: buku
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Terjadi kesalahan pada server'
        });
    }
};

// GET ALL - Mendapatkan semua buku (TIDAK DIUBAH)
exports.getAllBuku = async (req, res) => {
    try {
        const buku = await bukuService.getAllData();
        
        res.status(200).json({
            status: 'success',
            message: 'Data buku berhasil diambil',
            total: buku.length,
            data: buku
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Terjadi kesalahan pada server'
        });
    }
};

// GET BY ID - Mendapatkan buku berdasarkan id (TIDAK DIUBAH)
exports.getBukuById = async (req, res) => {
    try {
        const { id } = req.params;
        const buku = await bukuService.getDataById(id);
        
        res.status(200).json({
            status: 'success',
            message: 'Data buku berhasil diambil',
            data: buku
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Terjadi kesalahan pada server'
        });
    }
};

// UPDATE - Mengupdate buku (TIDAK DIUBAH)
exports.updateBuku = async (req, res) => {
    try {
        const { id } = req.params;
        const buku = await bukuService.updateData(id, req.body, req.file);
        
        res.status(200).json({
            status: 'success',
            message: 'Buku berhasil diupdate',
            data: buku
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Terjadi kesalahan pada server'
        });
    }
};

// DELETE - Menghapus buku (soft delete) (TIDAK DIUBAH)
exports.deleteBuku = async (req, res) => {
    try {
        const { id } = req.params;
        await bukuService.deleteData(id);
        
        res.status(200).json({
            status: 'success',
            message: 'Buku berhasil dihapus'
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Terjadi kesalahan pada server'
        });
    }
};

// HARD DELETE - Menghapus buku secara permanen (TIDAK DIUBAH)
exports.hardDeleteBuku = async (req, res) => {
    try {
        const { id } = req.params;
        await bukuService.hardDeleteData(id);
        
        res.status(200).json({
            status: 'success',
            message: 'Buku berhasil dihapus secara permanen dari database'
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Terjadi kesalahan pada server'
        });
    }
};

// ✅ FUNGSI BARU: Upload PDF (TAMBAHAN, TIDAK MENGGANTI YANG ADA)
exports.uploadPDFBuku = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'File PDF tidak ditemukan. Silakan upload file PDF.'
            });
        }

        const buku = await bukuService.uploadPDF(id, req.file);
        
        res.status(200).json({
            status: 'success',
            message: 'PDF berhasil diupload',
            data: buku
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Terjadi kesalahan pada server'
        });
    }
};

// ✅ FUNGSI BARU: Hapus PDF (TAMBAHAN, TIDAK MENGGANTI YANG ADA)
exports.deletePDFBuku = async (req, res) => {
    try {
        const { id } = req.params;
        await bukuService.deletePDF(id);
        
        res.status(200).json({
            status: 'success',
            message: 'PDF berhasil dihapus dari buku'
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Terjadi kesalahan pada server'
        });
    }
};