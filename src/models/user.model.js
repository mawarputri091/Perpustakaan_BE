const db = require('../config/db')

exports.findAll = async () => {
    const [rows] = await db.query(
        'SELECT id, username, name, email, no_telp, role FROM users'
    )

    return rows
}

exports.findById = async (id) => {
    const [rows] = await db.query(
        'SELECT id, username, name, email, no_telp, role FROM users WHERE id = ?',
        [id]
    )

    return rows[0]
}

// Catatan: tabel users tidak punya soft delete, method ini sama dengan findById
exports.findByIdIncludingDeleted = async (id) => {
    const [rows] = await db.query(
        'SELECT id, username, name, email, no_telp, role FROM users WHERE id = ?',
        [id]
    )

    return rows[0]
}

// Catatan: tabel users tidak punya soft delete, method ini sama dengan findAll
exports.findAllIncludingDeleted = async () => {
    const [rows] = await db.query(
        'SELECT id, username, name, email, no_telp, role FROM users'
    )

    return rows
}

exports.deleteById = async (id) => {
    await db.query(
        'DELETE FROM users WHERE id = ?',
        [id]
    )
}

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
        'SELECT id, username, name, email, no_telp, password, role FROM users WHERE username = ?',
        [username]
    )

    return rows[0]
}

// Dipakai untuk forgot-username, forgot-password, dan cek duplikat saat register
exports.findByEmail = async (email) => {
    const [rows] = await db.query(
        'SELECT id, username, name, email, no_telp, password, role FROM users WHERE email = ?',
        [email]
    )

    return rows[0]
}

// role di sini menampung SEMUA status: 'admin' | 'gratis' | 'premium'.
// Default 'gratis' kalau tidak dikirim — register selalu mulai dari gratis.
exports.create = async (data) => {
    const { id, username, name, email, no_telp, password, role } = data

    await db.query(
        `INSERT INTO users (id, username, name, email, no_telp, password, role) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, username, name || null, email || null, no_telp || null, password, role || 'gratis']
    )
}

exports.update = async (id, data) => {
    const { username, name, email, no_telp, password, role } = data

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
    if (no_telp !== undefined) {
        updateFields.push('no_telp = ?')
        updateValues.push(no_telp)
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

// Khusus update role saja (dipakai endpoint upgrade membership)
exports.updateRole = async (id, role) => {
    await db.query(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, id]
    )
}

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