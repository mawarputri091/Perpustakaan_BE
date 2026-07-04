const db = require('../config/db')

exports.findAll = async () => {
  // ✅ FIX: pakai LEFT JOIN ke siswa (bukan JOIN biasa), karena transaksi offline
  // punya siswa_id = NULL dan tidak boleh hilang dari hasil query.
  const [rows] = await db.query(`
    SELECT p.*, 
      s.nama as nama_siswa, s.nis,
      b.nama_buku, b.jenis_buku
    FROM peminjaman p
    LEFT JOIN siswa s ON p.siswa_id = s.id
    JOIN buku b ON p.buku_id = b.id
    WHERE p.deleted_at IS NULL
    ORDER BY p.created_at DESC
  `)
  return rows
}

exports.findById = async (id) => {
  const [rows] = await db.query(`
    SELECT p.*, 
      s.nama as nama_siswa, s.nis,
      b.nama_buku, b.jenis_buku
    FROM peminjaman p
    LEFT JOIN siswa s ON p.siswa_id = s.id
    JOIN buku b ON p.buku_id = b.id
    WHERE p.id = ? AND p.deleted_at IS NULL
  `, [id])
  return rows[0]
}

exports.findBySiswaId = async (siswa_id) => {
  const [rows] = await db.query(`
    SELECT p.*,
      b.nama_buku, b.jenis_buku
    FROM peminjaman p
    JOIN buku b ON p.buku_id = b.id
    WHERE p.siswa_id = ? AND p.deleted_at IS NULL
    ORDER BY p.created_at DESC
  `, [siswa_id])
  return rows
}

exports.findByStatus = async (status) => {
  const [rows] = await db.query(`
    SELECT p.*, 
      s.nama as nama_siswa, s.nis,
      b.nama_buku, b.jenis_buku
    FROM peminjaman p
    LEFT JOIN siswa s ON p.siswa_id = s.id
    JOIN buku b ON p.buku_id = b.id
    WHERE p.status = ? AND p.deleted_at IS NULL
    ORDER BY p.created_at DESC
  `, [status])
  return rows
}

// Dipakai HANYA untuk jalur online (siswa request via akun mereka)
exports.findAktifBySiswaAndBuku = async (siswa_id, buku_id) => {
  const [rows] = await db.query(`
    SELECT * FROM peminjaman
    WHERE siswa_id = ? AND buku_id = ? AND status IN ('menunggu', 'dipinjam') AND deleted_at IS NULL
  `, [siswa_id, buku_id])
  return rows[0]
}

// Dipakai untuk pengajuan peminjaman ONLINE (siswa request, status awal = menunggu)
exports.create = async (data) => {
  await db.query(`
    INSERT INTO peminjaman (id, siswa_id, buku_id, tanggal_pinjam, tanggal_kembali, status, jenis_peminjaman, denda, jumlah_perpanjangan, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'online', 0, 0, NOW(), NOW())
  `, [data.id, data.siswa_id, data.buku_id, data.tanggal_pinjam, data.tanggal_kembali, data.status])
}

// ✅ BARU: dipakai khusus untuk transaksi OFFLINE.
// siswa_id selalu NULL, nama pengunjung disimpan di nama_peminjam_offline.
exports.createOffline = async (data) => {
  await db.query(`
    INSERT INTO peminjaman (id, siswa_id, buku_id, nama_peminjam_offline, tanggal_pinjam, tanggal_kembali, status, jenis_peminjaman, denda, jumlah_perpanjangan, created_at, updated_at)
    VALUES (?, NULL, ?, ?, ?, ?, 'dipinjam', 'offline', 0, 0, NOW(), NOW())
  `, [data.id, data.buku_id, data.nama_peminjam, data.tanggal_pinjam, data.tanggal_kembali])
}

exports.update = async (id, data) => {
  await db.query(`
    UPDATE peminjaman SET tanggal_dikembalikan = ?, status = ?, denda = ?, updated_at = NOW()
    WHERE id = ?
  `, [data.tanggal_dikembalikan, data.status, data.denda, id])
}

exports.updateStatus = async (id, status) => {
  await db.query(`
    UPDATE peminjaman SET status = ?, updated_at = NOW() WHERE id = ?
  `, [status, id])
}

exports.approve = async (id, tanggal_pinjam, tanggal_kembali) => {
  await db.query(`
    UPDATE peminjaman 
    SET status = 'dipinjam', tanggal_pinjam = ?, tanggal_kembali = ?, updated_at = NOW()
    WHERE id = ?
  `, [tanggal_pinjam, tanggal_kembali, id])
}

exports.perpanjang = async (id, tanggal_kembali_baru) => {
  await db.query(`
    UPDATE peminjaman 
    SET tanggal_kembali = ?, jumlah_perpanjangan = jumlah_perpanjangan + 1, updated_at = NOW()
    WHERE id = ?
  `, [tanggal_kembali_baru, id])
}

exports.softDelete = async (id) => {
  await db.query(`
    UPDATE peminjaman SET deleted_at = NOW() WHERE id = ?
  `, [id])
}