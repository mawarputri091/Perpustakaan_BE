const bukuModel = require('../models/buku.model');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Path absolut ke folder upload (sesuai upload.middleware.js)
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');
const PDF_DIR = path.join(__dirname, '../../public/uploads/pdfs');

// Pisahkan files berdasarkan fieldname (karena route pakai upload.fields())
const pickFiles = (files) => {
    console.log('🔍 pickFiles input:', files);
    
    if (!files) {
        console.log('⚠️ files is null or undefined');
        return { foto: null, pdf: null };
    }
    
    // Karena pakai upload.fields(), files berbentuk object: { foto_buku: [file], pdf_buku: [file] }
    const foto = files.foto_buku ? files.foto_buku[0] : null;
    const pdf = files.pdf_buku ? files.pdf_buku[0] : null;
    
    console.log('🔍 pickFiles result:', { 
        foto: foto ? foto.filename : null, 
        pdf: pdf ? pdf.filename : null 
    });
    
    return { foto, pdf };
};

// Hapus file fisik dengan aman (tidak melempar error kalau file tidak ada)
const safeUnlink = (fullPath, label) => {
    try {
        if (fullPath && fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`${label} berhasil dihapus: ${fullPath}`);
        }
    } catch (err) {
        console.error(`Gagal menghapus ${label}:`, err.message);
    }
};

// ========== CREATE ==========

exports.createData = async (data, files) => {
    // ✅ Validasi field wajib
    if (!data.nama_buku || !data.harga_buku || !data.jenis_buku) {
        const error = new Error('Field nama_buku, harga_buku, dan jenis_buku wajib diisi');
        error.statusCode = 400;
        throw error;
    }

    // ✅ Cek duplikat
    const existingBuku = await bukuModel.getByName(data.nama_buku);
    if (existingBuku) {
        const error = new Error('Buku duplikat! Nama buku ini sudah ada di database.');
        error.statusCode = 409;
        throw error;
    }

    const id = crypto.randomUUID();
    
    // ✅ Debug
    console.log('📁 Files received in service:', files);
    
    const { foto, pdf } = pickFiles(files);

    // Antisipasi nama field stok dari frontend ('stok' atau 'stok_awal')
    const inputStok = data.stok !== undefined ? data.stok : data.stok_awal;

    const newData = {
        id,
        nama_buku: data.nama_buku,
        harga_buku: data.harga_buku,
        jenis_buku: data.jenis_buku,
        stok: inputStok !== undefined ? Number(inputStok) : 0,
        foto_buku: foto ? foto.filename : null,
        pdf_buku: pdf ? pdf.filename : null
    };

    console.log('💾 Data to save:', newData);

    await bukuModel.create(newData);
    
    // Ambil data terbaru dengan URL lengkap
    const createdBuku = await bukuModel.getById(id);
    return createdBuku;
};

// ========== READ ==========

exports.getAllData = async () => {
    const buku = await bukuModel.getAll();
    return buku;
};

exports.getDataById = async (id) => {
    const buku = await bukuModel.getById(id);

    if (!buku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    return buku;
};

// ========== UPDATE ==========

exports.updateData = async (id, data, files) => {
    const existingBuku = await bukuModel.getByIdRaw(id);
    if (!existingBuku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    console.log('📁 Files received for update:', files);

    const { foto, pdf } = pickFiles(files);

    if (foto && existingBuku.foto_buku) {
        safeUnlink(path.join(UPLOAD_DIR, existingBuku.foto_buku), 'Foto lama');
    }

    if (pdf && existingBuku.pdf_buku) {
        safeUnlink(path.join(PDF_DIR, existingBuku.pdf_buku), 'PDF lama');
    }

    // Antisipasi nama field stok dari frontend ('stok' atau 'stok_awal')
    const inputStok = data.stok !== undefined ? data.stok : data.stok_awal;

    const updateData = {
        nama_buku: data.nama_buku || existingBuku.nama_buku,
        harga_buku: data.harga_buku || existingBuku.harga_buku,
        jenis_buku: data.jenis_buku || existingBuku.jenis_buku,
        stok: inputStok !== undefined ? Number(inputStok) : existingBuku.stok,
        foto_buku: foto ? foto.filename : existingBuku.foto_buku,
        pdf_buku: pdf ? pdf.filename : existingBuku.pdf_buku,
        updated_at: new Date()
    };

    console.log('💾 Update data:', updateData);

    await bukuModel.update(id, updateData);
    
    // Ambil data terbaru dengan URL lengkap
    const updatedBuku = await bukuModel.getById(id);
    return updatedBuku;
};

// ========== DELETE ==========

// Soft delete buku
exports.deleteData = async (id) => {
    const existingBuku = await bukuModel.getById(id);
    if (!existingBuku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    await bukuModel.delete(id);
    return true;
};

// Hapus buku secara permanen (termasuk file fisik foto & PDF)
exports.hardDeleteData = async (id) => {
    // getByIdIncludeDeleted return raw row, jadi foto_buku/pdf_buku masih nama file
    const existingBuku = await bukuModel.getByIdIncludeDeleted(id);

    if (!existingBuku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    if (existingBuku.foto_buku) {
        safeUnlink(path.join(UPLOAD_DIR, existingBuku.foto_buku), `Foto ${existingBuku.foto_buku}`);
    }

    if (existingBuku.pdf_buku) {
        safeUnlink(path.join(PDF_DIR, existingBuku.pdf_buku), `PDF ${existingBuku.pdf_buku}`);
    }

    await bukuModel.hardDelete(id);
    return true;
};

// ========== PDF KHUSUS ==========

// Upload PDF untuk buku (endpoint terpisah)
exports.uploadPDF = async (id, file) => {
    // Pakai getByIdRaw supaya pdf_buku masih berupa nama file
    const existingBuku = await bukuModel.getByIdRaw(id);
    if (!existingBuku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    console.log('📄 Upload PDF untuk buku:', existingBuku.nama_buku);

    if (existingBuku.pdf_buku) {
        safeUnlink(path.join(PDF_DIR, existingBuku.pdf_buku), `PDF lama ${existingBuku.pdf_buku}`);
    }

    const pdf_buku = file.filename;
    await bukuModel.updatePDF(id, pdf_buku);

    // Ambil data terbaru (dengan URL lengkap untuk response)
    const updatedBuku = await bukuModel.getById(id);
    return updatedBuku;
};

// Hapus PDF saja (tanpa hapus buku)
exports.deletePDF = async (id) => {
    // Pakai getByIdRaw supaya pdf_buku masih berupa nama file
    const existingBuku = await bukuModel.getByIdRaw(id);
    if (!existingBuku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    if (!existingBuku.pdf_buku) {
        const error = new Error('Buku ini tidak memiliki PDF');
        error.statusCode = 404;
        throw error;
    }

    safeUnlink(path.join(PDF_DIR, existingBuku.pdf_buku), `PDF ${existingBuku.pdf_buku}`);

    await bukuModel.updatePDF(id, null);
    
    // Ambil data terbaru
    const updatedBuku = await bukuModel.getById(id);
    return updatedBuku;
};

// ========== FOTO KHUSUS (TAMBAHAN) ==========

// Upload FOTO untuk buku (endpoint terpisah)
exports.uploadFoto = async (id, file) => {
    // Pakai getByIdRaw supaya foto_buku masih berupa nama file
    const existingBuku = await bukuModel.getByIdRaw(id);
    if (!existingBuku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    console.log('📸 Upload foto untuk buku:', existingBuku.nama_buku);
    console.log('📁 File:', file.filename);

    if (existingBuku.foto_buku) {
        safeUnlink(path.join(UPLOAD_DIR, existingBuku.foto_buku), `Foto lama ${existingBuku.foto_buku}`);
    }

    const foto_buku = file.filename;
    await bukuModel.updateFoto(id, foto_buku);

    // Ambil data terbaru (dengan URL lengkap untuk response)
    const updatedBuku = await bukuModel.getById(id);
    return updatedBuku;
};

// Hapus FOTO saja (tanpa hapus buku)
exports.deleteFoto = async (id) => {
    // Pakai getByIdRaw supaya foto_buku masih berupa nama file
    const existingBuku = await bukuModel.getByIdRaw(id);
    if (!existingBuku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    if (!existingBuku.foto_buku) {
        const error = new Error('Buku ini tidak memiliki foto');
        error.statusCode = 404;
        throw error;
    }

    safeUnlink(path.join(UPLOAD_DIR, existingBuku.foto_buku), `Foto ${existingBuku.foto_buku}`);

    await bukuModel.updateFoto(id, null);
    
    // Ambil data terbaru
    const updatedBuku = await bukuModel.getById(id);
    return updatedBuku;
};

// ========== TAMBAHAN: UPDATE FOTO & PDF BERSAMAAN ==========

// Update Foto dan PDF sekaligus
exports.updateFotoPdf = async (id, files) => {
    // Pakai getByIdRaw supaya foto_buku/pdf_buku masih berupa nama file
    const existingBuku = await bukuModel.getByIdRaw(id);
    if (!existingBuku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    console.log('📁 Files received for updateFotoPdf:', files);

    // Ambil file dari req.files (karena pakai upload.fields())
    const foto = files.foto_buku ? files.foto_buku[0] : null;
    const pdf = files.pdf_buku ? files.pdf_buku[0] : null;

    console.log('📸 Foto:', foto ? foto.filename : 'NULL');
    console.log('📄 PDF:', pdf ? pdf.filename : 'NULL');

    // Hapus foto lama jika ada foto baru
    if (foto && existingBuku.foto_buku) {
        safeUnlink(path.join(UPLOAD_DIR, existingBuku.foto_buku), 'Foto lama');
    }

    // Hapus PDF lama jika ada PDF baru
    if (pdf && existingBuku.pdf_buku) {
        safeUnlink(path.join(PDF_DIR, existingBuku.pdf_buku), 'PDF lama');
    }

    // Siapkan data update
    const updateData = {
        foto_buku: foto ? foto.filename : existingBuku.foto_buku,
        pdf_buku: pdf ? pdf.filename : existingBuku.pdf_buku,
        updated_at: new Date()
    };

    console.log('💾 Update foto & pdf data:', updateData);

    // Update hanya foto dan pdf
    await bukuModel.updateFotoPdf(id, updateData.foto_buku, updateData.pdf_buku);
    
    // Ambil data terbaru dengan URL lengkap
    const updatedBuku = await bukuModel.getById(id);
    return updatedBuku;
};

// ========== TAMBAHAN: DELETE FOTO & PDF BERSAMAAN ==========

// Delete Foto dan PDF sekaligus
exports.deleteFotoPdf = async (id) => {
    // Pakai getByIdRaw supaya foto_buku/pdf_buku masih berupa nama file
    const existingBuku = await bukuModel.getByIdRaw(id);
    if (!existingBuku) {
        const error = new Error('Buku tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    console.log('📸 Menghapus foto & PDF untuk buku:', existingBuku.nama_buku);

    // Hapus file foto jika ada
    if (existingBuku.foto_buku) {
        safeUnlink(path.join(UPLOAD_DIR, existingBuku.foto_buku), `Foto ${existingBuku.foto_buku}`);
    }

    // Hapus file PDF jika ada
    if (existingBuku.pdf_buku) {
        safeUnlink(path.join(PDF_DIR, existingBuku.pdf_buku), `PDF ${existingBuku.pdf_buku}`);
    }

    // Update database: set foto_buku = null dan pdf_buku = null
    await bukuModel.updateFotoPdf(id, null, null);
    
    // Ambil data terbaru
    const updatedBuku = await bukuModel.getById(id);
    return updatedBuku;
};