const express = require('express');
const router = express.Router();

const bukuController = require('../controllers/buku.controller');
const { authenticateToken: authMiddleware, authorizeAdmin } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// ========== ROUTE YANG BISA DIAKSES SEMUA USER (Gak perlu login) ==========
router.get('/', bukuController.getAllBuku);
router.get('/:id', bukuController.getBukuById);

// ========== ROUTE YANG WAJIB LOGIN + HARUS ADMIN ==========
// Route untuk hard delete (hanya admin)
router.delete('/hard/:id', authMiddleware, authorizeAdmin, bukuController.hardDeleteBuku);
router.delete('/permanent/:id', authMiddleware, authorizeAdmin, bukuController.hardDeleteBuku);

// CREATE, UPDATE, DELETE (hanya admin)
// ✅ Ganti upload.single('foto_buku') menjadi upload.any()
router.post('/', authMiddleware, authorizeAdmin, upload.any(), bukuController.createBuku);
router.put('/:id', authMiddleware, authorizeAdmin, upload.any(), bukuController.updateBuku);
router.delete('/:id', authMiddleware, authorizeAdmin, bukuController.deleteBuku);

// ========== ROUTE BARU UNTUK PDF (hanya admin) ==========
// Upload PDF untuk buku
router.post('/:id/pdf', authMiddleware, authorizeAdmin, upload.single('pdf_buku'), bukuController.uploadPDFBuku);

// Hapus PDF dari buku
router.delete('/:id/pdf', authMiddleware, authorizeAdmin, bukuController.deletePDFBuku);

module.exports = router;