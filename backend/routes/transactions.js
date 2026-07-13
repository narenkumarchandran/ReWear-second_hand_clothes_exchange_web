const express = require('express');
const Transaction = require('../models/Transaction');
const Item = require('../models/Item');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/transactions
 * Create a buy or swap request.
 * Body: { itemId, type, swapItemId? }
 * Requires auth.
 */
router.post('/', auth, async (req, res) => {
  try {
    const { itemId, type, swapItemId } = req.body;

    if (!itemId || !type) {
      return res.status(400).json({ message: 'itemId and type are required.' });
    }

    if (!['buy', 'swap'].includes(type)) {
      return res.status(400).json({ message: 'type must be "buy" or "swap".' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    if (item.status !== 'approved') {
      return res.status(400).json({ message: 'Item is not available.' });
    }

    // Can't buy your own item
    if (item.seller.toString() === req.userId.toString()) {
      return res.status(400).json({ message: 'Cannot purchase your own item.' });
    }

    // Check for existing pending transaction
    const existing = await Transaction.findOne({
      item: itemId,
      buyer: req.userId,
      status: 'pending',
    });

    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request for this item.' });
    }

    // If buying, check and deduct points
    if (type === 'buy') {
      const buyerUser = await User.findById(req.userId);
      if (buyerUser.points < item.price) {
        return res.status(400).json({ message: 'Not enough points to purchase this item.' });
      }
      buyerUser.points -= item.price;
      await buyerUser.save();

      // Instantly add to seller
      const sellerUser = await User.findById(item.seller);
      if (sellerUser) {
        sellerUser.points += item.price;
        await sellerUser.save();
      }
    }

    const transaction = new Transaction({
      item: itemId,
      buyer: req.userId,
      seller: item.seller,
      type,
      swapItem: type === 'swap' ? swapItemId : null,
      points: item.price,
      status: type === 'buy' ? 'accepted' : 'pending',
    });

    await transaction.save();

    if (type === 'buy') {
      item.status = 'sold';
      await item.save();
    }

    res.status(201).json({
      message: type === 'buy' ? 'Purchase successful!' : 'Swap request sent!',
      transaction: transaction.toObject(),
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error creating transaction.' });
  }
});

/**
 * GET /api/transactions
 * List current user's transactions (as buyer or seller).
 * Requires auth.
 */
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ buyer: req.userId }, { seller: req.userId }],
    })
      .populate('item', 'title images price')
      .populate('buyer', 'name email avatar')
      .populate('seller', 'name email avatar')
      .populate('swapItem', 'title images')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ transactions });
  } catch (error) {
    console.error('List transactions error:', error);
    res.status(500).json({ message: 'Server error listing transactions.' });
  }
});

/**
 * PUT /api/transactions/:id/accept
 * Seller accepts a transaction.
 * Requires auth.
 */
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    if (transaction.seller.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only the seller can accept this request.' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: `Transaction is already ${transaction.status}.` });
    }

    transaction.status = 'accepted';
    await transaction.save();

    res.json({ message: 'Transaction accepted!', transaction: transaction.toObject() });
  } catch (error) {
    console.error('Accept transaction error:', error);
    res.status(500).json({ message: 'Server error accepting transaction.' });
  }
});

/**
 * PUT /api/transactions/:id/reject
 * Seller rejects a transaction.
 * Requires auth.
 */
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    if (transaction.seller.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only the seller can reject this request.' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: `Transaction is already ${transaction.status}.` });
    }

    if (transaction.type === 'buy') {
      // Refund buyer
      const buyerUser = await User.findById(transaction.buyer);
      if (buyerUser) {
        buyerUser.points += transaction.points;
        await buyerUser.save();
      }
    }

    transaction.status = 'rejected';
    await transaction.save();

    res.json({ message: 'Transaction rejected.', transaction: transaction.toObject() });
  } catch (error) {
    console.error('Reject transaction error:', error);
    res.status(500).json({ message: 'Server error rejecting transaction.' });
  }
});

module.exports = router;
