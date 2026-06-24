const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Route files
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const issueRoutes = require('./routes/issueRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging (helpful for development/debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Fallback path
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ message: 'An unexpected error occurred on the server.' });
});

module.exports = app;
