const express = require('express');
const Item = require('../models/Item');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

/**
 * GET /api/items
 * Get all approved items (for the Browse page).
 * Public — no auth required.
 */
router.get('/', async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    const filter = { status: 'approved' };

    if (category) {
      filter.category = category;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
        { brand: searchRegex },
      ];
    }

    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'popular') sortOption = { upvotes: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const items = await Item.find(filter).sort(sortOption).lean();

    res.json({ items });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error fetching items.' });
  }
});

/**
 * GET /api/items/my
 * Get current user's items (all statuses).
 * Requires auth.
 */
router.get('/my', auth, async (req, res) => {
  try {
    const items = await Item.find({ seller: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ items });
  } catch (error) {
    console.error('Get my items error:', error);
    res.status(500).json({ message: 'Server error fetching your items.' });
  }
});

/**
 * GET /api/items/pending
 * Get all pending items for admin review.
 * Requires auth + admin.
 */
router.get('/pending', auth, admin, async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const items = await Item.find(filter).sort({ createdAt: -1 }).lean();

    res.json({ items });
  } catch (error) {
    console.error('Get pending items error:', error);
    res.status(500).json({ message: 'Server error fetching pending items.' });
  }
});

/**
 * GET /api/items/:id
 * Get a single item by ID.
 * Public — no auth required. Increments view count.
 */
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).lean();

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // Increment view count (fire-and-forget)
    Item.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

    res.json({ item });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found.' });
    }
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Server error fetching item.' });
  }
});

/**
 * POST /api/items
 * Create a new item listing.
 * Requires auth.
 */
router.post('/', auth, async (req, res) => {
  try {
    const {
      title, description, price, category, type,
      size, condition, color, brand, location,
      tags, images,
    } = req.body;

    if (!title || !description || !price || !category || !condition) {
      return res.status(400).json({ message: 'Missing required fields: title, description, price, category, condition.' });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required.' });
    }

    const user = req.user;

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'You are blocked' });
    }

    const item = new Item({
      title,
      description,
      price: parseInt(price),
      category,
      type: type || '',
      size: size || '',
      condition,
      color: color || '',
      brand: brand || '',
      location: location || 'Not specified',
      tags: tags || [],
      images,
      seller: user._id,
      sellerInfo: {
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        rating: 5.0,
      },
      status: 'on-processing',
    });

    await item.save();

    // Update user's itemsListed count
    await User.findByIdAndUpdate(user._id, {
      $inc: { 'stats.itemsListed': 1 },
    });

    res.status(201).json({
      message: 'Item submitted for approval.',
      item: item.toObject(),
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: 'Server error creating item.' });
  }
});

/**
 * PUT /api/items/:id/approve
 * Admin approves an item.
 * Requires auth + admin.
 */
router.put('/:id/approve', auth, admin, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    if (item.status !== 'on-processing') {
      return res.status(400).json({ message: `Item is already ${item.status}.` });
    }

    item.status = 'approved';
    await item.save();

    res.json({ message: 'Item approved.', item: item.toObject() });
  } catch (error) {
    console.error('Approve item error:', error);
    res.status(500).json({ message: 'Server error approving item.' });
  }
});

/**
 * PUT /api/items/:id/reject
 * Admin rejects an item with a message.
 * Requires auth + admin.
 */
router.put('/:id/reject', auth, admin, async (req, res) => {
  try {
    const { rejectionMessage } = req.body;

    if (!rejectionMessage || !rejectionMessage.trim()) {
      return res.status(400).json({ message: 'Rejection message is required.' });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    if (item.status !== 'on-processing') {
      return res.status(400).json({ message: `Item is already ${item.status}.` });
    }

    item.status = 'rejected';
    item.rejectionMessage = rejectionMessage.trim();
    await item.save();

    // Notify the user via the messaging system
    let conv = await Conversation.findOne({
      participants: { $all: [req.userId, item.seller] },
      item: item._id
    });

    if (!conv) {
      conv = new Conversation({
        participants: [req.userId, item.seller],
        item: item._id,
        type: 'user-admin',
      });
      await conv.save();
    }

    const textMsg = `Your item "${item.title}" was rejected for the following reason:\n\n${rejectionMessage.trim()}\n\nPlease update your item and resubmit.`;

    const message = new Message({
      conversation: conv._id,
      sender: req.userId,
      text: textMsg,
      readBy: [req.userId]
    });
    await message.save();

    conv.lastMessage = {
      text: textMsg,
      sender: req.userId,
      timestamp: new Date()
    };
    await conv.save();

    res.json({ message: 'Item rejected.', item: item.toObject() });
  } catch (error) {
    console.error('Reject item error:', error);
    res.status(500).json({ message: 'Server error rejecting item.' });
  }
});

/**
 * POST /api/items/:id/upvote
 * Toggle upvote on an item.
 * Requires auth.
 */
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    const userId = req.userId;
    const hasUpvoted = item.upvotedBy.includes(userId);

    if (hasUpvoted) {
      // Remove upvote
      item.upvotedBy = item.upvotedBy.filter(id => !id.equals(userId));
      item.upvotes = Math.max(0, item.upvotes - 1);
    } else {
      // Add upvote
      item.upvotedBy.push(userId);
      item.upvotes += 1;
    }

    await item.save();

    res.json({
      message: hasUpvoted ? 'Upvote removed.' : 'Upvoted!',
      upvotes: item.upvotes,
      hasUpvoted: !hasUpvoted,
    });
  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({ message: 'Server error toggling upvote.' });
  }
});

module.exports = router;
