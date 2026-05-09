const asyncHandler = require('../utils/asyncHandler')
const peminjamanService = require('../services/peminjaman.service')

exports.getAll = asyncHandler(async (req, res) => {
  const data = await peminjamanService.getAll()
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

exports.pinjam = asyncHandler(async (req, res) => {
  const data = await peminjamanService.pinjam(req.body)
  res.status(201).json({ status: 'success', message: 'Buku berhasil dipinjam', data })
})

exports.kembalikan = asyncHandler(async (req, res) => {
  const result = await peminjamanService.kembalikan(req.params.id)
  res.json({
    status: 'success',
    message: result.terlambat
      ? 'Buku dikembalikan (terlambat)'
      : 'Buku berhasil dikembalikan tepat waktu'
  })
})