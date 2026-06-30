const express = require('express')
const router = express.Router()

const userController = require('../controllers/user.controller')
const { authenticateToken: authMiddleware } = require('../middlewares/auth.middleware')

router.get('/', authMiddleware, userController.getAll)
router.get('/:id', authMiddleware, userController.getById)
router.put('/:id', authMiddleware, userController.update)
router.delete('/:id', authMiddleware, userController.delete)
router.delete('/:id/hard', authMiddleware, userController.hardDelete)

module.exports = router