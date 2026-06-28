const db = require('../config/db')

exports.findAll = async () => {
    const [rows] = await db.query(
        'SELECT id, username, name, email, role, membership FROM users'
    )

    return rows
}

exports.findById = async (id) => {
    const [rows] = await db.query(
        'SELECT id, username, name, email, role, membership FROM users WHERE id = ?',
        [id]
    )

    return rows[0]
}

// METHOD BARU: Find by ID termasuk yang sudah di-soft delete
// Catatan: Karena tabel users tidak punya soft delete, method ini sama dengan findById
exports.findByIdIncludingDeleted = async (id) => {
    const [rows] = await db.query(
        'SELECT id, username, name, email, role, membership FROM users WHERE id = ?',
        [id]
    )

    return rows[0]
}

// METHOD BARU: Find all termasuk yang sudah di-soft delete
// Catatan: Karena tabel users tidak punya soft delete, method ini sama dengan findAll
exports.findAllIncludingDeleted = async () => {
    const [rows] = await db.query(
        'SELECT id, username, name, email, role, membership FROM users'
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
        'SELECT id, username, name, email, password, role, membership FROM users WHERE username = ?',
        [username]
    )

    return rows[0]
}

// ✅ BARU: dipakai untuk fitur "Lupa Akun" / cek duplikat saat register
exports.findByEmail = async (email) => {
    const [rows] = await db.query(
        'SELECT id, username, name, email, password, role, membership FROM users WHERE email = ?',
        [email]
    )

    return rows[0]
}

// ✅ DIUBAH: create sekarang menerima name, email, membership juga.
// membership selalu default 'gratis' kalau tidak dikirim (lihat service untuk enforce ini).
exports.create = async (data) => {
    const { id, username, name, email, password, role, membership } = data

    await db.query(
        `INSERT INTO users (id, username, name, email, password, role, membership) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, username, name || null, email || null, password, role || 'user', membership || 'gratis']
    )
}

// UPDATE method: Update user
exports.update = async (id, data) => {
    const { username, name, email, password, role, membership } = data

    let updateFields = []
    let updateValues = []

    if (username) {
        updateFields.push('username = ?')
        updateValues.push(username)
    }
    if (name) {
        updateFields.push('name = ?')
        updateValues.push(name)
    }
    if (email) {
        updateFields.push('email = ?')
        updateValues.push(email)
    }
    if (password) {
        updateFields.push('password = ?')
        updateValues.push(password)
    }
    if (role) {
        updateFields.push('role = ?')
        updateValues.push(role)
    }
    if (membership) {
        updateFields.push('membership = ?')
        updateValues.push(membership)
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

// ✅ BARU: khusus update membership saja (dipakai endpoint /membership/upgrade)
exports.updateMembership = async (id, membership) => {
    await db.query(
        'UPDATE users SET membership = ? WHERE id = ?',
        [membership, id]
    )
}

// HARD DELETE (permanen) - Menghapus data secara fisik dari database
exports.hardDelete = async (id) => {
    const [existing] = await db.query(
        'SELECT id FROM users WHERE id = ?',
        [id || '']
    )

    if (existing.length === 0) {
        throw new Error('User tidak ditemukan')
    }

    await db.query(
        'DELETE FROM users WHERE id = ?',
        [id || '']
    )
}