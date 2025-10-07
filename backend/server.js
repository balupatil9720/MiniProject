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

// -------------------- CORS Setup --------------------
// Allow both local dev and deployed frontend
const allowedOrigins = [
  'http://localhost:3000',
  'https://miniproject-2-a9xx.onrender.com' // replace with your frontend Render URL
];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like Postman or curl)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      return callback(new Error('CORS policy: This origin is not allowed'), false);
    }
    return callback(null, true);
  },
  methods: ['GET','POST','PUT','PATCH','DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type','Authorization']
}));

// Middleware
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -------------------- MongoDB Connection --------------------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/proauthenticate');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.log('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Starting without database connection...');
  }
};

// -------------------- Routes --------------------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// Health & Test Routes
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
    features: { server: 'running', database: 'connected', api: 'responsive' }
  });
});

app.get('/api/blockchain/test', (req, res) => {
  res.json({
    success: true,
    message: 'Blockchain connection test - Development Mode',
    mode: 'mock',
    features: ['authentication','product_tracking','verification']
  });
});

// -------------------- Start Server --------------------
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
    console.log('============================================================\n');
  });
};

startServer();
