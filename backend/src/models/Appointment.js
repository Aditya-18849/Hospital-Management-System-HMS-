import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // ISO Date string YYYY-MM-DD
  time: { type: String, required: true }, // 24h format HH:mm
  type: { 
    type: String, 
    enum: ['Consultation', 'Follow-up', 'Emergency', 'Routine Checkup', 'Surgery'], 
    default: 'Consultation' 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  notes: String
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);