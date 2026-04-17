const mongoose = require('mongoose');

const webCheckinSchema = new mongoose.Schema({
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
    passengerId: { type: mongoose.Schema.Types.ObjectId, required: true }, // from passenger array in Reservation
    seatNumber: { type: String, required: true },
    boardingPassUrl: { type: String }, // PDF url
    status: { type: String, enum: ['Issued', 'Pending'], default: 'Issued' }
}, { timestamps: true });

module.exports = mongoose.model('WebCheckin', webCheckinSchema);
