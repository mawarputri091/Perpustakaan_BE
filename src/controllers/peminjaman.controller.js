const asyncHandler = require('../utils/asyncHandler')
const peminjamanService = require('../services/peminjaman.service')

exports.getAll = asyncHandler(async (req, res) => {
  const { status } = req.query
  const data = status
    ? await peminjamanService.getByStatus(status)
    : await peminjamanService.getAll()
  res.json({ status: 'success', data })
})

exports.getById = asyncHandler(async (req, res) => {
  const data = await peminjamanService.getById(req.params.id)
  res.json({ status: 'success', data })
})

exports.getBySiswaId = asyncHandler(async (req, res) => {
  const data = await peminjamanService.getBySiswaId(req.params.siswa_id)
  res.json({ status: 'success', data })
})

// Siswa mengajukan peminjaman online → status awal 'menunggu'
exports.pinjam = asyncHandler(async (req, res) => {
  const data = await peminjamanService.pinjam(req.body)
  res.status(201).json({
    status: 'success',
    message: 'Pengajuan peminjaman berhasil dikirim, menunggu persetujuan admin',
    data
  })
})

exports.approve = asyncHandler(async (req, res) => {
  const data = await peminjamanService.approve(req.params.id)
  res.json({
    status: 'success',
    message: 'Peminjaman berhasil disetujui',
    data
  })
})

exports.reject = asyncHandler(async (req, res) => {
  const data = await peminjamanService.reject(req.params.id)
  res.json({
    status: 'success',
    message: 'Peminjaman berhasil ditolak',
    data
  })
})

// ✅ DIUBAH: admin input peminjaman offline — kirim nama_peminjam & buku_id saja,
// TIDAK perlu siswa_id karena pengunjung walk-in tidak punya akun.
exports.pinjamOffline = asyncHandler(async (req, res) => {
  const data = await peminjamanService.pinjamOffline(req.body)
  res.status(201).json({
    status: 'success',
    message: 'Peminjaman offline berhasil dicatat',
    data
  })
})

exports.perpanjang = asyncHandler(async (req, res) => {
  const result = await peminjamanService.perpanjang(req.params.id)
  res.json({
    status: 'success',
    message: 'Peminjaman berhasil diperpanjang 7 hari',
    data: result
  })
})

exports.kembalikan = asyncHandler(async (req, res) => {
  const result = await peminjamanService.kembalikan(req.params.id)
  res.json({
    status: 'success',
    message: result.terlambat
      ? `Buku dikembalikan terlambat ${result.hariTerlambat} hari`
      : 'Buku berhasil dikembalikan tepat waktu',
    denda: result.denda > 0
      ? `Rp ${result.denda.toLocaleString('id-ID')}`
      : 'Tidak ada denda'
  })
})