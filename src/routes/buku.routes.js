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
router.post('/', authMiddleware, authorizeAdmin, upload.single('foto_buku'), bukuController.createBuku);
router.put('/:id', authMiddleware, authorizeAdmin, upload.single('foto_buku'), bukuController.updateBuku);
router.delete('/:id', authMiddleware, authorizeAdmin, bukuController.deleteBuku);

module.exports = router;