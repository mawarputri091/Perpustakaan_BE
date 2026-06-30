const express = require('express')
const router = express.Router()

const { authenticateToken: authMiddleware } = require('../middlewares/auth.middleware')
const authController = require('../controllers/auth.controller')

router.post('/login', authController.login)
router.post('/register', authController.register)
router.post('/forgot-username', authController.forgotUsername)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)

// route TERPROTEKSI
router.post('/logout', authMiddleware, authController.logout)

module.exports = router