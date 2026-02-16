const mongoose = require('mongoose');

const STATUSES = ['CREATED', 'PENDING_APPROVAL', 'APPROVED', 'COMPLETED', 'REJECTED', 'BLOCKED'];

const transactionSchema = new mongoose.Schema({
    seniorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    guardianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [1, 'Amount must be positive']
    },
    recipient: {
        type: String,
        required: [true, 'Recipient is required'],
        trim: true
    },
    reason: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: STATUSES,
        default: 'CREATED'
    }
}, {
    timestamps: true
});

transactionSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Transaction', transactionSchema);
