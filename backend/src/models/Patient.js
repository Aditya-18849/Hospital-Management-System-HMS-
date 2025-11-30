import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  patientId: { type: String, required: true }, // Custom ID: tenantId-P-Sequence
  name: { type: String, required: true },
  dob: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  bloodGroup: String,
  contactNumber: String,
  type: { type: String, enum: ['OPD', 'IPD'], required: true }, // FR-8
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  medicalHistory: [String]
}, { timestamps: true });

// Optimization: Ensure queries always hit the hospital index
patientSchema.index({ hospital: 1, patientId: 1 });

export default mongoose.model('Patient', patientSchema);