const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const AppError = require('../errors/AppError')
const userModel = require('../models/user.model')
const db = require('../config/db')

const SALT_ROUNDS = 10

exports.login = async (username, password) => {
  if (!username || !password) {
    throw new AppError('USERNAME_PASSWORD_REQUIRED', 400)
  }

  const user = await userModel.findByUsername(username)

  if (!user) {
    throw new AppError('INVALID_CREDENTIALS', 401)
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new AppError('INVALID_CREDENTIALS', 401)
  }

  const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
  )

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      no_telp: user.no_telp,
      role: user.role
    }
  }
}

// Register akun baru. role SELALU 'gratis' — tidak menerima account_type dari client
// untuk mencegah orang daftar langsung sebagai premium/admin tanpa proses semestinya.
exports.register = async (data) => {
  const { name, email, username, password, no_telp } = data

  if (!name || !email || !username || !password) {
    throw new AppError('NAME_EMAIL_USERNAME_PASSWORD_REQUIRED', 400)
  }

  const existingUsername = await userModel.findByUsername(username)
  if (existingUsername) {
    throw new AppError('USERNAME_SUDAH_DIGUNAKAN', 400)
  }

  const existingEmail = await userModel.findByEmail(email)
  if (existingEmail) {
    throw new AppError('EMAIL_SUDAH_DIGUNAKAN', 400)
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
  const newId = crypto.randomUUID()

  await userModel.create({
    id: newId,
    username,
    name,
    email,
    no_telp: no_telp || null,
    password: hashedPassword,
    role: 'gratis'
  })

  // Buat profil siswa terkait secara otomatis. Kalau ini gagal, seluruh proses
  // register DIBATALKAN (bukan cuma di-log) — supaya tidak ada akun "yatim"
  // yang punya login tapi tidak punya profil siswa sama sekali.
  try {
    await db.query(
      'INSERT INTO siswa (id, nama) VALUES (?, ?)',
      [newId, name]
    )
  } catch (dbError) {
    // Rollback manual: hapus user yang baru dibuat supaya tidak ada data setengah jadi
    await userModel.hardDelete(newId).catch(() => {})
    throw new AppError('GAGAL_MEMBUAT_PROFIL_SISWA', 500)
  }

  return {
    id: newId,
    username,
    name,
    email,
    role: 'gratis'
  }
}

// Lupa username — kembalikan username berdasarkan email yang terdaftar.
// Catatan: sesuai keputusan, ini versi simple yang langsung mengembalikan
// username di response API (tidak dikirim lewat email).
exports.findUsernameByEmail = async (email) => {
  if (!email) {
    throw new AppError('EMAIL_REQUIRED', 400)
  }

  const user = await userModel.findByEmail(email)
  if (!user) {
    throw new AppError('EMAIL_TIDAK_TERDAFTAR', 404)
  }

  return { username: user.username }
}

// Cek validitas email untuk alur forgot password (langkah 1 sebelum set password baru)
exports.checkEmailForReset = async (email) => {
  if (!email) {
    throw new AppError('EMAIL_REQUIRED', 400)
  }

  const user = await userModel.findByEmail(email)
  if (!user) {
    throw new AppError('EMAIL_TIDAK_TERDAFTAR', 404)
  }

  return true
}

// Set password baru berdasarkan email.
// Catatan: sesuai keputusan, TANPA verifikasi token/OTP — siapapun yang tahu
// email bisa reset password itu. Ini sengaja dibiarkan simple.
exports.resetPasswordByEmail = async (email, newPassword) => {
  if (!email || !newPassword) {
    throw new AppError('EMAIL_PASSWORD_BARU_REQUIRED', 400)
  }

  const user = await userModel.findByEmail(email)
  if (!user) {
    throw new AppError('EMAIL_TIDAK_TERDAFTAR', 404)
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)
  await userModel.update(user.id, { password: hashedPassword })

  return true
}

// Upgrade ke premium. role 'admin' tidak boleh diupgrade/diturunkan lewat jalur ini.
exports.upgradeMembership = async (userId) => {
  const user = await userModel.findById(userId)
  if (!user) throw new AppError('USER_NOT_FOUND', 404)

  if (user.role === 'admin') {
    throw new AppError('AKUN_ADMIN_TIDAK_BISA_UPGRADE', 400)
  }

  if (user.role === 'premium') {
    throw new AppError('SUDAH_PREMIUM', 400)
  }

  await userModel.updateRole(userId, 'premium')

  return {
    id: user.id,
    username: user.username,
    role: 'premium'
  }
}