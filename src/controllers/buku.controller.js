const bukuService = require('../services/buku.service');
const fs = require('fs');
const path = require('path');

// CREATE - Menambah buku baru
exports.createBuku = async (req, res) => {
    try {
        // ✅ Debug log
        console.log('========== CREATE BUKU ==========');
        console.log('📝 req.body:', req.body);
        console.log('📁 req.files:', req.files);
        console.log('================================');
        
        const buku = await bukuService.createData(req.body, req.files);

        res.status(201).json({
            status: 'success',
            message: 'Buku berhasil ditambah',
            data: buku
        });
    } catch (error) {
        console.error('❌ Error createBuku:', error);
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Terjadi kesalahan pada server'
        });
    }
};

// GET ALL - Mendapatkan semua buku
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

// GET BY ID - Mendapatkan buku berdasarkan id
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

// UPDATE - Mengupdate buku
exports.updateBuku = async (req, res) => {
    try {
        const { id } = req.params;
        
        // ✅ Debug log
        console.log('========== UPDATE BUKU ==========');
        console.log('📝 req.body:', req.body);
        console.log('📁 req.files:', req.files);
        console.log('================================');
        
        const buku = await bukuService.updateData(id, req.body, req.files);
        
        res.status(200).json({
            status: 'success',
            message: 'Buku berhasil diupdate',
            data: buku
        });
    } catch (error) {
        console.error('❌ Error updateBuku:', error);
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Terjadi kesalahan pada server'
        });
    }
};

// DELETE - Menghapus buku (soft delete)
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

// HARD DELETE - Menghapus buku secara permanen
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

// Upload PDF (endpoint khusus)
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
        console.error('❌ Error uploadPDF:', error);
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Terjadi kesalahan pada server'
        });
    }
};

// Hapus PDF
exports.deletePDFBuku = async (req, res) => {
    try {
        const { id } = req.params;
        const buku = await bukuService.deletePDF(id);
        
        res.status(200).json({
            status: 'success',
            message: 'PDF berhasil dihapus dari buku',
            data: buku
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Terjadi kesalahan pada server'
        });
    }
};

// ========== TAMBAHAN: ENDPOINT KHUSUS FOTO ==========

// Upload FOTO (endpoint khusus)
exports.uploadFotoBuku = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('========== UPLOAD FOTO ==========');
        console.log('📝 ID:', id);
        console.log('📁 req.file:', req.file);
        console.log('================================');
        
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'File foto tidak ditemukan. Silakan upload file foto.'
            });
        }

        const buku = await bukuService.uploadFoto(id, req.file);
        
        res.status(200).json({
            status: 'success',
            message: 'Foto berhasil diupload',
            data: buku
        });
    } catch (error) {
        console.error('❌ Error uploadFoto:', error);
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Terjadi kesalahan pada server'
        });
    }
};

// Hapus FOTO
exports.deleteFotoBuku = async (req, res) => {
    try {
        const { id } = req.params;
        const buku = await bukuService.deleteFoto(id);
        
        res.status(200).json({
            status: 'success',
            message: 'Foto berhasil dihapus dari buku',
            data: buku
        });
    } catch (error) {
        console.error('❌ Error deleteFoto:', error);
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Terjadi kesalahan pada server'
        });
    }
};

// ========== TAMBAHAN: UPDATE FOTO & PDF BERSAMAAN ==========

// Update Foto dan PDF sekaligus
exports.updateFotoPdfBuku = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('========== UPDATE FOTO & PDF ==========');
        console.log('📝 ID:', id);
        console.log('📁 req.files:', req.files);
        console.log('================================');
        
        const buku = await bukuService.updateFotoPdf(id, req.files);
        
        res.status(200).json({
            status: 'success',
            message: 'Foto dan PDF berhasil diupdate',
            data: buku
        });
    } catch (error) {
        console.error('❌ Error updateFotoPdf:', error);
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Terjadi kesalahan pada server'
        });
    }
};

// ========== TAMBAHAN: DELETE FOTO & PDF BERSAMAAN ==========

// Delete Foto dan PDF sekaligus
exports.deleteFotoPdfBuku = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('========== DELETE FOTO & PDF ==========');
        console.log('📝 ID:', id);
        console.log('================================');
        
        const buku = await bukuService.deleteFotoPdf(id);
        
        res.status(200).json({
            status: 'success',
            message: 'Foto dan PDF berhasil dihapus dari buku',
            data: buku
        });
    } catch (error) {
        console.error('❌ Error deleteFotoPdf:', error);
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Terjadi kesalahan pada server'
        });
    }
};