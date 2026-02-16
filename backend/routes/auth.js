const express = require('express');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const Invite = require('../models/Invite');
const validate = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user (senior or guardian)
 */
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['senior', 'guardian']).withMessage('Role must be senior or guardian'),
    validate
], async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists.' });
        }

        // Create user (password hashed by pre-save hook)
        const user = await User.create({
            name,
            email,
            passwordHash: password,
            role
        });

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        logger.success(`User registered: ${email} (${role})`);

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        logger.error('Registration error', error.message);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
], async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        logger.success(`User logged in: ${email} (${user.role})`);

        res.json({
            message: 'Login successful',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        logger.error('Login error', error.message);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

/**
 * GET /api/auth/me
 * Get current user profile (protected)
 */
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('guardianId', 'name email')
            .populate('linkedSeniorId', 'name email');
        res.json({ user });
    } catch (error) {
        logger.error('Profile fetch error', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
});

/**
 * DELETE /api/auth/account
 * Delete current user's account (requires password + typing "delete")
 */
router.delete('/account', auth, [
    body('password').notEmpty().withMessage('Password is required'),
    body('confirmation').equals('delete').withMessage('You must type "delete" to confirm'),
    validate
], async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password.' });
        }

        // Clean up linked relationships
        if (user.role === 'senior' && user.guardianId) {
            await User.findByIdAndUpdate(user.guardianId, { $unset: { linkedSeniorId: 1 } });
        } else if (user.role === 'guardian' && user.linkedSeniorId) {
            await User.findByIdAndUpdate(user.linkedSeniorId, { $unset: { guardianId: 1 } });
        }

        // Remove any pending invites
        await Invite.deleteMany({
            $or: [
                { seniorId: user._id },
                { guardianEmail: user.email }
            ]
        });

        // Delete the user
        await User.findByIdAndDelete(user._id);

        logger.success(`Account deleted: ${user.email} (${user.role})`);

        res.json({ message: 'Account deleted successfully.' });
    } catch (error) {
        logger.error('Account deletion error', error.message);
        res.status(500).json({ message: 'Server error during account deletion.' });
    }
});

module.exports = router;
