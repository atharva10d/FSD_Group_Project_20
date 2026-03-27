const Flight = require('../models/Flight');

const getFlights = async (req, res) => {
    try {
        console.log('Search API Invoked with query:', req.query);
        const { source, destination, date } = req.query;
        let query = {};
        if (source) query.source = new RegExp(source.trim(), 'i');
        if (destination) query.destination = new RegExp(destination.trim(), 'i');
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setUTCHours(23, 59, 59, 999);
            query.departureTime = { $gte: startOfDay, $lte: endOfDay };
        }
        console.log('Search Params:', source, destination, date);
        const flights = await Flight.find(query);
        console.log('Flights Found:', flights.length);
        res.json(flights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFlightById = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);
        if (flight) {
            const mongoose = require('mongoose');
            const Reservation = mongoose.model('Reservation');
            const reservations = await Reservation.find({ flightId: req.params.id, status: { $ne: 'Cancelled' } });
            let bookedSeats = [];
            reservations.forEach(r => {
                r.passengers.forEach(p => {
                    if (p.seatNumber) bookedSeats.push(p.seatNumber);
                });
            });
            res.json({ ...flight._doc, bookedSeats });
        } else {
            res.status(404).json({ message: 'Flight not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createFlight = async (req, res) => {
    try {
        const flight = await Flight.create(req.body);
        console.log('Flight directly inserted into primary Flight collection via POST API:', flight);
        res.status(201).json(flight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFlightSeats = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);
        if (!flight) return res.status(404).json({ message: 'Flight not found' });
        
        const mongoose = require('mongoose');
        const Reservation = mongoose.model('Reservation');
        const reservations = await Reservation.find({ flightId: req.params.id, status: { $ne: 'Cancelled' } });
        
        let bookedSeats = [];
        reservations.forEach(r => {
            r.passengers?.forEach(p => {
                if (p.seatNumber) bookedSeats.push(p.seatNumber);
            });
        });
        
        res.json({ totalSeats: flight.totalSeats, bookedSeats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getFlights, getFlightById, createFlight, getFlightSeats };
