const express = require('express');
const { body } = require('express-validator');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { auth, authorize } = require('../middleware/auth');
const { sendGuardianAlert } = require('../utils/mailer');
const logger = require('../utils/logger');

const router = express.Router();

const TXN_THRESHOLD = parseInt(process.env.TXN_THRESHOLD) || 5000;

/**
 * POST /api/transactions/create
 * Senior creates a new transaction
 */
router.post('/create', auth, authorize('senior'), [
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be a positive number'),
    body('recipient').trim().notEmpty().withMessage('Recipient is required'),
    body('reason').optional().trim(),
    validate
], async (req, res) => {
    try {
        const { amount, recipient, reason } = req.body;
        const senior = req.user;

        // Determine status based on threshold
        let status;
        if (amount > TXN_THRESHOLD) {
            // High-risk: requires guardian approval
            if (!senior.guardianId) {
                return res.status(400).json({
                    message: `Transactions above ₹${TXN_THRESHOLD.toLocaleString('en-IN')} require a linked guardian. Please invite a guardian first.`
                });
            }
            status = 'PENDING_APPROVAL';
        } else {
            // Low-risk: auto-complete
            status = 'COMPLETED';
        }

        const transaction = await Transaction.create({
            seniorId: senior._id,
            guardianId: senior.guardianId,
            amount,
            recipient,
            reason: reason || '',
            status
        });

        // Notify guardian if pending approval
        if (status === 'PENDING_APPROVAL' && senior.guardianId) {
            try {
                const guardian = await User.findById(senior.guardianId);
                if (guardian) {
                    await sendGuardianAlert(guardian.email, guardian.name, senior.name, transaction);
                }
            } catch (emailErr) {
                logger.warn('Failed to send guardian alert email', emailErr.message);
            }
        }

        logger.success(`Transaction created: ₹${amount} by ${senior.email} → ${status}`);

        res.status(201).json({
            message: status === 'PENDING_APPROVAL'
                ? 'Transaction created. Awaiting guardian approval.'
                : 'Transaction completed successfully.',
            transaction
        });
    } catch (error) {
        logger.error('Transaction creation error', error.message);
        res.status(500).json({ message: 'Server error creating transaction.' });
    }
});

/**
 * GET /api/transactions/my
 * Get transactions for the logged-in user
 */
router.get('/my', auth, async (req, res) => {
    try {
        let filter;
        if (req.user.role === 'senior') {
            filter = { seniorId: req.user._id };
        } else {
            // Guardian sees transactions of their linked senior
            filter = { guardianId: req.user._id };
        }

        const transactions = await Transaction.find(filter)
            .populate('seniorId', 'name email')
            .populate('guardianId', 'name email')
            .sort({ createdAt: -1 });

        res.json({ transactions });
    } catch (error) {
        logger.error('Fetch transactions error', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
});

/**
 * POST /api/transactions/:id/approve
 * Guardian approves a pending transaction
 */
router.post('/:id/approve', auth, authorize('guardian'), async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }

        // Verify this guardian is authorized
        if (transaction.guardianId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to approve this transaction.' });
        }

        if (transaction.status !== 'PENDING_APPROVAL') {
            return res.status(400).json({ message: `Cannot approve a transaction with status: ${transaction.status}` });
        }

        // Approve → Complete
        transaction.status = 'COMPLETED';
        await transaction.save();

        logger.success(`Transaction ₹${transaction.amount} APPROVED by guardian ${req.user.email}`);

        res.json({
            message: 'Transaction approved and completed.',
            transaction
        });
    } catch (error) {
        logger.error('Transaction approve error', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
});

/**
 * POST /api/transactions/:id/reject
 * Guardian rejects a pending transaction
 */
router.post('/:id/reject', auth, authorize('guardian'), async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }

        // Verify this guardian is authorized
        if (transaction.guardianId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to reject this transaction.' });
        }

        if (transaction.status !== 'PENDING_APPROVAL') {
            return res.status(400).json({ message: `Cannot reject a transaction with status: ${transaction.status}` });
        }

        // Reject → Blocked
        transaction.status = 'BLOCKED';
        await transaction.save();

        logger.success(`Transaction ₹${transaction.amount} REJECTED by guardian ${req.user.email}`);

        res.json({
            message: 'Transaction rejected and blocked.',
            transaction
        });
    } catch (error) {
        logger.error('Transaction reject error', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
