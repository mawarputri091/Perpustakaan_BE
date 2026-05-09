const db = require('../config/db')

exports.findAll = async () => {
  const [rows] = await db.query(`
    SELECT p.*, 
      s.nama as nama_siswa, s.nis,
      b.nama_buku, b.jenis_buku
    FROM peminjaman p
    JOIN siswa s ON p.siswa_id = s.id
    JOIN buku b ON p.buku_id = b.id
    WHERE p.deleted_at IS NULL OR p.deleted_at = '0000-00-00 00:00:00'
  `)
  return rows
}

exports.findById = async (id) => {
  const [rows] = await db.query(`
    SELECT p.*, 
      s.nama as nama_siswa, s.nis,
      b.nama_buku, b.jenis_buku
    FROM peminjaman p
    JOIN siswa s ON p.siswa_id = s.id
    JOIN buku b ON p.buku_id = b.id
    WHERE p.id = ? AND (p.deleted_at IS NULL OR p.deleted_at = '0000-00-00 00:00:00')
  `, [id])
  return rows[0]
}

exports.findBySiswaId = async (siswa_id) => {
  const [rows] = await db.query(`
    SELECT p.*,
      b.nama_buku, b.jenis_buku
    FROM peminjaman p
    JOIN buku b ON p.buku_id = b.id
    WHERE p.siswa_id = ? AND (p.deleted_at IS NULL OR p.deleted_at = '0000-00-00 00:00:00')
    ORDER BY p.created_at DESC
  `, [siswa_id])
  return rows
}

exports.findAktifBySiswaAndBuku = async (siswa_id, buku_id) => {
  const [rows] = await db.query(`
    SELECT * FROM peminjaman
    WHERE siswa_id = ? AND buku_id = ? AND status = 'dipinjam'
    AND (deleted_at IS NULL OR deleted_at = '0000-00-00 00:00:00')
  `, [siswa_id, buku_id])
  return rows[0]
}

exports.create = async (data) => {
  await db.query(`
    INSERT INTO peminjaman (id, siswa_id, buku_id, tanggal_pinjam, tanggal_kembali, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'dipinjam', NOW(), NOW())
  `, [data.id, data.siswa_id, data.buku_id, data.tanggal_pinjam, data.tanggal_kembali])
}

exports.update = async (id, data) => {
  await db.query(`
    UPDATE peminjaman SET tanggal_dikembalikan = ?, status = ?, updated_at = NOW()
    WHERE id = ?
  `, [data.tanggal_dikembalikan, data.status, id])
}

exports.softDelete = async (id) => {
  await db.query(`
    UPDATE peminjaman SET deleted_at = NOW() WHERE id = ?
  `, [id])
}