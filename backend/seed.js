/**
 * Database seed script.
 * Creates the default admin account and 12 sample clothing items.
 *
 * Usage: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Item = require('./models/Item');

const sampleItems = [
  {
    title: 'Vintage Denim Jacket',
    description: 'Classic blue denim jacket from the 90s. Perfect condition with minimal wear.',
    price: 45,
    category: 'Outerwear',
    type: 'Jacket',
    size: 'M',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop'],
    tags: ['vintage', 'denim', 'casual'],
    location: 'New York, NY',
    upvotes: 24,
    views: 156,
  },
  {
    title: 'Designer Summer Dress',
    description: 'Beautiful floral summer dress, worn only once to a wedding. Size 8.',
    price: 85,
    category: 'Dresses',
    type: 'Summer Dress',
    size: 'M',
    condition: 'New',
    images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop'],
    tags: ['designer', 'floral', 'summer'],
    location: 'Los Angeles, CA',
    upvotes: 18,
    views: 89,
  },
  {
    title: 'Leather Boots',
    description: 'Genuine leather ankle boots in excellent condition. Perfect for fall weather.',
    price: 65,
    category: 'Footwear',
    type: 'Boots',
    size: '8',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop'],
    tags: ['leather', 'boots', 'fall'],
    location: 'Chicago, IL',
    upvotes: 31,
    views: 203,
  },
  {
    title: 'Casual T-Shirt Bundle',
    description: 'Set of 3 casual t-shirts in different colors. All in great condition.',
    price: 25,
    category: 'Tops',
    type: 'T-shirt',
    size: 'L',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'],
    tags: ['casual', 'bundle', 'basic'],
    location: 'Miami, FL',
    upvotes: 12,
    views: 67,
  },
  {
    title: 'Wool Winter Coat',
    description: 'Elegant black wool coat, perfect for winter. Rarely worn, excellent condition.',
    price: 120,
    category: 'Outerwear',
    type: 'Coat',
    size: 'S',
    condition: 'Excellent',
    images: ['https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400&h=400&fit=crop'],
    tags: ['winter', 'wool', 'elegant'],
    location: 'Boston, MA',
    upvotes: 35,
    views: 298,
  },
  {
    title: 'Running Sneakers',
    description: 'Nike Air Max sneakers in great condition. Used for light jogging only.',
    price: 55,
    category: 'Footwear',
    type: 'Sneakers',
    size: '9',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'],
    tags: ['nike', 'running', 'athletic'],
    location: 'Austin, TX',
    upvotes: 19,
    views: 142,
  },
  {
    title: 'Silk Blouse',
    description: 'Professional silk blouse in cream color. Perfect for office wear.',
    price: 40,
    category: 'Tops',
    type: 'Blouse',
    size: 'M',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1564257577154-75f6b77ac595?w=400&h=400&fit=crop'],
    tags: ['silk', 'professional', 'cream'],
    location: 'Seattle, WA',
    upvotes: 22,
    views: 178,
  },
  {
    title: 'Denim Jeans',
    description: 'High-waisted skinny jeans from Zara. Size 28, excellent fit.',
    price: 35,
    category: 'Bottoms',
    type: 'Jeans',
    size: '28',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop'],
    tags: ['zara', 'skinny', 'high-waisted'],
    location: 'Portland, OR',
    upvotes: 16,
    views: 134,
  },
  {
    title: 'Cashmere Sweater',
    description: 'Luxurious beige cashmere sweater. Soft and warm, perfect for winter.',
    price: 95,
    category: 'Tops',
    type: 'Sweater',
    size: 'L',
    condition: 'Excellent',
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'],
    tags: ['cashmere', 'luxury', 'winter'],
    location: 'Denver, CO',
    upvotes: 28,
    views: 221,
  },
  {
    title: 'Evening Gown',
    description: 'Stunning black evening gown worn once to a gala. Size 6, floor length.',
    price: 150,
    category: 'Dresses',
    type: 'Evening',
    size: 'S',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1566479179817-b40b28aedc7c?w=400&h=400&fit=crop'],
    tags: ['formal', 'gala', 'elegant'],
    location: 'San Francisco, CA',
    upvotes: 42,
    views: 367,
  },
  {
    title: 'Leather Handbag',
    description: 'Genuine leather crossbody bag in brown. Multiple compartments, very practical.',
    price: 75,
    category: 'Accessories',
    type: 'Handbag',
    size: 'One Size',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'],
    tags: ['leather', 'crossbody', 'practical'],
    location: 'Nashville, TN',
    upvotes: 20,
    views: 189,
  },
  {
    title: 'Sports Jacket',
    description: 'Navy blue blazer perfect for business casual. Tailored fit, barely worn.',
    price: 80,
    category: 'Outerwear',
    type: 'Blazer',
    size: 'M',
    condition: 'Excellent',
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'],
    tags: ['business', 'navy', 'tailored'],
    location: 'Atlanta, GA',
    upvotes: 25,
    views: 156,
  },
];

// Seller names for seed data (matched to original Browse.tsx)
const sellerNames = [
  'Sarah M.', 'Emma K.', 'Mike R.', 'Alex J.',
  'Lisa C.', 'Tom H.', 'Rachel P.', 'Maya S.',
  'David L.', 'Anna B.', 'Sophie M.', 'James W.',
];

const sellerAvatars = [
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1491349174775-aaafddd81942?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
];

const sellerRatings = [4.8, 4.9, 4.7, 4.6, 4.9, 4.5, 4.8, 4.7, 4.6, 4.9, 4.8, 4.7];

async function seed() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // ── Create admin user ────────────────────────────────
    console.log('\n📌 Creating admin user...');
    const existingAdmin = await User.findOne({ email: 'admin@rewear.com' });
    let adminUser;

    if (existingAdmin) {
      console.log('   Admin user already exists, skipping.');
      adminUser = existingAdmin;
    } else {
      adminUser = new User({
        email: 'admin@rewear.com',
        password: 'admin123456',
        name: 'ReWear Admin',
        role: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        location: 'ReWear HQ',
        level: 'Administrator',
      });
      await adminUser.save();
      console.log('   ✅ Admin user created (admin@rewear.com / admin123456)');
    }

    // ── Create a seed seller user ────────────────────────
    console.log('\n📌 Creating seed seller user...');
    const existingSeedUser = await User.findOne({ email: 'seedseller@rewear.com' });
    let seedSeller;

    if (existingSeedUser) {
      console.log('   Seed seller already exists, skipping.');
      seedSeller = existingSeedUser;
    } else {
      seedSeller = new User({
        email: 'seedseller@rewear.com',
        password: 'seedseller123456',
        name: 'ReWear Marketplace',
        role: 'user',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marketplace',
        location: 'Various',
      });
      await seedSeller.save();
      console.log('   ✅ Seed seller created');
    }

    // ── Seed sample items ────────────────────────────────
    console.log('\n📌 Seeding sample items...');
    const existingItemCount = await Item.countDocuments({ isSeedData: true });

    if (existingItemCount > 0) {
      console.log(`   ${existingItemCount} seed items already exist. Clearing and re-seeding...`);
      await Item.deleteMany({ isSeedData: true });
    }

    for (let i = 0; i < sampleItems.length; i++) {
      const item = new Item({
        ...sampleItems[i],
        seller: seedSeller._id,
        sellerInfo: {
          name: sellerNames[i],
          email: 'seedseller@rewear.com',
          avatar: sellerAvatars[i],
          rating: sellerRatings[i],
        },
        status: 'approved',
        isSeedData: true,
      });
      await item.save();
      console.log(`   ✅ Created: ${item.title}`);
    }

    console.log(`\n🎉 Seed complete! Created ${sampleItems.length} items.`);
    console.log('\n📋 Credentials:');
    console.log('   Admin: admin@rewear.com / admin123456');
    console.log('   Seed seller: seedseller@rewear.com / seedseller123456');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
