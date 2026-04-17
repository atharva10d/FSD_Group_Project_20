const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const generateRandomFlights = require('./utils/autoGenerate');

dotenv.config();
connectDB();
generateRandomFlights();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/flights', require('./routes/flightRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
