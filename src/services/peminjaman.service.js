const crypto = require('crypto')
const AppError = require('../errors/AppError')
const peminjamanModel = require('../models/peminjaman.model')
const siswaModel = require('../models/siswa.model')
const bukuModel = require('../models/buku.model')
const db = require('../config/db')

const DURASI_HARI = 7

exports.getAll = async () => {
  return await peminjamanModel.findAll()
}

exports.getById = async (id) => {
  const data = await peminjamanModel.findById(id)
  if (!data) throw new AppError('PEMINJAMAN_NOT_FOUND', 404)
  return data
}

exports.getBySiswaId = async (siswa_id) => {
  return await peminjamanModel.findBySiswaId(siswa_id)
}

exports.pinjam = async (data) => {
  const { siswa_id, buku_id } = data

  if (!siswa_id || !buku_id) throw new AppError('INVALID_PAYLOAD', 400)

  // Cek siswa ada
  const siswa = await siswaModel.findById(siswa_id)
  if (!siswa) throw new AppError('SISWA_NOT_FOUND', 404)

  // Cek buku ada
  const buku = await bukuModel.getById(buku_id)
  if (!buku) throw new AppError('BUKU_NOT_FOUND', 404)

  // Cek stok buku
  if (buku.stok <= 0) throw new AppError('STOK_HABIS', 400)

  // Cek siswa belum pinjam buku yang sama
  const aktif = await peminjamanModel.findAktifBySiswaAndBuku(siswa_id, buku_id)
  if (aktif) throw new AppError('SUDAH_MEMINJAM_BUKU_INI', 400)

  const tanggal_pinjam = new Date()
  const tanggal_kembali = new Date()
  tanggal_kembali.setDate(tanggal_kembali.getDate() + DURASI_HARI)

  const newData = {
    id: crypto.randomUUID(),
    siswa_id,
    buku_id,
    tanggal_pinjam,
    tanggal_kembali,
    status: 'dipinjam'
  }

  // Simpan peminjaman & kurangi stok secara bersamaan
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    await peminjamanModel.create(newData)
    await conn.query('UPDATE buku SET stok = stok - 1 WHERE id = ?', [buku_id])
    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }

  return newData
}

exports.kembalikan = async (id) => {
  const peminjaman = await peminjamanModel.findById(id)
  if (!peminjaman) throw new AppError('PEMINJAMAN_NOT_FOUND', 404)

  if (peminjaman.status === 'dikembalikan') {
    throw new AppError('BUKU_SUDAH_DIKEMBALIKAN', 400)
  }

  const tanggal_dikembalikan = new Date()
  const terlambat = tanggal_dikembalikan > new Date(peminjaman.tanggal_kembali)

  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    await peminjamanModel.update(id, {
      tanggal_dikembalikan,
      status: terlambat ? 'terlambat' : 'dikembalikan'
    })
    await conn.query('UPDATE buku SET stok = stok + 1 WHERE id = ?', [peminjaman.buku_id])
    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }

  return { terlambat }
}