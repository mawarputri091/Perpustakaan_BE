const express = require('express')
const router = express.Router()

const { authenticateToken: authMiddleware } = require('../middlewares/auth.middleware')
const authController = require('../controllers/auth.controller')

// POST /membership/upgrade — wajib login, upgrade user yang sedang login jadi premium.
// Catatan: di sini TIDAK ada proses validasi pembayaran sama sekali. Kalau alur
// pembayaran (simulasi atau asli) perlu divalidasi dulu sebelum upgrade,
// kasih tahu saya detail flow pembayarannya supaya saya tambahkan pengecekan
// di service sebelum updateMembership dipanggil.
router.post('/upgrade', authMiddleware, authController.upgradeMembership)

module.exports = router