const express = require('express');
const { body } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const Invite = require('../models/Invite');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { auth, authorize } = require('../middleware/auth');
const { sendInviteEmail } = require('../utils/mailer');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * POST /api/invite
 * Senior invites a guardian by email
 */
router.post('/', auth, authorize('senior'), [
    body('guardianEmail').isEmail().withMessage('Valid guardian email is required'),
    validate
], async (req, res) => {
    try {
        const { guardianEmail } = req.body;
        const senior = req.user;

        // Check if senior already has a guardian
        if (senior.guardianId) {
            return res.status(400).json({ message: 'You already have a linked guardian.' });
        }

        // Check if there's already a pending invite
        const existingInvite = await Invite.findOne({
            seniorId: senior._id,
            status: 'pending'
        });
        if (existingInvite) {
            return res.status(400).json({ message: 'You already have a pending invitation. Please wait or cancel it first.' });
        }

        // Generate invite token
        const token = uuidv4();

        // Create invite
        const invite = await Invite.create({
            seniorId: senior._id,
            guardianEmail,
            token
        });

        // Send email notification
        try {
            await sendInviteEmail(guardianEmail, token, senior.name);
        } catch (emailErr) {
            logger.warn('Failed to send invite email', emailErr.message);
        }

        logger.success(`Invite created by ${senior.email} for ${guardianEmail}`);

        res.status(201).json({
            message: 'Invitation sent successfully.',
            invite: {
                id: invite._id,
                guardianEmail: invite.guardianEmail,
                token: invite.token,
                status: invite.status
            }
        });
    } catch (error) {
        logger.error('Invite creation error', error.message);
        res.status(500).json({ message: 'Server error creating invitation.' });
    }
});

/**
 * POST /api/invite/accept
 * Guardian accepts an invite using the token
 */
router.post('/accept', auth, authorize('guardian'), [
    body('token').notEmpty().withMessage('Invite token is required'),
    validate
], async (req, res) => {
    try {
        const { token } = req.body;
        const guardian = req.user;

        // Check if guardian is already linked
        if (guardian.linkedSeniorId) {
            return res.status(400).json({ message: 'You are already linked to a senior.' });
        }

        // Find invite
        const invite = await Invite.findOne({ token, status: 'pending' });
        if (!invite) {
            return res.status(404).json({ message: 'Invalid or expired invitation.' });
        }

        // Verify email matches
        if (invite.guardianEmail !== guardian.email) {
            return res.status(403).json({ message: 'This invitation was sent to a different email address.' });
        }

        // Link the users
        const senior = await User.findById(invite.seniorId);
        if (!senior) {
            return res.status(404).json({ message: 'Senior user not found.' });
        }

        senior.guardianId = guardian._id;
        guardian.linkedSeniorId = senior._id;

        await senior.save();
        await guardian.save();

        // Update invite status
        invite.status = 'accepted';
        await invite.save();

        logger.success(`Guardian ${guardian.email} linked to senior ${senior.email}`);

        res.json({
            message: 'Invitation accepted! You are now linked as a guardian.',
            senior: { id: senior._id, name: senior.name, email: senior.email }
        });
    } catch (error) {
        logger.error('Invite accept error', error.message);
        res.status(500).json({ message: 'Server error accepting invitation.' });
    }
});

/**
 * GET /api/invite/pending
 * Get pending invites for the current user
 */
router.get('/pending', auth, async (req, res) => {
    try {
        let invites;
        if (req.user.role === 'senior') {
            invites = await Invite.find({ seniorId: req.user._id, status: 'pending' });
        } else {
            invites = await Invite.find({ guardianEmail: req.user.email, status: 'pending' })
                .populate('seniorId', 'name email');
        }
        res.json({ invites });
    } catch (error) {
        logger.error('Fetch pending invites error', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
