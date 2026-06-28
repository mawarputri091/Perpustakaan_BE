const express = require('express')
const router = express.Router()

const { authenticateToken: authMiddleware } = require('../middlewares/auth.middleware')
const authController = require('../controllers/auth.controller')

router.post('/login', authController.login)

// ✅ BARU: register akun baru (selalu mulai sebagai gratis)
router.post('/register', authController.register)

// ✅ BARU: lupa password — tidak perlu login (cek lewat email)
router.post('/forgot-password', authController.forgotPassword)

// route TERPROTEKSI
router.post('/logout', authMiddleware, authController.logout)

// ✅ BARU: ganti password — wajib login
router.put('/change-password', authMiddleware, authController.changePassword)

module.exports = router