const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ========== KONFIGURASI STORAGE ==========
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let uploadPath = 'public/uploads';
        
        // Jika file adalah PDF, simpan di subfolder pdfs
        if (file.fieldname === 'pdf_buku') {
            uploadPath = 'public/uploads/pdfs';
        } 
        // Jika file adalah foto, simpan di folder uploads
        else if (file.fieldname === 'foto_buku') {
            uploadPath = 'public/uploads';
        }
        // Default ke public/uploads
        else {
            uploadPath = 'public/uploads';
        }
        
        // Buat folder jika belum ada
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Mengganti nama file agar unik: TanggalHariINI-NamaAsli.jpg
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// ========== FILE FILTER ==========
const fileFilter = (req, file, cb) => {
    // Jika upload PDF
    if (file.fieldname === 'pdf_buku') {
        const allowedTypes = /pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = file.mimetype === 'application/pdf';
        
        if (extname && mimeType) {
            cb(null, true);
        } else {
            cb(new Error('Hanya diperbolehkan mengupload file PDF'));
        }
    }
    // Jika upload foto (default)
    else if (file.fieldname === 'foto_buku') {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);
        
        if (extname && mimeType) {
            cb(null, true);
        } else {
            cb(new Error('Hanya diperbolehkan mengupload file gambar (jpeg, jpg, png)'));
        }
    }
    // Jika field lain (seharusnya tidak terjadi)
    else {
        cb(new Error(`Unexpected field: ${file.fieldname}`));
    }
};

// ========== KONFIGURASI MULTER ==========
const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 50 * 1024 * 1024 // Maksimal 50MB (untuk PDF dan gambar)
    },
    fileFilter: fileFilter
});

module.exports = upload;