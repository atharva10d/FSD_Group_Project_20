const Reservation = require('../models/Reservation');
const Payment = require('../models/Payment');
const Flight = require('../models/Flight');
const Cancellation = require('../models/Cancellation');

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

        // Generate transaction ID for internal records (Stripe handles actual payment)
        const transactionId = 'TXN' + Math.floor(Math.random() * 1000000000);

        // Verify chosen seats are not already taken
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
        const reservation = await Reservation.findById(req.params.id).populate('flightId');
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Owner-only guard — only the passenger who owns the ticket can cancel
        if (reservation.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized. Only the ticket owner can cancel this booking.' });
        }

        // Prevent double cancellation
        if (reservation.status === 'Cancelled') {
            return res.status(400).json({ message: 'This booking has already been cancelled.' });
        }

        const flight = reservation.flightId;
        if (!flight) {
            return res.status(404).json({ message: 'Associated flight not found.' });
        }

        // Check if flight has already departed
        const now = new Date();
        const departureTime = new Date(flight.departureTime);
        if (departureTime <= now) {
            return res.status(400).json({ message: 'Cannot cancel — this flight has already departed.' });
        }

        // --- Tiered Refund Calculation ---
        const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);
        let refundPercent = 0;

        if (hoursUntilDeparture > 48) {
            refundPercent = 90;   // Tier 1: > 48 hours
        } else if (hoursUntilDeparture >= 24) {
            refundPercent = 50;   // Tier 2: 24–48 hours
        } else {
            refundPercent = 0;    // Tier 3: < 24 hours
        }

        const refundAmount = Math.round((reservation.totalAmount * refundPercent) / 100);

        // Update reservation status and persist refund amount
        reservation.status = 'Cancelled';
        reservation.refundAmount = refundAmount;
        await reservation.save();

        // Create a Cancellation record for audit trail
        await Cancellation.create({
            reservation: reservation._id,
            user: req.user._id,
            reason: req.body.reason || 'Passenger initiated cancellation',
            refundAmount: refundAmount,
            status: refundAmount > 0 ? 'Refunded' : 'Rejected'
        });

        // Release seats back to the flight
        const flightDoc = await Flight.findById(flight._id);
        flightDoc.availableSeats += reservation.passengers.length;
        await flightDoc.save();

        res.json({
            message: 'Booking cancelled successfully.',
            reservation,
            refundAmount,
            refundPercent,
            hoursUntilDeparture: Math.round(hoursUntilDeparture * 10) / 10
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createReservation, getMyReservations, cancelReservation };

