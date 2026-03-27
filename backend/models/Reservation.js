const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    name: { type: String },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    seatNumber: { type: String }
});

const reservationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    seatNumber: { type: String }, // make optional for newer multi-bookings if needed
    passengers: [passengerSchema],
    totalSeatsBooked: { type: Number, default: 1 },
    totalAmount: { type: Number, required: true },
    bookingDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    isWebCheckedIn: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
