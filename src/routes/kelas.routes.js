const express = require('express')
const router = express.Router()

const kelasController = require('../controllers/kelas.controller')
const authMiddleware = require('../middlewares/auth.middleware')

// Route untuk kelas (semua terproteksi auth)
router.get('/', authMiddleware, kelasController.getAll)
router.get('/:kode_kelas', authMiddleware, kelasController.getById)
router.post('/', authMiddleware, kelasController.create)
router.put('/:kode_kelas', authMiddleware, kelasController.update)  // Ubah dari :id jadi :kode_kelas
router.delete('/:kode_kelas', authMiddleware, kelasController.delete)  // Soft delete
router.delete('/:kode_kelas/permanen', authMiddleware, kelasController.hardDelete)  // Hard delete (permanen)

module.exports = router