// Medineo ERP Backend - Main Entry Point
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import Routes
const authRoutes = require('./routes/auth.routes');
const vendorRoutes = require('./routes/vendor.routes');
const customerRoutes = require('./routes/customer.routes');
const medicineRoutes = require('./routes/medicine.routes');
const batchRoutes = require('./routes/batch.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const saleRoutes = require('./routes/sale.routes');
const paymentRoutes = require('./routes/payment.routes');
const stockRoutes = require('./routes/stock.routes');
const ledgerRoutes = require('./routes/ledger.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reportRoutes = require('./routes/report.routes');
const inquiryRoutes = require('./routes/inquiry.routes');
const settingsRoutes = require('./routes/settings.routes');

const app = express();
app.set('trust proxy', 1); // Trust Render proxy
const PORT = process.env.PORT || 5001;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Basic allowed origins for functionality
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5001'
    ];

    // Add CORS_ORIGIN from environment if it exists
    if (process.env.CORS_ORIGIN) {
      if (process.env.CORS_ORIGIN.includes(',')) {
        allowedOrigins.push(...process.env.CORS_ORIGIN.split(',').map(o => o.trim()));
      } else {
        allowedOrigins.push(process.env.CORS_ORIGIN.trim());
      }
    }

    // Add FRONTEND_URL from environment (Render default)
    if (process.env.FRONTEND_URL) {
      if (process.env.FRONTEND_URL.includes(',')) {
        allowedOrigins.push(...process.env.FRONTEND_URL.split(',').map(o => o.trim()));
      } else {
        allowedOrigins.push(process.env.FRONTEND_URL.trim());
      }
    }

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});
app.use('/api', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Medineo ERP API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API Routes
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/vendors`, vendorRoutes);
app.use(`${API_PREFIX}/customers`, customerRoutes);
app.use(`${API_PREFIX}/medicines`, medicineRoutes);
app.use(`${API_PREFIX}/batches`, batchRoutes);
app.use(`${API_PREFIX}/purchases`, purchaseRoutes);
app.use(`${API_PREFIX}/sales`, saleRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/stock`, stockRoutes);
app.use(`${API_PREFIX}/ledger`, ledgerRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/reports`, reportRoutes);
app.use(`${API_PREFIX}/inquiries`, inquiryRoutes);
app.use(`${API_PREFIX}/settings`, settingsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error Handler
app.use(errorHandler);

// Start Server FIRST (critical for Render health check)
// Then connect to MongoDB after server is listening
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Medineo ERP Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base: http://localhost:${PORT}${API_PREFIX}`);

  // Connect to MongoDB after server is listening
  try {
    await connectDB();
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    // Don't exit - server is still running, just without DB
    // This allows health checks to pass while troubleshooting
  }
});

module.exports = app;
