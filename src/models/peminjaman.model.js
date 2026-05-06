// src/models/peminjamanModel.js
const db = require('../config/db');

class PeminjamanModel {
  // Create peminjaman baru
  static async create(data) {
    const [id] = await knex('peminjaman').insert(data);
    return this.findById(id);
  }

  // Find by ID
  static async findById(id) {
    return knex('peminjaman')
      .where('id', id)
      .first();
  }

  // Get all peminjaman with relations
  static async getAll(filters = {}) {
    let query = knex('peminjaman')
      .select(
        'peminjaman.*',
        'siswa.nama as siswa_nama',
        'siswa.nis as siswa_nis',
        'buku.judul as buku_judul',
        'buku.kode_buku as buku_kode'
      )
      .leftJoin('siswa', 'peminjaman.siswa_id', 'siswa.id')
      .leftJoin('buku', 'peminjaman.buku_id', 'buku.id')
      .orderBy('peminjaman.tanggal_pinjam', 'desc');

    // Apply filters
    if (filters.status) {
      query = query.where('peminjaman.status', filters.status);
    }
    if (filters.siswa_id) {
      query = query.where('peminjaman.siswa_id', filters.siswa_id);
    }
    if (filters.buku_id) {
      query = query.where('peminjaman.buku_id', filters.buku_id);
    }

    return query;
  }

  // Get peminjaman by siswa
  static async getBySiswa(siswaId) {
    return knex('peminjaman')
      .select(
        'peminjaman.*',
        'buku.judul as buku_judul',
        'buku.kode_buku as buku_kode',
        'buku.pengarang as buku_pengarang'
      )
      .leftJoin('buku', 'peminjaman.buku_id', 'buku.id')
      .where('peminjaman.siswa_id', siswaId)
      .orderBy('peminjaman.tanggal_pinjam', 'desc');
  }

  // Update peminjaman
  static async update(id, data) {
    await knex('peminjaman')
      .where('id', id)
      .update(data);
    return this.findById(id);
  }

  // Kembalikan buku
  static async returnBook(id, tanggalKembali, denda = 0, keterangan = null) {
    const updateData = {
      tanggal_kembali: tanggalKembali,
      status: 'dikembalikan',
      denda: denda,
      keterangan: keterangan,
      updated_at: knex.fn.now()
    };
    
    await knex('peminjaman')
      .where('id', id)
      .update(updateData);
    
    return this.findById(id);
  }

  // Check if buku available
  static async isBukuAvailable(bukuId, excludePeminjamanId = null) {
    let query = knex('peminjaman')
      .where('buku_id', bukuId)
      .where('status', 'dipinjam');
    
    if (excludePeminjamanId) {
      query = query.whereNot('id', excludePeminjamanId);
    }
    
    const activeLoans = await query;
    return activeLoans.length === 0;
  }

  // Get active loans for a student
  static async getActiveLoansBySiswa(siswaId) {
    return knex('peminjaman')
      .where('siswa_id', siswaId)
      .where('status', 'dipinjam')
      .orderBy('tanggal_jatuh_tempo', 'asc');
  }

  // Check for overdue loans
  static async updateOverdueStatus() {
    const today = new Date().toISOString().split('T')[0];
    
    return knex('peminjaman')
      .where('status', 'dipinjam')
      .where('tanggal_jatuh_tempo', '<', today)
      .update({ status: 'terlambat' });
  }

  // Get overdue loans
  static async getOverdueLoans() {
    const today = new Date().toISOString().split('T')[0];
    
    return knex('peminjaman')
      .select(
        'peminjaman.*',
        'siswa.nama as siswa_nama',
        'siswa.nis as siswa_nis',
        'buku.judul as buku_judul'
      )
      .leftJoin('siswa', 'peminjaman.siswa_id', 'siswa.id')
      .leftJoin('buku', 'peminjaman.buku_id', 'buku.id')
      .where('peminjaman.status', 'dipinjam')
      .where('peminjaman.tanggal_jatuh_tempo', '<', today);
  }

  // Delete peminjaman (soft delete or hard delete - pilih salah satu)
  static async delete(id) {
    return knex('peminjaman')
      .where('id', id)
      .delete();
  }

  // Get statistics
  static async getStatistics() {
    const stats = await knex('peminjaman')
      .select(
        knex.raw('COUNT(*) as total_peminjaman'),
        knex.raw('SUM(CASE WHEN status = "dipinjam" THEN 1 ELSE 0 END) as aktif'),
        knex.raw('SUM(CASE WHEN status = "dikembalikan" THEN 1 ELSE 0 END) as selesai'),
        knex.raw('SUM(CASE WHEN status = "terlambat" THEN 1 ELSE 0 END) as terlambat'),
        knex.raw('COALESCE(SUM(denda), 0) as total_denda')
      )
      .first();
    
    return stats;
  }
}

module.exports = PeminjamanModel;