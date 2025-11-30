import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

dotenv.config()

const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_jwt_secret'
const DATA_FILE = process.env.DATA_FILE || './src/data.json'

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

const readData = async () => {
  const raw = await fs.readFile(path.resolve(DATA_FILE), 'utf8')
  return JSON.parse(raw)
}

const writeData = async (data) => {
  await fs.writeFile(path.resolve(DATA_FILE), JSON.stringify(data, null, 2), 'utf8')
}

// Helpers
const findHospitalByEmail = (hospitals, email) => hospitals.find(h => h.email.toLowerCase() === email.toLowerCase())

// POST /api/hospitals/register
app.post('/api/hospitals/register', async (req, res) => {
  const { name, email, phone, address, password } = req.body
  if (!name || !email) return res.status(400).json({ message: 'Name and email are required' })

  const data = await readData()
  const hospitals = data.hospitals || []
  if (findHospitalByEmail(hospitals, email)) return res.status(400).json({ message: 'Hospital with that email already exists' })

  const hashed = password ? await bcrypt.hash(password, 10) : null
  const activationToken = cryptoRandom()
  const id = Date.now().toString()
  const hospital = { id, name, email, phone: phone || '', address: address || '', password: hashed, isActive: false, activationToken, createdAt: new Date().toISOString() }

  hospitals.push(hospital)
  data.hospitals = hospitals
  await writeData(data)

  // In a real app you would email the activation link. For now return it in the response for testing.
  const activationLink = `${req.protocol}://${req.get('host')}/api/hospitals/activate/${activationToken}`
  return res.status(201).json({ message: 'Hospital registered. Use activation link to activate account.', activationLink })
})

// GET /api/hospitals/activate/:token
app.get('/api/hospitals/activate/:token', async (req, res) => {
  const { token } = req.params
  const data = await readData()
  const hospitals = data.hospitals || []
  const idx = hospitals.findIndex(h => h.activationToken === token)
  if (idx === -1) return res.status(400).json({ message: 'Invalid or expired activation token' })
  hospitals[idx].isActive = true
  delete hospitals[idx].activationToken
  await writeData(data)
  return res.json({ message: 'Hospital activated successfully' })
})

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })
  const data = await readData()
  const hospitals = data.hospitals || []
  const hospital = findHospitalByEmail(hospitals, email)
  if (!hospital) return res.status(400).json({ message: 'Invalid credentials' })
  if (!hospital.isActive) return res.status(403).json({ message: 'Hospital account not activated' })
  const ok = hospital.password ? await bcrypt.compare(password, hospital.password) : false
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' })
  const token = jwt.sign({ id: hospital.id, email: hospital.email }, JWT_SECRET, { expiresIn: '8h' })
  return res.json({ token })
})

// Protected example route
app.get('/api/hospitals/me', async (req, res) => {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ message: 'Missing authorization' })
  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid authorization format' })
  const token = parts[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const data = await readData()
    const hospital = (data.hospitals || []).find(h => h.id === payload.id)
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' })
    const { password, ...safe } = hospital
    return res.json(safe)
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
})

app.listen(PORT, () => {
  console.log(`HMS backend listening on http://localhost:${PORT}`)
})

// Simple small helpers
function cryptoRandom() {
  // prefer crypto.randomUUID when available
  try {
    return (globalThis.crypto && globalThis.crypto.randomUUID) ? globalThis.crypto.randomUUID() : require('crypto').randomBytes(16).toString('hex')
  } catch (e) {
    return require('crypto').randomBytes(16).toString('hex')
  }
}
