const asyncHandler = require('../utils/asyncHandler')
const authService = require('../services/auth.service')

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body
  const result = await authService.login(username, password)

  res.json({
    message: 'login success',
    token: result.token,
    user: result.user
  })
})

exports.logout = asyncHandler(async (req, res) => {
  res.json({
    message: 'logout success'
  })
})

// ✅ BARU: POST /auth/register
// Catatan: account_type yang dikirim dari body SENGAJA tidak dipakai untuk
// menentukan membership — service akan selalu set 'gratis'. Ini sesuai keputusan
// bisnis: upgrade ke premium hanya lewat /membership/upgrade setelah bayar.
exports.register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body
  const result = await authService.register({ name, username, email, password })

  res.status(201).json({
    success: true,
    message: 'Registrasi berhasil! Akun Anda dimulai sebagai member gratis.',
    token: result.token,
    user: result.user
  })
})

// ✅ BARU: POST /membership/upgrade (butuh login — req.user dari authenticateToken)
exports.upgradeMembership = asyncHandler(async (req, res) => {
  const userId = req.user.id
  const user = await authService.upgradeMembership(userId)

  res.json({
    success: true,
    message: 'Akun berhasil ditingkatkan menjadi Premium!',
    user
  })
})

// ✅ BARU: PUT/POST /auth/change-password (butuh login)
exports.changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { old_password, new_password } = req.body
  await authService.changePassword(userId, old_password, new_password)

  res.json({
    success: true,
    message: 'Password berhasil diubah'
  })
})

// ✅ BARU: POST /auth/forgot-password (tidak perlu login)
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email, new_password } = req.body
  await authService.resetPasswordByEmail(email, new_password)

  res.json({
    success: true,
    message: 'Password berhasil direset'
  })
})