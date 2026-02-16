const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
    seniorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    guardianEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'expired'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Invite', inviteSchema);
