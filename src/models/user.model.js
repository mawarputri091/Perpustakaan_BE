const db = require('../config/db')

exports.findAll = async () => {
    const [rows] = await db.query(
        'SELECT id, username, role FROM users'
    )

    return rows
}

exports.findById = async (id) => {
    const [rows] = await db.query(
        'SELECT id, username, role FROM users WHERE id = ?',
        [id]
    )

    return rows[0]
}

// METHOD BARU: Find by ID termasuk yang sudah di-soft delete
// Catatan: Karena tabel users tidak punya soft delete, method ini sama dengan findById
exports.findByIdIncludingDeleted = async (id) => {
    const [rows] = await db.query(
        'SELECT id, username, role FROM users WHERE id = ?',
        [id]
    )

    return rows[0]
}

// METHOD BARU: Find all termasuk yang sudah di-soft delete
// Catatan: Karena tabel users tidak punya soft delete, method ini sama dengan findAll
exports.findAllIncludingDeleted = async () => {
    const [rows] = await db.query(
        'SELECT id, username, role FROM users'
    )

    return rows
}

exports.deleteById = async (id) => {
    await db.query(
        'DELETE FROM users WHERE id = ?',
        [id]
    )
}

// METHOD BARU: Soft delete (jika nanti butuh soft delete)
// Catatan: Method ini akan error jika kolom deleted_at tidak ada di tabel users
exports.softDelete = async (id) => {
    // Cek apakah kolom deleted_at ada
    try {
        await db.query(
            'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        )
    } catch (error) {
        throw new Error('Kolom deleted_at tidak ditemukan di tabel users. Gunakan hardDelete untuk menghapus permanen.')
    }
}

// METHOD BARU: Restore soft deleted data (jika butuh)
exports.restore = async (id) => {
    try {
        await db.query(
            'UPDATE users SET deleted_at = NULL WHERE id = ?',
            [id]
        )
    } catch (error) {
        throw new Error('Kolom deleted_at tidak ditemukan di tabel users')
    }
}

exports.findByUsername = async (username) => {
    const [rows] = await db.query(
        'SELECT id, username, password, role FROM users WHERE username = ?',
        [username]
    )

    return rows[0]
}

exports.create = async (data) => {
    const { id, username, password, role } = data

    await db.query(
        'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)',
        [id, username, password, role]
    )
}

// UPDATE method: Update user
exports.update = async (id, data) => {
    const { username, password, role } = data
    
    // Bangun query dinamis berdasarkan field yang diupdate
    let updateFields = []
    let updateValues = []
    
    if (username) {
        updateFields.push('username = ?')
        updateValues.push(username)
    }
    if (password) {
        updateFields.push('password = ?')
        updateValues.push(password)
    }
    if (role) {
        updateFields.push('role = ?')
        updateValues.push(role)
    }
    
    if (updateFields.length === 0) {
        throw new Error('Tidak ada data yang diupdate')
    }
    
    updateValues.push(id)
    
    await db.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
    )
}

// HARD DELETE (permanen) - Menghapus data secara fisik dari database
exports.hardDelete = async (id) => {
    // Optional: Cek apakah data benar-benar ada sebelum hard delete
    const [existing] = await db.query(
        'SELECT id FROM users WHERE id = ?',
        [id || '']
    )
    
    if (existing.length === 0) {
        throw new Error('User tidak ditemukan')
    }
    
    // Hard delete: Hapus permanent dari database
    await db.query(
        'DELETE FROM users WHERE id = ?',
        [id || '']
    )
}