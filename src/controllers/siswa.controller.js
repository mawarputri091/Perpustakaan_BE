const siswaService = require('./../services/siswa.service')

class SiswaController {
  async getAll(req, res, next) {
    try {
      const data = await siswaService.getAllSiswa()
      res.status(200).json({  // ← tambah status 200
        success: true,
        data: data
      })
    } catch (error) {
      res.status(500).json({  // ← ISI ini!
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      })
    }
  }

  async getById(req, res, next) {
    try {
      const data = await siswaService.getSiswaById(req.params.id)
      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Siswa tidak ditemukan'
        })
      }
      res.status(200).json({
        success: true,
        data: data
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }

  async create(req, res, next) {
    try {
      await siswaService.createSiswa(req.body)
      res.status(201).json({  // ← 201 Created
        success: true,
        message: 'Siswa created successfully'
      })
    } catch (error) {
      res.status(400).json({  // ← 400 Bad Request
        success: false,
        message: error.message
      })
    }
  }
}

module.exports = new SiswaController()