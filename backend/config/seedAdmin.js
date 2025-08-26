import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import connectDB from './db.js';

// Load env vars
dotenv.config();

// Connect to MongoDB
await connectDB();

const createAdmin = async () => {
  try {
    // First, clear existing admin
    await Admin.deleteMany();

    // Create default admin
    await Admin.create({
      name: 'Admin User',
      email: 'admin@cstech.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('Admin user created successfully');
    process.exit();
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
