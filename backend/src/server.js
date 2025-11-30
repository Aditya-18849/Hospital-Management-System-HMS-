import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { protect, authorize } from './middleware/authMiddleware.js';
import Hospital from './models/Hospital.js';
import User from './models/User.js';
import Patient from './models/Patient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();
app.use(cors());
app.use(express.json());

// --- HELPER FUNCTIONS ---
const generateToken = (id, hospitalId, role) => {
  return jwt.sign({ id, hospitalId, role }, process.env.JWT_SECRET, { expiresIn: '12h' });
};

// --- ROUTES ---

// 1. HOSPITAL REGISTRATION (FR-1)
app.post('/api/hospitals/register', async (req, res) => {
  const { name, email, phone, address, licenseNumber, password } = req.body;

  try {
    const hospitalExists = await Hospital.findOne({ email });
    if (hospitalExists) return res.status(400).json({ message: 'Hospital already exists' });

    // Generate Tenant ID and Token
    const tenantId = crypto.randomUUID();
    const activationToken = crypto.randomBytes(20).toString('hex');

    const hospital = await Hospital.create({
      name, email, phone, address, licenseNumber, activationToken, tenantId
    });

    // Create the initial ADMIN User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      hospital: hospital._id,
      firstName: 'Admin',
      lastName: 'User',
      email: email, // Admin email same as hospital email initially
      password: hashedPassword,
      role: 'HOSPITAL_ADMIN'
    });

    // Return link (In production, email this)
    const activationLink = `http://localhost:5173/activate/${activationToken}`;
    res.status(201).json({ message: 'Registered. Please check email to activate.', activationLink });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. ACTIVATION
app.post('/api/hospitals/activate/:token', async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ activationToken: req.params.token });
    if (!hospital) return res.status(400).json({ message: 'Invalid token' });

    hospital.isActive = true;
    hospital.activationToken = undefined;
    await hospital.save();

    res.json({ message: 'Account Activated' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 3. LOGIN (FR-3)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate('hospital');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.hospital.isActive) return res.status(403).json({ message: 'Hospital is not active' });

    if (await bcrypt.compare(password, user.password)) {
      res.json({
        _id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.hospital._id, user.role),
        hospitalName: user.hospital.name
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. PATIENT MANAGEMENT (FR-8, FR-9)
// Protected Route - Accessible by Doctors, Nurses, Admins
app.post('/api/patients', protect, authorize('DOCTOR', 'NURSE', 'HOSPITAL_ADMIN', 'RECEPTIONIST'), async (req, res) => {
  const { name, dob, gender, type, contactNumber } = req.body;
  
  try {
    // Generate Sequential Patient ID: tenantId-P-Sequence
    // Note: In high concurrency, use a counter collection. simpler countDocuments here for hackathon.
    const count = await Patient.countDocuments({ hospital: req.user.hospital });
    const hospital = await Hospital.findById(req.user.hospital);
    
    const patientId = `${hospital.tenantId}-P-${count + 1}`;

    const patient = await Patient.create({
      hospital: req.user.hospital,
      patientId,
      name, dob,QX: gender, type, contactNumber
    });
    
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/patients', protect, async (req, res) => {
  // Tenant Isolation: Only fetch patients for THIS user's hospital
  try {
    const patients = await Patient.find({ hospital: req.user.hospital });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching patients' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));