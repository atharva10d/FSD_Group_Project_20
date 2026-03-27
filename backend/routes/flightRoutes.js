const express = require('express');
const router = express.Router();
const { getFlights, getFlightById, createFlight, getFlightSeats } = require('../controllers/flightController');
const { protect, admin, agentOrAdmin } = require('../middleware/authMiddleware');

router.get('/', getFlights);
router.get('/search', getFlights);
router.post('/', protect, admin, createFlight);
router.get('/:id/seats', protect, admin, getFlightSeats);
router.get('/:id', getFlightById);

module.exports = router;
