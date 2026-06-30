const nodemailer = require('nodemailer')

// Deteksi apakah konfigurasi SMTP di .env sudah lengkap atau belum
const isSmtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS

let transporter = null

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_PORT == 587 ? false : true, // false jika menggunakan port TLS 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

exports.sendEmail = async (to, subject, text, html) => {
  if (!isSmtpConfigured) {
    // MOCK EMAIL: tulis ke konsol terminal backend kalau SMTP belum dikonfigurasi
    console.log('\n=============================================================')
    console.log(`📧 [MOCK EMAIL SENT TO: ${to}]`)
    console.log(`📌 Subject: ${subject}`)
    console.log(`💬 Isi Pesan:\n${text}`)
    console.log('=============================================================\n')
    return true
  }

  await transporter.sendMail({
    from: `"EduLibrary Support" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html
  })
}