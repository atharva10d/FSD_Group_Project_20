const Reservation = require('../models/Reservation');
const Payment = require('../models/Payment');
const Flight = require('../models/Flight');

const createReservation = async (req, res) => {
    try {
        let { flightId, passengers, paymentMethod, seatNumber } = req.body;
        const flight = await Flight.findById(flightId);

        // Fallback if passengers array is not present
        if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
            passengers = [{
                name: req.user.name || 'Unknown',
                firstName: req.user.name ? req.user.name.split(' ')[0] : 'Unknown',
                lastName: req.user.name ? req.user.name.split(' ').slice(1).join(' ') : '',
                age: 25,
                gender: 'Male',
                seatNumber: seatNumber || 'TBA'
            }];
        }

        // Validate booking logic
        if (!flight || flight.availableSeats < passengers.length) {
            return res.status(400).json({ message: 'Not enough seats available' });
        }

        const totalAmount = flight.price * passengers.length;

        // Mock Payment Gateway
        const transactionId = 'TXN' + Math.floor(Math.random() * 1000000000);
        const paymentStatus = Math.random() > 0.1 ? 'Success' : 'Failed'; // 90% success rate

        // Verify chosen seats
        const existingReservations = await Reservation.find({ flightId: flightId, status: { $ne: 'Cancelled' } });
        let bookedSeats = [];
        existingReservations.forEach(r => {
            r.passengers.forEach(p => {
               if(p.seatNumber) bookedSeats.push(p.seatNumber);
            });
        });

        for (let p of passengers) {
            if (!p.seatNumber) {
                return res.status(400).json({ message: 'A seat must be selected for every passenger.' });
            }
            if (bookedSeats.includes(p.seatNumber)) {
                return res.status(400).json({ message: `Seat ${p.seatNumber} has already been reserved. Please select another.` });
            }
        }

        if (paymentStatus === 'Failed') {
            return res.status(400).json({ message: 'Payment failed. Please try again.' });
        }

        const reservation = new Reservation({
            userId: req.user._id,
            flightId: flightId,
            seatNumber: passengers.length > 0 ? passengers[0].seatNumber : 'TBA',
            passengers,
            totalSeatsBooked: passengers.length,
            totalAmount,
            status: 'Confirmed'
        });

        const createdReservation = await reservation.save();

        const payment = new Payment({
            reservation: createdReservation._id,
            user: req.user._id,
            amount: totalAmount,
            paymentMethod,
            transactionId,
            status: 'Success'
        });
        await payment.save();

        createdReservation.paymentId = payment._id;
        await createdReservation.save();

        flight.availableSeats -= passengers.length;
        await flight.save();

        res.status(201).json(createdReservation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ userId: req.user._id }).populate('flightId').populate('paymentId');
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const cancelReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        if (reservation.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        reservation.status = 'Cancelled';
        await reservation.save();

        const flight = await Flight.findById(reservation.flightId);
        flight.availableSeats += reservation.passengers.length;
        await flight.save();

        res.json({ message: 'Reservation cancelled successfully', reservation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createReservation, getMyReservations, cancelReservation };
