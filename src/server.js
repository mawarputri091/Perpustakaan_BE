require('dotenv').config()
const app = require('./app')

const authRoutes = require('./routes/auth.routes')
app.use('/auth', authRoutes)


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log('Server jalan di http://localhost:3000')
})
