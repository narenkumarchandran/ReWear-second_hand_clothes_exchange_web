const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: '',
  },
  condition: {
    type: String,
    required: true,
    enum: ['New', 'Like New', 'Good', 'Excellent', 'Fair'],
  },
  color: {
    type: String,
    default: '',
  },
  brand: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: 'Not specified',
  },
  tags: [{
    type: String,
  }],
  images: [{
    type: String, // base64 strings or URLs
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Denormalized seller info for fast reads on browse page
  sellerInfo: {
    name: { type: String, default: 'Unknown Seller' },
    email: { type: String, default: '' },
    avatar: { type: String, default: '' },
    rating: { type: Number, default: 5.0 },
  },
  status: {
    type: String,
    enum: ['on-processing', 'approved', 'rejected', 'sold'],
    default: 'on-processing',
  },
  rejectionMessage: {
    type: String,
    default: '',
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  upvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  views: {
    type: Number,
    default: 0,
  },
  // Flag for seed data items (not tied to a real user)
  isSeedData: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for common queries
itemSchema.index({ status: 1 });
itemSchema.index({ seller: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ tags: 1 });

module.exports = mongoose.model('Item', itemSchema);
