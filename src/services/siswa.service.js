const siswaModel = require('../models/siswa.model')
const kelasModel = require('../models/kelas.model') // untuk validasi kelas exist

class SiswaService {
  async getAllSiswa() {
    return await siswaModel.findAll()
  }

  async getSiswaById(id) {
    const siswa = await siswaModel.findById(id)
    if (!siswa) throw new Error('Siswa tidak ditemukan')
    return siswa
  }

  async createSiswa(data) {
    if (!data.nama || !data.kelas) {
      throw new Error('Nama dan kelas wajib diisi')
    }
    
    if (data.kode_kelas) {
      const kelas = await kelasModel.findById(data.kode_kelas)
      if (!kelas) {
        throw new Error('Kelas tidak ditemukan')
      }
    }
    
    return await siswaModel.create(data)
  }
  
  async getSiswaByKelas(kodeKelas) {
    // validasi kelas exist dulu
    const kelas = await kelasModel.findById(kodeKelas)
    if (!kelas) {
      throw new Error('Kelas tidak ditemukan')
    }
    return await siswaModel.findByKelas(kodeKelas)
  }
}

module.exports = new SiswaService()