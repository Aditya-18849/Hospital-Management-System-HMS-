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
import sendEmail from './utils/email.js';

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

    // Build activation link (points to backend activation endpoint)
    const activationLink = `${req.protocol}://${req.get('host')}/api/hospitals/activate/${activationToken}`;

    // Try to send activation email (best-effort)
    try {
      await sendEmail({
        to: email,
        subject: 'Activate your HMS account',
        url: activationLink,
        name: name
      });
    } catch (mailErr) {
      console.error('Activation email error:', mailErr.message || mailErr);
      // Continue — return activationLink for testing
    }

    res.status(201).json({ message: 'Registered. Please check email to activate.', activationLink });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. ACTIVATION
// Accept GET requests so activation links in emails can be opened directly
app.get('/api/hospitals/activate/:token', async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ activationToken: req.params.token });
    if (!hospital) return res.status(400).json({ message: 'Invalid token' });

    hospital.isActive = true;
    hospital.activationToken = undefined;
    await hospital.save();

    // If activation was triggered via browser link, redirect to frontend dashboard/login
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    // Optional: redirect to a friendly confirmation page
    return res.redirect(`${frontendUrl}/login`);
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
// ... existing imports ...
// Ensure you have these imports
import User from './models/User.js'; 
import Patient from './models/Patient.js';
import Appointment from './models/Appointment.js';


// ... existing setup ...

// --- USER MANAGEMENT ROUTES (For Admin) ---

// 8. GET ALL USERS (Doctors, Nurses, etc.)
app.get('/api/users', protect, authorize('HOSPITAL_ADMIN'), async (req, res) => {
  try {
    const users = await User.find({ hospital: req.user.hospital }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// 9. REGISTER NEW USER (Doctor/Nurse)
app.post('/api/users', protect, authorize('HOSPITAL_ADMIN'), async (req, res) => {
  const { firstName, lastName, email, password, role, department, specialization } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      hospital: req.user.hospital,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      department,
      specialization
    });

    res.status(201).json({ message: 'User registered successfully', user: { _id: user._id, name: user.firstName } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- PRESCRIPTION ROUTES ---

// 10. CREATE PRESCRIPTION
app.post('/api/prescriptions', protect, authorize('DOCTOR'), async (req, res) => {
  const { patientId, medicines, notes } = req.body;
  try {
    const prescription = await Prescription.create({
      hospital: req.user.hospital,
      patient: patientId,
      doctor: req.user._id, // Logged in doctor
      medicines,
      notes
    });
    res.status(201).json(prescription);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 11. GET PRESCRIPTIONS (By Patient ID)
app.get('/api/prescriptions/:patientId', protect, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ 
      hospital: req.user.hospital,
      patient: req.params.patientId 
    })
    .populate('doctor', 'firstName lastName')
    .sort({ createdAt: -1 });
    
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching prescriptions' });
  }
});

// 2. ACTIVATION
app.post('/api/hospitals/activate/:token', async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ activationToken: req.params.token });
    if (!hospital) return res.status(400).json({ message: 'Invalid or expired activation token' });

    hospital.isActive = true;
    hospital.activationToken = undefined;
    await hospital.save();

    res.json({ message: 'Account Activated Successfully' });
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

    if (!user.hospital.isActive) return res.status(403).json({ message: 'Hospital account is not active. Please check your email.' });

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

// 4. PATIENT MANAGEMENT
app.post('/api/patients', protect, authorize('DOCTOR', 'NURSE', 'HOSPITAL_ADMIN', 'RECEPTIONIST'), async (req, res) => {
  const { name, dob, gender, type, contactNumber } = req.body;
  try {
    const count = await Patient.countDocuments({ hospital: req.user.hospital });
    const hospital = await Hospital.findById(req.user.hospital);
    const patientId = `${hospital.tenantId}-P-${count + 1}`;

    const patient = await Patient.create({
      hospital: req.user.hospital,
      patientId,
      name, dob, gender, type, contactNumber
    });
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/patients', protect, async (req, res) => {
  try {
    const patients = await Patient.find({ hospital: req.user.hospital });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching patients' });
  }
});

// --- NEW APPOINTMENT ROUTES ---

// 5. GET DOCTORS (For Dropdown)
app.get('/api/doctors', protect, async (req, res) => {
  try {
    // Find users with role 'DOCTOR' in this hospital
    const doctors = await User.find({ 
      hospital: req.user.hospital, 
      role: 'DOCTOR' 
    }).select('firstName lastName department');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});

// 6. CREATE APPOINTMENT
app.post('/api/appointments', protect, async (req, res) => {
  const { patientId, doctorId, date, time, type, notes } = req.body;
  try {
    const appointment = await Appointment.create({
      hospital: req.user.hospital,
      patient: patientId,
      doctor: doctorId,
      date,
      time,
      type,
      notes,
      status: 'Confirmed' // Auto-confirm for now
    });
    
    // Populate details to return to frontend
    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name')
      .populate('doctor', 'firstName lastName');
      
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 7. GET APPOINTMENTS
app.get('/api/appointments', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ hospital: req.user.hospital })
      .populate('patient', 'name')
      .populate('doctor', 'firstName lastName department')
      .sort({ date: 1, time: 1 }); // Sort by nearest date/time
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`HMS backend running on port ${PORT}`));



// --- APPOINTMENT SYSTEM ROUTES ---

// 1. GET ALL DOCTORS (For the assignment dropdown)
app.get('/api/doctors', protect, async (req, res) => {
  try {
    // Fetches only users who are marked as DOCTOR
    const doctors = await User.find({ 
      hospital: req.user.hospital, 
      role: 'DOCTOR' 
    }).select('firstName lastName department'); // Only send necessary info
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});

// 2. CREATE APPOINTMENT (Assigning the doctor)
app.post('/api/appointments', protect, async (req, res) => {
  const { patientId, doctorId, date, time, type, notes } = req.body;
  
  if (!patientId || !doctorId || !date || !time) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    const appointment = await Appointment.create({
      hospital: req.user.hospital,
      patient: patientId,
      doctor: doctorId, // This assigns the doctor
      date,
      time,
      type,
      notes,
      status: 'Confirmed'
    });
    
    // Populate data to return complete object to frontend immediately
    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name')
      .populate('doctor', 'firstName lastName department');
      
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. GET APPOINTMENTS (List View)
app.get('/api/appointments', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ hospital: req.user.hospital })
      .populate('patient', 'name')
      .populate('doctor', 'firstName lastName department')
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});
// ... existing imports ...
// Ensure you have these imports
import User from './models/User.js'; 
import Patient from './models/Patient.js';
import Appointment from './models/Appointment.js';


// ... existing setup ...

// --- USER MANAGEMENT ROUTES (For Admin) ---

// 8. GET ALL USERS (Doctors, Nurses, etc.)
app.get('/api/users', protect, authorize('HOSPITAL_ADMIN'), async (req, res) => {
  try {
    const users = await User.find({ hospital: req.user.hospital }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// 9. REGISTER NEW USER (Doctor/Nurse)
app.post('/api/users', protect, authorize('HOSPITAL_ADMIN'), async (req, res) => {
  const { firstName, lastName, email, password, role, department, specialization } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      hospital: req.user.hospital,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      department,
      specialization
    });

    res.status(201).json({ message: 'User registered successfully', user: { _id: user._id, name: user.firstName } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- PRESCRIPTION ROUTES ---

// 10. CREATE PRESCRIPTION
app.post('/api/prescriptions', protect, authorize('DOCTOR'), async (req, res) => {
  const { patientId, medicines, notes } = req.body;
  try {
    const prescription = await Prescription.create({
      hospital: req.user.hospital,
      patient: patientId,
      doctor: req.user._id, // Logged in doctor
      medicines,
      notes
    });
    res.status(201).json(prescription);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 11. GET PRESCRIPTIONS (By Patient ID)
app.get('/api/prescriptions/:patientId', protect, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ 
      hospital: req.user.hospital,
      patient: req.params.patientId 
    })
    .populate('doctor', 'firstName lastName')
    .sort({ createdAt: -1 });
    
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching prescriptions' });
  }
});

// 2. ACTIVATION
app.post('/api/hospitals/activate/:token', async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ activationToken: req.params.token });
    if (!hospital) return res.status(400).json({ message: 'Invalid or expired activation token' });

    hospital.isActive = true;
    hospital.activationToken = undefined;
    await hospital.save();

    res.json({ message: 'Account Activated Successfully' });
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

    if (!user.hospital.isActive) return res.status(403).json({ message: 'Hospital account is not active. Please check your email.' });

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

// 4. PATIENT MANAGEMENT
app.post('/api/patients', protect, authorize('DOCTOR', 'NURSE', 'HOSPITAL_ADMIN', 'RECEPTIONIST'), async (req, res) => {
  const { name, dob, gender, type, contactNumber } = req.body;
  try {
    const count = await Patient.countDocuments({ hospital: req.user.hospital });
    const hospital = await Hospital.findById(req.user.hospital);
    const patientId = `${hospital.tenantId}-P-${count + 1}`;

    const patient = await Patient.create({
      hospital: req.user.hospital,
      patientId,
      name, dob, gender, type, contactNumber
    });
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/patients', protect, async (req, res) => {
  try {
    const patients = await Patient.find({ hospital: req.user.hospital });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching patients' });
  }
});

// --- NEW APPOINTMENT ROUTES ---

// 5. GET DOCTORS (For Dropdown)
app.get('/api/doctors', protect, async (req, res) => {
  try {
    // Find users with role 'DOCTOR' in this hospital
    const doctors = await User.find({ 
      hospital: req.user.hospital, 
      role: 'DOCTOR' 
    }).select('firstName lastName department');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});

// 6. CREATE APPOINTMENT
app.post('/api/appointments', protect, async (req, res) => {
  const { patientId, doctorId, date, time, type, notes } = req.body;
  try {
    const appointment = await Appointment.create({
      hospital: req.user.hospital,
      patient: patientId,
      doctor: doctorId,
      date,
      time,
      type,
      notes,
      status: 'Confirmed' // Auto-confirm for now
    });
    
    // Populate details to return to frontend
    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name')
      .populate('doctor', 'firstName lastName');
      
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 7. GET APPOINTMENTS
app.get('/api/appointments', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ hospital: req.user.hospital })
      .populate('patient', 'name')
      .populate('doctor', 'firstName lastName department')
      .sort({ date: 1, time: 1 }); // Sort by nearest date/time
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`HMS backend running on port ${PORT}`));



// --- APPOINTMENT SYSTEM ROUTES ---

// 1. GET ALL DOCTORS (For the assignment dropdown)
app.get('/api/doctors', protect, async (req, res) => {
  try {
    // Fetches only users who are marked as DOCTOR
    const doctors = await User.find({ 
      hospital: req.user.hospital, 
      role: 'DOCTOR' 
    }).select('firstName lastName department'); // Only send necessary info
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});

// 2. CREATE APPOINTMENT (Assigning the doctor)
app.post('/api/appointments', protect, async (req, res) => {
  const { patientId, doctorId, date, time, type, notes } = req.body;
  
  if (!patientId || !doctorId || !date || !time) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    const appointment = await Appointment.create({
      hospital: req.user.hospital,
      patient: patientId,
      doctor: doctorId, // This assigns the doctor
      date,
      time,
      type,
      notes,
      status: 'Confirmed'
    });
    
    // Populate data to return complete object to frontend immediately
    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name')
      .populate('doctor', 'firstName lastName department');
      
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. GET APPOINTMENTS (List View)
app.get('/api/appointments', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ hospital: req.user.hospital })
      .populate('patient', 'name')
      .populate('doctor', 'firstName lastName department')
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});
// ... existing imports ...
// Ensure you have these imports
import User from './models/User.js'; 
import Patient from './models/Patient.js';
import Appointment from './models/Appointment.js';


// ... existing setup ...

// --- USER MANAGEMENT ROUTES (For Admin) ---

// 8. GET ALL USERS (Doctors, Nurses, etc.)
app.get('/api/users', protect, authorize('HOSPITAL_ADMIN'), async (req, res) => {
  try {
    const users = await User.find({ hospital: req.user.hospital }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// 9. REGISTER NEW USER (Doctor/Nurse)
app.post('/api/users', protect, authorize('HOSPITAL_ADMIN'), async (req, res) => {
  const { firstName, lastName, email, password, role, department, specialization } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      hospital: req.user.hospital,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      department,
      specialization
    });

    res.status(201).json({ message: 'User registered successfully', user: { _id: user._id, name: user.firstName } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- PRESCRIPTION ROUTES ---

// 10. CREATE PRESCRIPTION
app.post('/api/prescriptions', protect, authorize('DOCTOR'), async (req, res) => {
  const { patientId, medicines, notes } = req.body;
  try {
    const prescription = await Prescription.create({
      hospital: req.user.hospital,
      patient: patientId,
      doctor: req.user._id, // Logged in doctor
      medicines,
      notes
    });
    res.status(201).json(prescription);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 11. GET PRESCRIPTIONS (By Patient ID)
app.get('/api/prescriptions/:patientId', protect, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ 
      hospital: req.user.hospital,
      patient: req.params.patientId 
    })
    .populate('doctor', 'firstName lastName')
    .sort({ createdAt: -1 });
    
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching prescriptions' });
  }
});

// 2. ACTIVATION
app.post('/api/hospitals/activate/:token', async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ activationToken: req.params.token });
    if (!hospital) return res.status(400).json({ message: 'Invalid or expired activation token' });

    hospital.isActive = true;
    hospital.activationToken = undefined;
    await hospital.save();

    res.json({ message: 'Account Activated Successfully' });
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

    if (!user.hospital.isActive) return res.status(403).json({ message: 'Hospital account is not active. Please check your email.' });

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

// 4. PATIENT MANAGEMENT
app.post('/api/patients', protect, authorize('DOCTOR', 'NURSE', 'HOSPITAL_ADMIN', 'RECEPTIONIST'), async (req, res) => {
  const { name, dob, gender, type, contactNumber } = req.body;
  try {
    const count = await Patient.countDocuments({ hospital: req.user.hospital });
    const hospital = await Hospital.findById(req.user.hospital);
    const patientId = `${hospital.tenantId}-P-${count + 1}`;

    const patient = await Patient.create({
      hospital: req.user.hospital,
      patientId,
      name, dob, gender, type, contactNumber
    });
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/patients', protect, async (req, res) => {
  try {
    const patients = await Patient.find({ hospital: req.user.hospital });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching patients' });
  }
});

// --- NEW APPOINTMENT ROUTES ---

// 5. GET DOCTORS (For Dropdown)
app.get('/api/doctors', protect, async (req, res) => {
  try {
    // Find users with role 'DOCTOR' in this hospital
    const doctors = await User.find({ 
      hospital: req.user.hospital, 
      role: 'DOCTOR' 
    }).select('firstName lastName department');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});

// 6. CREATE APPOINTMENT
app.post('/api/appointments', protect, async (req, res) => {
  const { patientId, doctorId, date, time, type, notes } = req.body;
  try {
    const appointment = await Appointment.create({
      hospital: req.user.hospital,
      patient: patientId,
      doctor: doctorId,
      date,
      time,
      type,
      notes,
      status: 'Confirmed' // Auto-confirm for now
    });
    
    // Populate details to return to frontend
    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name')
      .populate('doctor', 'firstName lastName');
      
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 7. GET APPOINTMENTS
app.get('/api/appointments', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ hospital: req.user.hospital })
      .populate('patient', 'name')
      .populate('doctor', 'firstName lastName department')
      .sort({ date: 1, time: 1 }); // Sort by nearest date/time
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`HMS backend running on port ${PORT}`));



// --- APPOINTMENT SYSTEM ROUTES ---

// 1. GET ALL DOCTORS (For the assignment dropdown)
app.get('/api/doctors', protect, async (req, res) => {
  try {
    // Fetches only users who are marked as DOCTOR
    const doctors = await User.find({ 
      hospital: req.user.hospital, 
      role: 'DOCTOR' 
    }).select('firstName lastName department'); // Only send necessary info
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});

// 2. CREATE APPOINTMENT (Assigning the doctor)
app.post('/api/appointments', protect, async (req, res) => {
  const { patientId, doctorId, date, time, type, notes } = req.body;
  
  if (!patientId || !doctorId || !date || !time) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    const appointment = await Appointment.create({
      hospital: req.user.hospital,
      patient: patientId,
      doctor: doctorId, // This assigns the doctor
      date,
      time,
      type,
      notes,
      status: 'Confirmed'
    });
    
    // Populate data to return complete object to frontend immediately
    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name')
      .populate('doctor', 'firstName lastName department');
      
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. GET APPOINTMENTS (List View)
app.get('/api/appointments', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ hospital: req.user.hospital })
      .populate('patient', 'name')
      .populate('doctor', 'firstName lastName department')
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});
