const db = require('../config/db')

exports.findAll = async () => {
  const [rows] = await db.query(
    "SELECT id, nama, nis, kode_kelas FROM siswa WHERE deleted_at IS NULL OR deleted_at = '0000-00-00 00:00:00'"
  )
  return rows
}

exports.findById = async (id) => {
  // Pengaman: pastikan id tidak undefined
  const [rows] = await db.query(
    "SELECT * FROM siswa WHERE id = ? AND (deleted_at IS NULL OR deleted_at = '0000-00-00 00:00:00')",
    [id || ''] 
  )
  return rows[0]
}

// METHOD BARU: Find by ID termasuk yang sudah di-soft delete
exports.findByIdIncludingDeleted = async (id) => {
  // Pengaman: pastikan id tidak undefined
  const [rows] = await db.query(
    "SELECT * FROM siswa WHERE id = ?",
    [id || '']
  )
  return rows[0]
}

exports.create = async (data) => {
  const { id, nama, nis, kode_kelas } = data

  const [kelasRows] = await db.query(
    "SELECT kode_kelas FROM kelas WHERE kode_kelas = ? AND (deleted_at IS NULL OR deleted_at = '0000-00-00 00:00:00')",
    [kode_kelas || '']
  )

  if (!kelasRows.length) {
    throw new Error('Kelas tidak ditemukan')
  }

  await db.query(
    'INSERT INTO siswa (id, nama, nis, kode_kelas) VALUES (?, ?, ?, ?)',
    [id || '', nama || '', nis || '', kode_kelas || '']
  )
}

exports.findByKelas = async (kode_kelas) => {
  const [rows] = await db.query(
    "SELECT * FROM siswa WHERE kode_kelas = ? AND (deleted_at IS NULL OR deleted_at = '0000-00-00 00:00:00')",
    [kode_kelas || '']
  )
  return rows
}

// METHOD BARU: Find by Kelas termasuk yang sudah di-soft delete
exports.findByKelasIncludingDeleted = async (kode_kelas) => {
  const [rows] = await db.query(
    "SELECT * FROM siswa WHERE kode_kelas = ?",
    [kode_kelas || '']
  )
  return rows
}

// METHOD BARU: Find all termasuk yang sudah di-soft delete
exports.findAllIncludingDeleted = async () => {
  const [rows] = await db.query(
    "SELECT id, nama, nis, kode_kelas, deleted_at FROM siswa"
  )
  return rows
}

// METHOD BARU: Find only soft deleted data
exports.findOnlyDeleted = async () => {
  const [rows] = await db.query(
    "SELECT id, nama, nis, kode_kelas, deleted_at FROM siswa WHERE deleted_at IS NOT NULL AND deleted_at != '0000-00-00 00:00:00'"
  )
  return rows
}

// METHOD BARU: Restore soft deleted data
exports.restore = async (id) => {
  const [result] = await db.query(
    "UPDATE siswa SET deleted_at = NULL WHERE id = ?",
    [id || '']
  )
  return result.affectedRows > 0
}

exports.update = async (id, data) => {
  const { nama, nis, kode_kelas } = data

  if (kode_kelas) {
    const [kelasRows] = await db.query(
      "SELECT kode_kelas FROM kelas WHERE kode_kelas = ? AND (deleted_at IS NULL OR deleted_at = '0000-00-00 00:00:00')",
      [kode_kelas]
    )
    if (!kelasRows.length) {
      throw new Error('Kelas tidak ditemukan')
    }
  }

  // Pengaman: Loloskan data ke MySQL dengan jaminan tidak ada undefined
  await db.query(
    'UPDATE siswa SET nama = ?, nis = ?, kode_kelas = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [nama || '', nis || '', kode_kelas || '', id || '']
  )
}

exports.delete = async (id) => {
  // Pengaman id tidak undefined
  await db.query(
    'UPDATE siswa SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
    [id || '']
  )
}

// HARD DELETE (permanen) - Menghapus data secara fisik dari database
exports.hardDelete = async (id) => {
  // Optional: Cek apakah data benar-benar ada sebelum hard delete
  const [existing] = await db.query(
    'SELECT id FROM siswa WHERE id = ?',
    [id || '']
  )
  
  if (existing.length === 0) {
    throw new Error('Siswa tidak ditemukan')
  }
  
  // Hard delete: Hapus permanent dari database
  await db.query(
    'DELETE FROM siswa WHERE id = ?',
    [id || '']
  )
}