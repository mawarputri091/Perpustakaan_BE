require('dotenv').config()
const app = require('./app')

const PORT = process.env.PORT || 3000

// ✅ Perbaikan: Mengubah dari 'localhost' menjadi '0.0.0.0'
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server jalan di:`)
  console.log(`  - http://localhost:3000`)
  console.log(`  - http://10.134.199.62:3000`)
})
