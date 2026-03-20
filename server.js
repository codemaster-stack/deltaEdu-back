'use strict';

console.log('Server starting...');

const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const dotenv   = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware
// Middleware
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/v1/auth',       require('./routes/auth'));
app.use('/api/v1/public',     require('./routes/public'));
app.use('/api/v1/dashboard',  require('./routes/dashboard'));
app.use('/api/v1/teachers',   require('./routes/teachers'));
app.use('/api/v1/students',   require('./routes/students'));
app.use('/api/v1/admissions', require('./routes/admissions'));
app.use('/api/v1/results',    require('./routes/results'));
app.use('/api/v1/cbt', require('./routes/cbt'));
app.use('/api/v1/lms', require('./routes/lms'));
app.use('/api/v1/upload', require('./routes/upload'));

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'Delta Edu API is running' });
});

// Error handler
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));