const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

require('dotenv').config()
// ...baaki code jaisa hai waisa
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'TaskFlow Pro API is running 🚀' })
})

app.use('/api/auth', require('./routes/auth'))

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
})