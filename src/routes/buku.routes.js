const express = require('express');
const router = express.Router();

const bukuController = require('../controllers/buku.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
// Route untuk hard delete (biasanya pakai method DELETE juga, tapi beda endpoint)
router.delete('/hard/:id', authMiddleware, bukuController.hardDeleteBuku);
// atau bisa pakai query param
router.delete('/permanent/:id', authMiddleware, bukuController.hardDeleteBuku);

// Gunakan upload.single('foto_produk') untuk menerima 1 file gambar
router.post('/', authMiddleware, upload.single('foto_produk'), bukuController.createBuku);
router.get('/', authMiddleware, bukuController.getAllBuku);
router.get('/:id', authMiddleware, bukuController.getBukuById);
router.put('/:id', authMiddleware, upload.single('foto_produk'), bukuController.updateBuku);
router.delete('/:id', authMiddleware, bukuController.deleteBuku);

module.exports = router;