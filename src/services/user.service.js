const AppError = require('../errors/AppError')
const userModel = require('../models/user.model')

exports.getAllUsers = async () => {
  return await userModel.findAll()
}

exports.getUserById = async (id) => {
  const user = await userModel.findById(id)

  if (!user) {
    throw new AppError('USER_NOT_FOUND', 404)
  }

  return user
}

exports.deleteUser = async (id) => {
  const user = await userModel.findById(id)

  if (!user) {
    throw new AppError('USER_NOT_FOUND', 404)
  }

  await userModel.deleteById(id)
}

// HARD DELETE (permanen) - Menghapus data secara fisik dari database
exports.hardDelete = async (id) => {
  // Cek apakah data ada (termasuk yang sudah soft delete)
  // Kita perlu query langsung ke model atau buat method baru untuk cek semua data
  const user = await userModel.findByIdIncludingDeleted(id)

  if (!user) {
    throw new AppError('USER_NOT_FOUND', 404)
  }

  await userModel.hardDelete(id)
}

// TAMBAHKAN METHOD INI - Alias untuk hardDelete
// Supaya bisa dipanggil dengan nama hardDeleteUser dari controller
exports.hardDeleteUser = async (id) => {
  return await exports.hardDelete(id)
}