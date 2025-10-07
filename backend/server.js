import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';


// Load env variables
dotenv.config();

// Import Routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import adminRoutes from './routes/admin.js';

// Initialize Express app
const app = express();

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads/products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

// CORS configuration
app.use(cors({
 origin: ["https://miniproject-2-a9xx.onrender.com"], // React dev server
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/proauthenticate');
    console.log('✅ MongoDB Connected: localhost');
  } catch (error) {
    console.log('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Starting without database connection...');
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// Existing routes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy 🟢',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'All systems operational! 🚀',
    features: {
      server: 'running',
      database: 'connected',
      api: 'responsive'
    }
  });
});

app.get('/api/blockchain/test', (req, res) => {
  res.json({
    success: true,
    message: 'Blockchain connection test - Development Mode',
    mode: 'mock',
    features: ['authentication', 'product_tracking', 'verification']
  });
});

// Start Server
const startServer = async () => {
  await connectDB();
  
  const PORT = process.env.PORT || 5001;
  
  app.listen(PORT, () => {
    console.log('\n============================================================');
    console.log('🚀 PROAUTHENTICATE BACKEND SERVER STARTED SUCCESSFULLY!');
    console.log('============================================================');
    console.log(`📍 Server Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Not connected'}`);
    console.log(`⛓️  Blockchain: 🔧 Development Mode (Mock)`);
    console.log(`📱 API URL: http://localhost:${PORT}/api`);
    console.log('============================================================');
    console.log('\n📋 Available Endpoints:');
    console.log('   ✅ GET  /api/health           - Server health check');
    console.log('   ✅ GET  /api/test             - Test all features');
    console.log('   ✅ GET  /api/blockchain/test  - Test blockchain connection');
    console.log('   ✅ POST /api/auth/register    - Register user');
    console.log('   ✅ POST /api/auth/login       - Login user');
    console.log('   ✅ GET  /api/auth/profile     - Get user profile');
    console.log('   ✅ POST /api/products         - Create product');
    console.log('   ✅ GET  /api/products         - Get all products');
    console.log('   ✅ GET  /api/products/my-products - Get farmer products');
    console.log('\n🎯 Next Steps:');
    console.log('   1. Test the API endpoints in browser or Postman');
    console.log('   2. Add authentication routes');
    console.log('   3. Add product management routes');
    console.log('   4. Connect frontend to backend');
    console.log('============================================================\n');
  });
};

startServer();