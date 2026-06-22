const crypto = require('crypto')
const AppError = require('../errors/AppError')
const peminjamanModel = require('../models/peminjaman.model')
const siswaModel = require('../models/siswa.model')
const bukuModel = require('../models/buku.model')
const db = require('../config/db')

const DURASI_HARI = 7
const DENDA_PER_HARI = 2000

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

// ✅ BARU: dipakai endpoint GET /peminjaman?status=...
exports.getByStatus = async (status) => {
  return await peminjamanModel.findByStatus(status)
}

// ✅ DIUBAH: pinjam (request online dari siswa) sekarang TIDAK langsung aktif.
// Status awal = 'menunggu', stok buku BELUM dikurangi sampai admin approve.
exports.pinjam = async (data) => {
  const { siswa_id, buku_id } = data

  if (!siswa_id || !buku_id) throw new AppError('INVALID_PAYLOAD', 400)

  const siswa = await siswaModel.findById(siswa_id)
  if (!siswa) throw new AppError('SISWA_NOT_FOUND', 404)

  const buku = await bukuModel.getById(buku_id)
  if (!buku) throw new AppError('BUKU_NOT_FOUND', 404)

  if (buku.stok <= 0) throw new AppError('STOK_HABIS', 400)

  // findAktifBySiswaAndBuku sekarang juga mengecek status 'menunggu' (lihat model)
  const aktif = await peminjamanModel.findAktifBySiswaAndBuku(siswa_id, buku_id)
  if (aktif) throw new AppError('SUDAH_MENGAJUKAN_ATAU_MEMINJAM_BUKU_INI', 400)

  // tanggal_pinjam & tanggal_kembali di sini masih bersifat "perkiraan",
  // akan di-set ulang saat admin approve (lihat exports.approve di bawah)
  const tanggal_pinjam = new Date()
  const tanggal_kembali = new Date()
  tanggal_kembali.setDate(tanggal_kembali.getDate() + DURASI_HARI)

  const newData = {
    id: crypto.randomUUID(),
    siswa_id,
    buku_id,
    tanggal_pinjam,
    tanggal_kembali,
    status: 'menunggu' // ✅ status awal = menunggu approval admin, BUKAN langsung 'dipinjam'
  }

  // ✅ Tidak ada transaksi kurangi stok di sini lagi — stok baru dikurangi saat approve
  await peminjamanModel.create(newData)

  return newData
}

// ✅ BARU: admin approve permintaan peminjaman → status jadi 'dipinjam', stok dikurangi
exports.approve = async (id) => {
  const peminjaman = await peminjamanModel.findById(id)
  if (!peminjaman) throw new AppError('PEMINJAMAN_NOT_FOUND', 404)

  if (peminjaman.status !== 'menunggu') {
    throw new AppError('PEMINJAMAN_BUKAN_STATUS_MENUNGGU', 400)
  }

  // Cek ulang stok saat approve (bisa saja stok berubah sejak request diajukan)
  const buku = await bukuModel.getById(peminjaman.buku_id)
  if (!buku) throw new AppError('BUKU_NOT_FOUND', 404)
  if (buku.stok <= 0) throw new AppError('STOK_HABIS', 400)

  // Mulai hitung durasi 7 hari dari saat di-approve, bukan dari saat request diajukan
  const tanggal_pinjam = new Date()
  const tanggal_kembali = new Date()
  tanggal_kembali.setDate(tanggal_kembali.getDate() + DURASI_HARI)

  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    await conn.query(`
      UPDATE peminjaman 
      SET status = 'dipinjam', tanggal_pinjam = ?, tanggal_kembali = ?, updated_at = NOW()
      WHERE id = ?
    `, [tanggal_pinjam, tanggal_kembali, id])
    await conn.query('UPDATE buku SET stok = stok - 1 WHERE id = ?', [peminjaman.buku_id])
    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }

  return {
    id,
    status: 'dipinjam',
    tanggal_pinjam,
    tanggal_kembali
  }
}

// ✅ BARU: admin tolak permintaan peminjaman → status jadi 'ditolak', stok TIDAK berubah
// (karena saat request, stok belum dikurangi sama sekali)
exports.reject = async (id) => {
  const peminjaman = await peminjamanModel.findById(id)
  if (!peminjaman) throw new AppError('PEMINJAMAN_NOT_FOUND', 404)

  if (peminjaman.status !== 'menunggu') {
    throw new AppError('PEMINJAMAN_BUKAN_STATUS_MENUNGGU', 400)
  }

  await peminjamanModel.updateStatus(id, 'ditolak')

  return { id, status: 'ditolak' }
}

// ✅ BARU: petugas/admin input peminjaman OFFLINE (siswa datang langsung ke perpustakaan)
// Langsung berstatus 'dipinjam' tanpa proses approval, karena petugas yang menyaksikan langsung.
exports.pinjamOffline = async (data) => {
  const { siswa_id, buku_id } = data

  if (!siswa_id || !buku_id) throw new AppError('INVALID_PAYLOAD', 400)

  const siswa = await siswaModel.findById(siswa_id)
  if (!siswa) throw new AppError('SISWA_NOT_FOUND', 404)

  const buku = await bukuModel.getById(buku_id)
  if (!buku) throw new AppError('BUKU_NOT_FOUND', 404)

  if (buku.stok <= 0) throw new AppError('STOK_HABIS', 400)

  const aktif = await peminjamanModel.findAktifBySiswaAndBuku(siswa_id, buku_id)
  if (aktif) throw new AppError('SUDAH_MENGAJUKAN_ATAU_MEMINJAM_BUKU_INI', 400)

  const tanggal_pinjam = new Date()
  const tanggal_kembali = new Date()
  tanggal_kembali.setDate(tanggal_kembali.getDate() + DURASI_HARI)

  const newData = {
    id: crypto.randomUUID(),
    siswa_id,
    buku_id,
    tanggal_pinjam,
    tanggal_kembali,
    status: 'dipinjam' // langsung aktif, tanpa lewat status menunggu
  }

  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    await conn.query(`
      INSERT INTO peminjaman (id, siswa_id, buku_id, tanggal_pinjam, tanggal_kembali, status, denda, jumlah_perpanjangan, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'dipinjam', 0, 0, NOW(), NOW())
    `, [newData.id, newData.siswa_id, newData.buku_id, newData.tanggal_pinjam, newData.tanggal_kembali])
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

  if (peminjaman.status === 'dikembalikan' || peminjaman.status === 'terlambat') {
    throw new AppError('BUKU_SUDAH_DIKEMBALIKAN', 400)
  }

  // ✅ Tambahan guard: tidak bisa "kembalikan" kalau statusnya masih menunggu/ditolak
  if (peminjaman.status === 'menunggu' || peminjaman.status === 'ditolak') {
    throw new AppError('PEMINJAMAN_BELUM_AKTIF', 400)
  }

  const tanggal_dikembalikan = new Date()
  const deadline = new Date(peminjaman.tanggal_kembali)
  const terlambat = tanggal_dikembalikan > deadline

  let hariTerlambat = 0
  let denda = 0

  if (terlambat) {
    const selisihMs = tanggal_dikembalikan - deadline
    hariTerlambat = Math.ceil(selisihMs / (1000 * 60 * 60 * 24))
    denda = hariTerlambat * DENDA_PER_HARI
  }

  const status = terlambat ? 'terlambat' : 'dikembalikan'

  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    await conn.query(`
      UPDATE peminjaman 
      SET tanggal_dikembalikan = ?, status = ?, denda = ?, updated_at = NOW()
      WHERE id = ?
    `, [tanggal_dikembalikan, status, denda, id])
    await conn.query('UPDATE buku SET stok = stok + 1 WHERE id = ?', [peminjaman.buku_id])
    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }

  return { terlambat, hariTerlambat, denda }
}

exports.perpanjang = async (id) => {
  const peminjaman = await peminjamanModel.findById(id)
  if (!peminjaman) throw new AppError('PEMINJAMAN_NOT_FOUND', 404)

  if (peminjaman.status !== 'dipinjam') {
    throw new AppError('PEMINJAMAN_TIDAK_AKTIF', 400)
  }

  const sekarang = new Date()
  const deadline = new Date(peminjaman.tanggal_kembali)

  const selisihMs = deadline - sekarang
  const selisihHari = Math.ceil(selisihMs / (1000 * 60 * 60 * 24))

  if (selisihHari > 1) {
    throw new AppError(`BELUM_BISA_PERPANJANG_SISA_${selisihHari}_HARI`, 400)
  }

  if (selisihHari < 0) {
    throw new AppError('SUDAH_TERLAMBAT_TIDAK_BISA_PERPANJANG', 400)
  }

  const tanggal_kembali_baru = new Date(deadline)
  tanggal_kembali_baru.setDate(tanggal_kembali_baru.getDate() + DURASI_HARI)

  await peminjamanModel.perpanjang(id, tanggal_kembali_baru)

  return {
    tanggal_kembali_lama: deadline,
    tanggal_kembali_baru,
    jumlah_perpanjangan: peminjaman.jumlah_perpanjangan + 1
  }
}