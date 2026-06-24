require('dotenv').config(); // Loads your .env variables
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// 1. Import Routes (We will build these next)
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const tableRoutes = require('./routes/tableRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const seedRoutes = require('./routes/seedRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { startRetentionCron } = require('./jobs/retentionCron');

// 2. Initialize the Express App
const app = express();

// 3. Connect to the Database
// Make sure you have created config/db.js for this to work!
connectDB();

// 4. Global Middleware
app.use(cors()); // Allows your React frontend to make requests to this backend
app.use(express.json()); // Allows the server to accept JSON data in the req.body

// 5. Mount the Routes
// Every route inside authRoutes will now start with /auth
app.use('/auth', authRoutes);
app.use('/menu', menuRoutes);
app.use('/tables', tableRoutes);
app.use('/transactions', transactionRoutes);
app.use('/seed', seedRoutes);
app.use('/reports', reportRoutes);

// 6. Basic Health Check Route (Good for testing if the server is alive)
app.get('/', (req, res) => {
  res.json({ 
    message: 'Eat & Park POS API is running smoothly! 🍔',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// 7. Database Status Check Route
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    message: 'Server is healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// 8. Global Error Handler (Catches crashes so your server doesn't die completely)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong on the server!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 9. Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}`);
  console.log(`🔐 Frontend should connect to: http://localhost:${PORT}`);
  startRetentionCron();
});