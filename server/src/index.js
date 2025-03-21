const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

// Import database connection
const db = require('./config/database');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5050; // Changed to 5050 to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Construction Scheduler API is running');
});

// Start the server
const startServer = async () => {
  try {
    // Try to authenticate with the database
    await db.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync database models
    await db.sync({ alter: true });
    console.log('Database synchronized');
    
    // Start listening on port
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
  }
};

startServer();
