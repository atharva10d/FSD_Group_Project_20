const mongoose = require('mongoose');

const cancellationSchema = new mongoose.Schema({
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String },
    refundAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Refunded', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Cancellation', cancellationSchema);
