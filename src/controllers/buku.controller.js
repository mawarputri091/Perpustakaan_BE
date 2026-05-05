const bukuService = require('../services/buku.service');

// CREATE - Menambah buku baru
exports.createBuku = async (req, res) => {
    try {
        // req.body akan berisi teks (nama, harga, jenis)
        // req.file akan berisi informasi foto yang berhasil diupload oleh multer
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