const asyncHandler = require('../utils/asyncHandler')
const authService = require('../services/auth.service')

// 1. REGISTER
exports.register = asyncHandler(async (req, res) => {
  const { name, email, username, password, no_telp } = req.body
  const user = await authService.register({ name, email, username, password, no_telp })

  res.status(201).json({
    success: true,
    message: 'Registrasi berhasil! Akun Anda dimulai sebagai member gratis.',
    user
  })
})

// 2. LUPA USERNAME
exports.forgotUsername = asyncHandler(async (req, res) => {
  const { email } = req.body
  const result = await authService.findUsernameByEmail(email)

  res.json({
    success: true,
    message: 'Username berhasil ditemukan.',
    username: result.username
  })
})

// 3. LUPA PASSWORD — langkah 1: validasi email ada
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  await authService.checkEmailForReset(email)

  res.json({
    success: true,
    message: 'Email valid! Mengalihkan ke halaman konfigurasi sandi baru...'
  })
})

// 4. RESET PASSWORD — langkah 2: set password baru
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, new_password } = req.body
  await authService.resetPasswordByEmail(email, new_password)

  res.json({
    success: true,
    message: 'Password berhasil diubah! Silakan login kembali dengan sandi baru Anda.'
  })
})

// 5. LOGIN
exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body
  const result = await authService.login(username, password)

  res.json({
    message: 'login success',
    token: result.token,
    user: result.user
  })
})

// 6. LOGOUT
exports.logout = asyncHandler(async (req, res) => {
  res.json({ message: 'logout success' })
})

// 7. UPGRADE MEMBERSHIP
// Catatan: userId WAJIB diambil dari req.user.id (hasil verifikasi token JWT),
// BUKAN dari req.body. Kalau diambil dari body, siapapun yang punya token valid
// bisa upgrade akun ORANG LAIN dengan cara kirim id orang itu di body — ini lubang
// keamanan yang saya tutup di sini.
exports.upgradeMembership = asyncHandler(async (req, res) => {
  const userId = req.user.id
  const user = await authService.upgradeMembership(userId)

  res.json({
    success: true,
    message: 'Selamat! Akun Anda berhasil di-upgrade ke Premium. 🌟',
    user
  })
})