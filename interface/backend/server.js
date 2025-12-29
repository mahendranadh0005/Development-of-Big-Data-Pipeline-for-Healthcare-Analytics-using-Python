// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load MONGO_URI from .env

// Import routes
const patientRoutes = require('./routes/patients');
const visitRoutes = require('./routes/visits');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));          // Handles JSON bodies (CSV uploads too)
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/visits', visitRoutes);


// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
