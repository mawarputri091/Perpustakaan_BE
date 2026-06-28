const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const AppError = require('../errors/AppError')
const userModel = require('../models/user.model')

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
      { id: user.id, role: user.role, membership: user.membership },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
  )

  // ✅ DIUBAH: ikut return data user (tanpa password) supaya FE bisa langsung
  // tahu role & membership tanpa perlu fetch /users/:id terpisah.
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      membership: user.membership
    }
  }
}

// ✅ BARU: register akun baru.
// Sesuai keputusan: account_type DIABAIKAN kalau dikirim 'premium' dari client —
// membership SELALU dimulai dari 'gratis'. Upgrade ke premium hanya lewat
// endpoint /membership/upgrade setelah proses pembayaran berhasil.
exports.register = async (data) => {
  const { name, username, email, password } = data

  if (!username || !password) {
    throw new AppError('USERNAME_PASSWORD_REQUIRED', 400)
  }

  const existingUsername = await userModel.findByUsername(username)
  if (existingUsername) {
    throw new AppError('USERNAME_SUDAH_DIGUNAKAN', 409)
  }

  if (email) {
    const existingEmail = await userModel.findByEmail(email)
    if (existingEmail) {
      throw new AppError('EMAIL_SUDAH_DIGUNAKAN', 409)
    }
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  const newUser = {
    id: crypto.randomUUID(),
    username,
    name: name || null,
    email: email || null,
    password: hashedPassword,
    role: 'user',
    membership: 'gratis' // ✅ selalu gratis, account_type dari client diabaikan dengan sengaja
  }

  await userModel.create(newUser)

  const token = jwt.sign(
      { id: newUser.id, role: newUser.role, membership: newUser.membership },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
  )

  return {
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      membership: newUser.membership
    }
  }
}

// ✅ BARU: upgrade membership user yang sedang login, dari 'gratis' ke 'premium'.
// Dipanggil SETELAH proses pembayaran (simulasi/asli) berhasil divalidasi di
// endpoint/flow pembayaran terpisah — fungsi ini sendiri tidak menangani pembayaran.
exports.upgradeMembership = async (userId) => {
  const user = await userModel.findById(userId)
  if (!user) throw new AppError('USER_NOT_FOUND', 404)

  if (user.membership === 'premium') {
    throw new AppError('SUDAH_PREMIUM', 400)
  }

  await userModel.updateMembership(userId, 'premium')

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    membership: 'premium'
  }
}

// ✅ BARU: ganti password (dipakai endpoint ganti password, butuh login)
exports.changePassword = async (userId, oldPassword, newPassword) => {
  if (!oldPassword || !newPassword) {
    throw new AppError('OLD_NEW_PASSWORD_REQUIRED', 400)
  }

  const [rows] = await require('../config/db').query(
    'SELECT id, password FROM users WHERE id = ?',
    [userId]
  )
  const user = rows[0]
  if (!user) throw new AppError('USER_NOT_FOUND', 404)

  const isMatch = await bcrypt.compare(oldPassword, user.password)
  if (!isMatch) throw new AppError('PASSWORD_LAMA_SALAH', 400)

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)
  await userModel.update(userId, { password: hashedPassword })

  return true
}

// ✅ BARU: lupa password — cek email ada, lalu set password baru.
// Catatan: ini versi SEDERHANA tanpa kirim email/token reset (karena belum ada
// service email terpasang). User langsung set password baru asal email cocok.
// Kalau butuh keamanan lebih (token reset via email), kasih tahu saya supaya
// saya buatkan versi dengan token + expiry.
exports.resetPasswordByEmail = async (email, newPassword) => {
  if (!email || !newPassword) {
    throw new AppError('EMAIL_PASSWORD_BARU_REQUIRED', 400)
  }

  const user = await userModel.findByEmail(email)
  if (!user) throw new AppError('EMAIL_TIDAK_DITEMUKAN', 404)

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)
  await userModel.update(user.id, { password: hashedPassword })

  return true
}