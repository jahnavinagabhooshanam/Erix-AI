import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Integration } from './models/Schemas.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/errix';

async function run() {
  console.log('Connecting to:', MONGODB_URI);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    const users = await User.find({});
    console.log('\n--- USERS IN DB ---');
    console.log(users.map(u => ({
      name: u.name,
      email: u.email,
      firebaseUid: u.firebaseUid,
      provider: u.provider
    })));

    const integrations = await Integration.find({});
    console.log('\n--- INTEGRATIONS IN DB ---');
    console.log(integrations);

    await mongoose.disconnect();
    console.log('\nDisconnected.');
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
