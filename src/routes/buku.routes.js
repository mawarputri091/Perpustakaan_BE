const express = require('express');
const router = express.Router();

const bukuController = require('../controllers/buku.controller');
const { authenticateToken: authMiddleware, authorizeAdmin } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// ✅ FIX: Gunakan upload.fields() supaya foto_buku & pdf_buku masuk ke req.files
// dengan key terpisah, bukan upload.any() yang hanya mengisi req.files (array flat)
// tanpa pernah mengisi req.file (yang dipakai controller versi lama).
const uploadFields = upload.fields([
    { name: 'foto_buku', maxCount: 1 },
    { name: 'pdf_buku', maxCount: 1 }
]);

// ========== ROUTE YANG BISA DIAKSES SEMUA USER (Gak perlu login) ==========
router.get('/', bukuController.getAllBuku);
router.get('/:id', bukuController.getBukuById);

// ========== ROUTE YANG WAJIB LOGIN + HARUS ADMIN ==========
// Route untuk hard delete (hanya admin)
router.delete('/hard/:id', authMiddleware, authorizeAdmin, bukuController.hardDeleteBuku);
router.delete('/permanent/:id', authMiddleware, authorizeAdmin, bukuController.hardDeleteBuku);

// CREATE, UPDATE, DELETE (hanya admin)
// ✅ FIX: upload.any() diganti uploadFields supaya foto_buku & pdf_buku terbaca benar
router.post('/', authMiddleware, authorizeAdmin, uploadFields, bukuController.createBuku);
router.put('/:id', authMiddleware, authorizeAdmin, uploadFields, bukuController.updateBuku);
router.delete('/:id', authMiddleware, authorizeAdmin, bukuController.deleteBuku);

// ========== ROUTE BARU UNTUK PDF (hanya admin) ==========
// Upload PDF untuk buku
router.post('/:id/pdf', authMiddleware, authorizeAdmin, upload.single('pdf_buku'), bukuController.uploadPDFBuku);

// Hapus PDF dari buku
router.delete('/:id/pdf', authMiddleware, authorizeAdmin, bukuController.deletePDFBuku);

module.exports = router;