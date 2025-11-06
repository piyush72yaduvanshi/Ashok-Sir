require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth.routes');
const franchiseRoutes = require('./routes/franchise.routes');
const foodRoutes = require('./routes/food.routes');
const orderRoutes = require('./routes/order.routes');
const billRoutes = require('./routes/bill.routes');
const expenseRoutes = require('./routes/expense.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/franchises', franchiseRoutes);
app.use('/api/v1/foods', foodRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/bills', billRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Health check
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'NCB Billing API v1.0',
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api/v1`);
});
