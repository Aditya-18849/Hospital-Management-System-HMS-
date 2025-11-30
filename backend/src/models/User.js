import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'PHARMACIST', 'RECEPTIONIST'],
    default: 'HOSPITAL_ADMIN'
  },
  department: String, // FR-5 Attribute
  specialization: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Compound index to ensure emails are unique *globally* or *per tenant*? 
// PDF implies SaaS, so emails usually unique globally to allow login.
export default mongoose.model('User', userSchema);