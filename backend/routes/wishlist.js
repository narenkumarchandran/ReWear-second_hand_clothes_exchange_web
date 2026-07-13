const express = require('express');
const Wishlist = require('../models/Wishlist');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/wishlist
 * Get user's wishlist with populated item details.
 * Requires auth.
 */
router.get('/', auth, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.userId })
      .populate('items.item')
      .lean();

    if (!wishlist) {
      return res.json({ items: [] });
    }

    // Filter out any items that may have been deleted
    const validItems = wishlist.items.filter(entry => entry.item != null);

    // Transform to match the frontend WishlistItem format
    const items = validItems.map(entry => ({
      id: entry.item._id.toString(),
      title: entry.item.title,
      image: entry.item.images?.[0] || '',
      price: entry.item.price.toString(),
      brand: entry.item.brand || entry.item.tags?.[0] || 'Unknown',
      size: entry.item.size || '',
      addedDate: entry.addedAt?.toISOString() || new Date().toISOString(),
    }));

    res.json({ items });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error fetching wishlist.' });
  }
});

/**
 * POST /api/wishlist/:itemId
 * Add an item to the wishlist.
 * Requires auth.
 */
router.post('/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;

    // Verify item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    let wishlist = await Wishlist.findOne({ user: req.userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.userId,
        items: [{ item: itemId }],
      });
    } else {
      // Check if already in wishlist
      const alreadyInWishlist = wishlist.items.some(
        entry => entry.item.toString() === itemId
      );

      if (alreadyInWishlist) {
        return res.status(400).json({ message: 'Item already in wishlist.' });
      }

      wishlist.items.push({ item: itemId });
    }

    await wishlist.save();

    res.json({ message: 'Item added to wishlist.' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error adding to wishlist.' });
  }
});

/**
 * DELETE /api/wishlist/:itemId
 * Remove an item from the wishlist.
 * Requires auth.
 */
router.delete('/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.userId });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found.' });
    }

    wishlist.items = wishlist.items.filter(
      entry => entry.item.toString() !== itemId
    );

    await wishlist.save();

    res.json({ message: 'Item removed from wishlist.' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error removing from wishlist.' });
  }
});

module.exports = router;
