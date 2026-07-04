const express = require('express')
const router = express.Router()

const peminjamanController = require('../controllers/peminjaman.controller')
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth.middleware')

// GET semua peminjaman (admin lihat semua, bisa difilter ?status=...)
router.get('/', authenticateToken, peminjamanController.getAll)
router.get('/:id', authenticateToken, peminjamanController.getById)
router.get('/siswa/:siswa_id', authenticateToken, peminjamanController.getBySiswaId)

// Siswa mengajukan peminjaman online → status awal 'menunggu'
router.post('/', authenticateToken, peminjamanController.pinjam)

// ✅ BARU: admin approve / reject pengajuan peminjaman
router.post('/approve/:id', authenticateToken, authorizeAdmin, peminjamanController.approve)
router.put('/:id/reject', authenticateToken, authorizeAdmin, peminjamanController.reject)

// ✅ BARU: admin input peminjaman offline (siswa datang langsung ke perpustakaan)
router.post('/offline', authenticateToken, authorizeAdmin, peminjamanController.pinjamOffline)

// Perpanjang & kembalikan (tidak diubah)
router.put('/:id/perpanjang', authenticateToken, peminjamanController.perpanjang)
router.put('/:id/return', authenticateToken, peminjamanController.kembalikan)
router.put('/:id/kembalikan', authenticateToken, peminjamanController.kembalikan) // alias lama, biar tidak break yang sudah dipakai FE

module.exports = router