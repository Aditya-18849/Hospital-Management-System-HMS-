import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicines: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  notes: String,
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Prescription', prescriptionSchema);