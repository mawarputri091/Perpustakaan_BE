const express = require('express')
const router = express.Router()

const authMiddleware = require('../middlewares/auth.middleware')
const authController = require('../controllers/auth.controller')
const authService = require('../services/auth.service')

router.post('/login', authController.login)

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    const token = await authService.login(username, password)

    res.json({
      message: "Login berhasil",
      token
    })
  } catch (err) {
    res.status(err.statusCode || 500).json({
      message: err.message
    })
  }
}

// route TERPROTEKSI
router.post('/logout', authMiddleware, authController.logout)


module.exports = router


