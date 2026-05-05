// src/controllers/peminjamanController.js
const asyncHandler = require('../utils/asyncHandler');
const PeminjamanService = require('../services/peminjaman.service');

// Pinjam buku
exports.pinjamBuku = asyncHandler(async (req, res) => {
  const { siswa_id, buku_id, lama_pinjam = 7 } = req.body;
  
  const peminjaman = await PeminjamanService.pinjamBuku(
    siswa_id,
    buku_id,
    lama_pinjam
  );
  
  res.status(201).json({
    success: true,
    message: 'Buku berhasil dipinjam',
    data: peminjaman
  });
});

// Kembalikan buku
exports.kembalikanBuku = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tanggal_kembali, keterangan } = req.body;
  
  const peminjaman = await PeminjamanService.kembalikanBuku(
    id,
    tanggal_kembali,
    keterangan
  );
  
  res.status(200).json({
    success: true,
    message: 'Buku berhasil dikembalikan',
    data: peminjaman
  });
});

// Get all peminjaman
exports.getAllPeminjaman = asyncHandler(async (req, res) => {
  const { status, siswa_id, buku_id } = req.query;
  
  const filters = {};
  if (status) filters.status = status;
  if (siswa_id) filters.siswa_id = siswa_id;
  if (buku_id) filters.buku_id = buku_id;
  
  const peminjaman = await PeminjamanService.getAllPeminjaman(filters);
  
  res.status(200).json({
    success: true,
    count: peminjaman.length,
    data: peminjaman
  });
});

// Get peminjaman by ID
exports.getPeminjamanById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const peminjaman = await PeminjamanService.getPeminjamanById(id);
  
  res.status(200).json({
    success: true,
    data: peminjaman
  });
});

// Get peminjaman by siswa
exports.getPeminjamanBySiswa = asyncHandler(async (req, res) => {
  const { siswaId } = req.params;
  const peminjaman = await PeminjamanService.getPeminjamanBySiswa(siswaId);
  
  res.status(200).json({
    success: true,
    count: peminjaman.length,
    data: peminjaman
  });
});

// Perpanjang peminjaman
exports.perpanjangPeminjaman = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { hari_tambahan = 7 } = req.body;
  
  const peminjaman = await PeminjamanService.perpanjangPeminjaman(id, hari_tambahan);
  
  res.status(200).json({
    success: true,
    message: `Peminjaman berhasil diperpanjang ${hari_tambahan} hari`,
    data: peminjaman
  });
});

// Get statistics
exports.getStatistics = asyncHandler(async (req, res) => {
  const stats = await PeminjamanService.getStatistics();
  
  res.status(200).json({
    success: true,
    data: stats
  });
});

// Delete peminjaman (admin only)
exports.deletePeminjaman = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await PeminjamanService.deletePeminjaman(id);
  
  res.status(200).json({
    success: true,
    message: 'Data peminjaman berhasil dihapus'
  });
});