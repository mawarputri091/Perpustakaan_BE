// src/routes/peminjamanRoutes.js
const express = require('express');
const router = express.Router();
const peminjamanController = require('../controllers/peminjaman.controller');
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth.middleware');

// Semua route memerlukan authentication
router.use(authenticateToken);

// Routes
router.post('/pinjam', peminjamanController.pinjamBuku);
router.put('/kembali/:id', peminjamanController.kembalikanBuku);
router.put('/perpanjang/:id', peminjamanController.perpanjangPeminjaman);

router.get('/', peminjamanController.getAllPeminjaman);
router.get('/statistik', peminjamanController.getStatistics);
router.get('/siswa/:siswaId', peminjamanController.getPeminjamanBySiswa);
router.get('/:id', peminjamanController.getPeminjamanById);

// Admin only
router.delete('/:id', authorizeAdmin, peminjamanController.deletePeminjaman);

module.exports = router;