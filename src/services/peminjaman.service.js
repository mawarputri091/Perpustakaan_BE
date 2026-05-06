// src/services/peminjamanService.js
const PeminjamanModel = require('../models/peminjaman.model');
const BukuModel = require('../models/buku.model');
const SiswaModel = require('../models/siswa.model');
const { BadRequestError, NotFoundError } = require('../errors/AppError');

class PeminjamanService {
  // Helper untuk format date
  static formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  // Hitung denda
  static hitungDenda(tanggalJatuhTempo, tanggalKembali) {
    if (!tanggalKembali) return 0;
    
    const jatuhTempo = new Date(tanggalJatuhTempo);
    const kembali = new Date(tanggalKembali);
    
    if (kembali <= jatuhTempo) return 0;
    
    const selisihHari = Math.ceil((kembali - jatuhTempo) / (1000 * 60 * 60 * 24));
    // Asumsi denda Rp 1000 per hari, bisa disesuaikan
    return selisihHari * 1000;
  }

  // Pinjam buku
  static async pinjamBuku(siswaId, bukuId, lamaPinjam = 7) {
    // Validasi siswa exist
    const siswa = await SiswaModel.findById(siswaId);
    if (!siswa) {
      throw new NotFoundError('Siswa tidak ditemukan');
    }

    // Validasi buku exist
    const buku = await BukuModel.findById(bukuId);
    if (!buku) {
      throw new NotFoundError('Buku tidak ditemukan');
    }

    // Cek ketersediaan buku
    const isAvailable = await PeminjamanModel.isBukuAvailable(bukuId);
    if (!isAvailable) {
      throw new BadRequestError('Buku sedang dipinjam');
    }

    // Cek stok buku (jika menggunakan stok)
    if (buku.stok && buku.stok <= 0) {
      throw new BadRequestError('Stok buku habis');
    }

    // Cek apakah siswa masih punya pinjaman aktif
    const activeLoans = await PeminjamanModel.getActiveLoansBySiswa(siswaId);
    if (activeLoans.length >= 3) { // Maksimal 3 buku dipinjam
      throw new BadRequestError('Siswa已达到最大 peminjaman (3 buku)');
    }

    // Hitung tanggal jatuh tempo
    const tanggalPinjam = new Date();
    const tanggalJatuhTempo = new Date();
    tanggalJatuhTempo.setDate(tanggalJatuhTempo.getDate() + lamaPinjam);

    const dataPeminjaman = {
      siswa_id: siswaId,
      buku_id: bukuId,
      tanggal_pinjam: this.formatDate(tanggalPinjam),
      tanggal_jatuh_tempo: this.formatDate(tanggalJatuhTempo),
      status: 'dipinjam',
      denda: 0
    };

    const peminjaman = await PeminjamanModel.create(dataPeminjaman);

    // Kurangi stok buku jika menggunakan stok
    if (buku.stok !== undefined) {
      await BukuModel.update(bukuId, { stok: buku.stok - 1 });
    }

    return peminjaman;
  }

  // Kembalikan buku
  static async kembalikanBuku(peminjamanId, tanggalKembali = null, keterangan = null) {
    const peminjaman = await PeminjamanModel.findById(peminjamanId);
    if (!peminjaman) {
      throw new NotFoundError('Data peminjaman tidak ditemukan');
    }

    if (peminjaman.status === 'dikembalikan') {
      throw new BadRequestError('Buku sudah dikembalikan sebelumnya');
    }

    const tglKembali = tanggalKembali ? new Date(tanggalKembali) : new Date();
    const denda = this.hitungDenda(peminjaman.tanggal_jatuh_tempo, tglKembali);

    const updated = await PeminjamanModel.returnBook(
      peminjamanId,
      this.formatDate(tglKembali),
      denda,
      keterangan
    );

    // Tambah stok buku
    const buku = await BukuModel.findById(peminjaman.buku_id);
    if (buku && buku.stok !== undefined) {
      await BukuModel.update(peminjaman.buku_id, { stok: buku.stok + 1 });
    }

    return updated;
  }

  // Get all peminjaman
  static async getAllPeminjaman(filters = {}) {
    const peminjaman = await PeminjamanModel.getAll(filters);
    
    // Update status overdue untuk data yang ditampilkan
    await PeminjamanModel.updateOverdueStatus();
    
    return peminjaman;
  }

  // Get peminjaman by ID
  static async getPeminjamanById(id) {
    const peminjaman = await PeminjamanModel.findById(id);
    if (!peminjaman) {
      throw new NotFoundError('Data peminjaman tidak ditemukan');
    }
    
    // Get detail siswa dan buku
    const [siswa, buku] = await Promise.all([
      SiswaModel.findById(peminjaman.siswa_id),
      BukuModel.findById(peminjaman.buku_id)
    ]);
    
    return {
      ...peminjaman,
      siswa,
      buku
    };
  }

  // Get peminjaman by siswa
  static async getPeminjamanBySiswa(siswaId) {
    const siswa = await SiswaModel.findById(siswaId);
    if (!siswa) {
      throw new NotFoundError('Siswa tidak ditemukan');
    }
    
    return PeminjamanModel.getBySiswa(siswaId);
  }

  // Perpanjang peminjaman
  static async perpanjangPeminjaman(peminjamanId, hariTambahan = 7) {
    const peminjaman = await PeminjamanModel.findById(peminjamanId);
    if (!peminjaman) {
      throw new NotFoundError('Data peminjaman tidak ditemukan');
    }

    if (peminjaman.status !== 'dipinjam') {
      throw new BadRequestError('Hanya peminjaman aktif yang bisa diperpanjang');
    }

    const newJatuhTempo = new Date(peminjaman.tanggal_jatuh_tempo);
    newJatuhTempo.setDate(newJatuhTempo.getDate() + hariTambahan);

    const updated = await PeminjamanModel.update(peminjamanId, {
      tanggal_jatuh_tempo: this.formatDate(newJatuhTempo)
    });

    return updated;
  }

  // Get statistics
  static async getStatistics() {
    const stats = await PeminjamanModel.getStatistics();
    const overdue = await PeminjamanModel.getOverdueLoans();
    
    return {
      ...stats,
      total_terlambat_sekarang: overdue.length
    };
  }

  // Delete peminjaman (admin only)
  static async deletePeminjaman(id) {
    const peminjaman = await PeminjamanModel.findById(id);
    if (!peminjaman) {
      throw new NotFoundError('Data peminjaman tidak ditemukan');
    }
    
    return PeminjamanModel.delete(id);
  }
}

module.exports = PeminjamanService;