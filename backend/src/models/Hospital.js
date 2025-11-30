import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  licenseNumber: { type: String, required: true, unique: true }, // FR-1
  address: String,
  phone: String,
  activationToken: String,
  isActive: { type: Boolean, default: false },
  tenantId: { type: String, required: true, unique: true }, // The UUID
}, { timestamps: true });

export default mongoose.model('Hospital', hospitalSchema);