const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

/**
 * GET /api/users/profile
 * Get current user's profile.
 * Requires auth.
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Remove password from response
    delete user.password;

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
});

/**
 * PUT /api/users/profile
 * Update current user's profile.
 * Requires auth.
 */
router.put('/profile', auth, async (req, res) => {
  try {
    const allowedFields = ['name', 'avatar', 'location', 'bio', 'phone', 'points', 'level'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Handle nested stats update
    if (req.body.stats) {
      const statsFields = ['itemsListed', 'successfulSwaps', 'waterSaved', 'co2Reduced', 'itemsRescued'];
      for (const field of statsFields) {
        if (req.body.stats[field] !== undefined) {
          updates[`stats.${field}`] = req.body.stats[field];
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    delete user.password;

    res.json({ message: 'Profile updated.', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});

/**
 * GET /api/users
 * Admin: list all users.
 * Requires auth + admin.
 */
router.get('/', auth, admin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ users });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ message: 'Server error listing users.' });
  }
});

/**
 * GET /api/users/:id
 * Admin: get a specific user's details with their items.
 * Requires auth + admin.
 */
router.get('/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const items = await Item.find({ seller: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    const purchases = await Transaction.find({ buyer: req.params.id, type: 'buy' })
      .populate('item', 'title images price status')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ user, items, purchases });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found.' });
    }
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user.' });
  }
});

/**
 * PUT /api/users/:id/points
 * Admin: update a user's points.
 * Requires auth + admin.
 */
router.put('/:id/points', auth, admin, async (req, res) => {
  try {
    const { points } = req.body;
    
    if (typeof points !== 'number') {
      return res.status(400).json({ message: 'Points must be a number.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.points = points;
    await user.save();

    res.json({ message: 'User points updated.', user: user.toJSON() });
  } catch (error) {
    console.error('Update points error:', error);
    res.status(500).json({ message: 'Server error updating points.' });
  }
});

/**
 * PUT /api/users/:id/suspend
 * Admin: suspend a user.
 * Requires auth + admin.
 */
router.put('/:id/suspend', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot suspend an admin account.' });
    }

    user.status = 'suspended';
    await user.save();

    res.json({ message: 'User suspended.', user: user.toJSON() });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ message: 'Server error suspending user.' });
  }
});

/**
 * PUT /api/users/:id/unsuspend
 * Admin: unsuspend a user.
 * Requires auth + admin.
 */
router.put('/:id/unsuspend', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.status = 'active';
    await user.save();

    res.json({ message: 'User unsuspended.', user: user.toJSON() });
  } catch (error) {
    console.error('Unsuspend user error:', error);
    res.status(500).json({ message: 'Server error unsuspending user.' });
  }
});

module.exports = router;
