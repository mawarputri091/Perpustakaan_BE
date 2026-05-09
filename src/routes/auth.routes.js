const express = require('express')
const router = express.Router()

const { authenticateToken: authMiddleware } = require('../middlewares/auth.middleware')
const authController = require('../controllers/auth.controller')
const authService = require('../services/auth.service')

router.post('/login', authController.login)


// route TERPROTEKSI
router.post('/logout', authMiddleware, authController.logout)


module.exports = router


