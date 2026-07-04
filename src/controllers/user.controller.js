const asyncHandler = require('../utils/asyncHandler')
const userService = require('../services/user.service')

// GET ALL — daftar semua user (admin)
exports.getAll = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers()
  res.json(users)
})

// GET BY ID
exports.getById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id)
  res.json(user)
})

// UPDATE — edit data user (admin panel)
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { username, name, email, role, no_telp } = req.body

  const updatedUser = await userService.updateUser(id, { username, name, email, role, no_telp })

  res.json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser
  })
})

// SOFT DELETE
exports.delete = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id)
  res.json({ success: true, message: 'User deleted successfully' })
})

// HARD DELETE
exports.hardDelete = asyncHandler(async (req, res) => {
  await userService.hardDeleteUser(req.params.id)
  res.json({ success: true, message: 'User dihapus permanen' })
})