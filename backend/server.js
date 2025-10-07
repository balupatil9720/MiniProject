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
const allowedOrigins = [
  'http://localhost:3000',
  'https://miniproject-2-a9xx.onrender.com' // your deployed frontend
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // allow Postman/curl
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
  }
};

// -------------------- API Routes --------------------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// Health & test routes
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy 🟢', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'All systems operational 🚀' });
});

// -------------------- Serve Frontend (React) --------------------
const frontendPath = path.join(__dirname, 'frontend/build');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// -------------------- Global Error Handler --------------------
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
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
    console.log('============================================================\n');
  });
};

startServer();
