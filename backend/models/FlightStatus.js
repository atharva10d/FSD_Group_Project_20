const mongoose = require('mongoose');

const flightStatusSchema = new mongoose.Schema({
    flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    date: { type: Date, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    status: { type: String, enum: ['On Time', 'Delayed', 'Cancelled', 'Boarding', 'Departed'], default: 'On Time' },
    gate: { type: String }
}, { timestamps: true });

flightStatusSchema.index({ flight: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('FlightStatus', flightStatusSchema);
