const express = require('express');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

/**
 * GET /api/conversations
 * List all conversations for the current user.
 * Requires auth.
 */
router.get('/', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId,
    })
      .populate('participants', 'name email avatar')
      .populate('item', 'title images')
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ conversations });
  } catch (error) {
    console.error('List conversations error:', error);
    res.status(500).json({ message: 'Server error listing conversations.' });
  }
});

/**
 * GET /api/conversations/admin
 * Admin: list all support conversations.
 * Requires auth + admin.
 */
router.get('/admin', auth, admin, async (req, res) => {
  try {
    const conversations = await Conversation.find({ type: 'user-admin' })
      .populate('participants', 'name email avatar')
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ conversations });
  } catch (error) {
    console.error('Admin list conversations error:', error);
    res.status(500).json({ message: 'Server error listing support conversations.' });
  }
});

/**
 * POST /api/conversations
 * Create or get an existing conversation.
 * Body: { participantId, itemId?, type? }
 * Requires auth.
 */
router.post('/', auth, async (req, res) => {
  try {
    const { participantId, itemId, type } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: 'participantId is required.' });
    }

    // Don't allow messaging yourself
    if (participantId === req.userId.toString()) {
      return res.status(400).json({ message: 'Cannot create a conversation with yourself.' });
    }

    // Check if conversation already exists between these users (optionally for same item)
    const query = {
      participants: { $all: [req.userId, participantId] },
    };

    if (itemId) {
      query.item = itemId;
    }

    let conversation = await Conversation.findOne(query)
      .populate('participants', 'name email avatar')
      .populate('item', 'title images');

    if (conversation) {
      return res.json({ conversation, existing: true });
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [req.userId, participantId],
      item: itemId || null,
      type: type || 'user-user',
    });

    await conversation.save();

    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email avatar')
      .populate('item', 'title images');

    res.status(201).json({ conversation, existing: false });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Server error creating conversation.' });
  }
});

/**
 * GET /api/conversations/:id/messages
 * Get messages for a conversation.
 * Requires auth.
 */
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    // Verify user is participant (or admin for support conversations)
    const isParticipant = conversation.participants.some(
      p => p.toString() === req.userId.toString()
    );
    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 })
      .lean();

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error fetching messages.' });
  }
});

/**
 * POST /api/conversations/:id/messages
 * Send a message in a conversation.
 * Body: { text }
 * Requires auth.
 */
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required.' });
    }

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    // Verify user is participant (or admin for support conversations)
    const isParticipant = conversation.participants.some(
      p => p.toString() === req.userId.toString()
    );
    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const message = new Message({
      conversation: req.params.id,
      sender: req.userId,
      text: text.trim(),
      readBy: [req.userId],
    });

    await message.save();

    // Update conversation's lastMessage
    conversation.lastMessage = {
      text: text.trim(),
      sender: req.userId,
      timestamp: new Date(),
    };
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email avatar')
      .lean();

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error sending message.' });
  }
});

module.exports = router;
