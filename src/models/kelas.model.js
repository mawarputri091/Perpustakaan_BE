const db = require('../config/db')

exports.findAll = async () => {
  const [rows] = await db.query(
    'SELECT kode_kelas, nama_kelas, created_at, updated_at FROM kelas WHERE deleted_at IS NULL OR deleted_at = "0000-00-00 00:00:00"'
  )
  return rows
}

exports.findById = async (kode_kelas) => {
  const [rows] = await db.query(
    'SELECT kode_kelas, nama_kelas FROM kelas WHERE kode_kelas = ? AND (deleted_at IS NULL OR deleted_at = "0000-00-00 00:00:00")',
    [kode_kelas]
  )
  return rows[0]
}

exports.create = async (data) => {
  const { kode_kelas, nama_kelas } = data

  await db.query(
    'INSERT INTO kelas (kode_kelas, nama_kelas) VALUES (?, ?)',
    [kode_kelas, nama_kelas]
  )
}

exports.update = async (kode_kelas_lama, data) => {
  const { kode_kelas, nama_kelas } = data

  await db.query(
    'UPDATE kelas SET kode_kelas = ?, nama_kelas = ?, updated_at = CURRENT_TIMESTAMP WHERE kode_kelas = ?',
    [kode_kelas || '', nama_kelas || '', kode_kelas_lama || '']
  )
}

exports.delete = async (kode_kelas) => {
  await db.query(
    'UPDATE kelas SET deleted_at = CURRENT_TIMESTAMP WHERE kode_kelas = ?',
    [kode_kelas || '']
  )
}

// HARD DELETE (permanen) - Menghapus data secara fisik dari database
exports.hardDelete = async (kode_kelas) => {
  // Optional: Cek apakah data benar-benar ada sebelum hard delete
  const [existing] = await db.query(
    'SELECT kode_kelas FROM kelas WHERE kode_kelas = ?',
    [kode_kelas]
  )
  
  if (existing.length === 0) {
    throw new Error('Kelas tidak ditemukan')
  }
  
  // Hard delete: Hapus permanent dari database
  await db.query(
    'DELETE FROM kelas WHERE kode_kelas = ?',
    [kode_kelas]
  )
}

// Find by ID termasuk yang sudah soft delete
exports.findByIdIncludingDeleted = async (kode_kelas) => {
  const [rows] = await db.query(
    'SELECT kode_kelas, nama_kelas, created_at, updated_at, deleted_at FROM kelas WHERE kode_kelas = ?',
    [kode_kelas]
  )
  return rows[0]
}