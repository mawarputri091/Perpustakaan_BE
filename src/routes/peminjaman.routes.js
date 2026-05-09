const express = require('express')
const router = express.Router()

const peminjamanController = require('../controllers/peminjaman.controller')
const { authenticateToken } = require('../middlewares/auth.middleware')

router.get('/', authenticateToken, peminjamanController.getAll)
router.get('/:id', authenticateToken, peminjamanController.getById)
router.get('/siswa/:siswa_id', authenticateToken, peminjamanController.getBySiswaId)
router.post('/', authenticateToken, peminjamanController.pinjam)
router.put('/:id/perpanjang', authenticateToken, peminjamanController.perpanjang)
router.put('/:id/kembalikan', authenticateToken, peminjamanController.kembalikan)

module.exports = router