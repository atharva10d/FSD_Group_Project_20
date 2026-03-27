const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    flightNumber: { type: String, required: true, unique: true },
    airline: { type: String, required: true },
    source: { type: String, required: true, lowercase: true, trim: true },
    destination: { type: String, required: true, lowercase: true, trim: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    totalSeats: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['Scheduled', 'Delayed', 'Cancelled', 'Completed'], default: 'Scheduled' }
}, { timestamps: true });

// Add index for searching
flightSchema.index({ source: 1, destination: 1, departureTime: 1 });

module.exports = mongoose.model('Flight', flightSchema);
