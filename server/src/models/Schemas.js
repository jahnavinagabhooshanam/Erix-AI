import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  firebaseUid: { type: String, required: true, unique: true },
  company: { type: String },
  password: { type: String }, // Hashed password (optional for Google Auth)
  photoURL: { type: String }, // User profile image
  provider: { type: String, default: 'email' }, // 'email' or 'google'
  createdAt: { type: Date, default: Date.now }
});

const IncidentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  endpoint: { type: String, required: true },
  severity: { type: String, enum: ['critical', 'medium', 'low'], required: true },
  timestamp: { type: String, required: true },
  type: { type: String, required: true },
  service: { type: String, required: true },
  impact: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
  rootCause: { type: String },
  confidence: { type: Number },
  probableCauses: [{ type: String }],
  recommendedFixes: [{
    title: { type: String },
    desc: { type: String }
  }]
});

const LogSchema = new mongoose.Schema({
  type: { type: String, enum: ['error', 'warning', 'info'], required: true },
  service: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: String, required: true },
  cluster: { type: String }
});

const IntegrationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  provider: { type: String, required: true }, // 'github', 'slack', etc.
  status: { type: String, enum: ['connected', 'disconnected'], default: 'disconnected' },
  config: { type: mongoose.Schema.Types.Mixed, default: {} }
});

export const User = mongoose.model('User', UserSchema);
export const Incident = mongoose.model('Incident', IncidentSchema);
export const Log = mongoose.model('Log', LogSchema);
export const Integration = mongoose.model('Integration', IntegrationSchema);
