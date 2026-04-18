const Flight = require('../models/Flight');
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const Payment = require('../models/Payment');

const addFlight = async (req, res) => {
    try {
        const flight = await Flight.create(req.body);
        console.log('Admin successfully inserted flight into DB:', flight);
        res.status(201).json(flight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateFlight = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);
        if (!flight) return res.status(404).json({ message: 'Flight not found' });
        
        // If totalSeats is changing, adjust availableSeats proportionally
        if (req.body.totalSeats && req.body.totalSeats !== flight.totalSeats) {
            const bookedSeats = flight.totalSeats - flight.availableSeats;
            req.body.availableSeats = req.body.totalSeats - bookedSeats;
            if (req.body.availableSeats < 0) req.body.availableSeats = 0;
        }
        
        const updatedFlight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedFlight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteFlight = async (req, res) => {
    try {
        await Flight.findByIdAndDelete(req.params.id);
        res.json({ message: 'Flight deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReports = async (req, res) => {
    try {
        const totalBookings = await Reservation.countDocuments({ status: { $ne: 'Cancelled' } });
        const totalFlights = await Flight.countDocuments();
        const usersCount = await User.countDocuments();
        const revenueResult = await Payment.aggregate([{ $match: { status: 'Success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
        const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        res.json({ totalBookings, revenue, totalFlights, usersCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Users management
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reservations management
const getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find().populate('userId', 'name email').populate('flightId', 'flightNumber source destination departureTime price airline status');
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Backup & Restore Database
const backupDatabase = async (req, res) => {
    try {
        const flights = await Flight.find();
        const users = await User.find().select('-password');
        const reservations = await Reservation.find();
        const payments = await Payment.find();

        const backupData = { flights, users, reservations, payments };
        res.json(backupData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const restoreDatabase = async (req, res) => {
    try {
        const { flights, users, reservations, payments } = req.body;
        
        // This is a direct overwrite logic (dropping collections and inserting)
        if (flights) {
            await Flight.deleteMany({});
            await Flight.insertMany(flights);
        }
        if (users) {
            await User.deleteMany({});
            await User.insertMany(users);
        }
        if (reservations) {
            await Reservation.deleteMany({});
            await Reservation.insertMany(reservations);
        }
        if (payments) {
            await Payment.deleteMany({});
            await Payment.insertMany(payments);
        }

        res.json({ message: 'Database restored successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    addFlight, updateFlight, deleteFlight, getReports,
    getAllUsers, updateUser, deleteUser,
    getAllReservations,
    backupDatabase, restoreDatabase
};
