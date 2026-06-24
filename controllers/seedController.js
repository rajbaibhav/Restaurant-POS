const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');

/**
 * @desc    Seed the database with demo data (admin, staff, menu items, tables)
 * @route   POST /seed/demo
 * @access  Public (one-time setup)
 */
const seedDemo = async (req, res) => {
  try {
    const results = { users: 0, menuItems: 0, tables: 0, skipped: [] };

    // ─── 1. Seed Admin User ────────────────────────────────────
    const existingAdmin = await User.findOne({ name: 'admin' });
    if (!existingAdmin) {
      await User.create({ name: 'admin', pin: 'owner123', role: 'admin', status: 'approved' });
      results.users++;
    } else {
      results.skipped.push('Admin user already exists');
    }

    // ─── 2. Seed Default Staff ─────────────────────────────────
    const existingStaff = await User.findOne({ name: 'staff01' });
    if (!existingStaff) {
      await User.create({ name: 'staff01', pin: 'staff123', role: 'staff', status: 'approved' });
      results.users++;
    } else {
      results.skipped.push('Default staff already exists');
    }

    // ─── 3. Seed Menu Items ────────────────────────────────────
    const existingMenuCount = await MenuItem.countDocuments({});
    if (existingMenuCount === 0) {
      const menuItems = [
        // MOMOS
        { name: 'Veg Steam Momo', price: 100, category: 'MOMOS', isVeg: true, image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?q=80&w=300&auto=format&fit=crop' },
        { name: 'Veg Fry Momo', price: 120, category: 'MOMOS', isVeg: true, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=300&auto=format&fit=crop' },
        { name: 'Veg Chilli Momo', price: 150, category: 'MOMOS', isVeg: true, image: 'https://images.unsplash.com/photo-1626776876729-babd0f2a583a?q=80&w=300&auto=format&fit=crop' },

        // NOODLES
        { name: 'Veg Noodles', price: 100, category: 'NOODLES', isVeg: true, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=300&auto=format&fit=crop' },
        { name: 'Veg Paneer Noodles', price: 140, category: 'NOODLES', isVeg: true, image: 'https://images.unsplash.com/photo-1606333543664-9f799738f658?q=80&w=300&auto=format&fit=crop' },
        { name: 'Veg Hakka Noodles', price: 140, category: 'NOODLES', isVeg: true, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=300&auto=format&fit=crop' },
        { name: 'Chicken Noodles', price: 140, category: 'NOODLES', isVeg: false, image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=300&auto=format&fit=crop' },
        { name: 'Egg Chicken Noodles', price: 160, category: 'NOODLES', isVeg: false, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=300&auto=format&fit=crop' },
        { name: 'Mix Noodles', price: 250, category: 'NOODLES', isVeg: false, image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=300&auto=format&fit=crop' },

        // PAW BHAJI
        { name: 'Paw Bhaji', price: 120, category: 'PAW BHAJI', isVeg: true, image: 'https://images.unsplash.com/photo-1626132646529-500637532537?q=80&w=300&auto=format&fit=crop' },
        { name: 'Cheese Paw Bhaji', price: 150, category: 'PAW BHAJI', isVeg: true, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=300&auto=format&fit=crop' },

        // DOSA
        { name: 'Plain Dosa', price: 80, category: 'DOSA', isVeg: true, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=300&auto=format&fit=crop' },
        { name: 'Masala Dosa', price: 120, category: 'DOSA', isVeg: true, image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?q=80&w=300&auto=format&fit=crop' },
        { name: 'Paneer Butter Masala Dosa', price: 160, category: 'DOSA', isVeg: true, image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=300&auto=format&fit=crop' },
        { name: 'Cheese Masala Dosa', price: 160, category: 'DOSA', isVeg: true, image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?q=80&w=300&auto=format&fit=crop' },

        // SOUP
        { name: 'Hot Tomato Soup', price: 120, category: 'SOUP', isVeg: true, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=300&auto=format&fit=crop' },
        { name: 'Chicken Soup', price: 120, category: 'SOUP', isVeg: false, image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=300&auto=format&fit=crop' },

        // VEG STARTER
        { name: 'Veg Pakora', price: 120, category: 'VEG STARTER', isVeg: true, image: 'https://images.unsplash.com/photo-1601050638917-3f048add4927?q=80&w=300&auto=format&fit=crop' },
        { name: 'French Fry', price: 120, category: 'VEG STARTER', isVeg: true, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=300&auto=format&fit=crop' },
        { name: 'Paneer Pakora', price: 160, category: 'VEG STARTER', isVeg: true, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=300&auto=format&fit=crop' },
        { name: 'Mushroom Dry Fry', price: 240, category: 'VEG STARTER', isVeg: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=300&auto=format&fit=crop' },

        // MAIN COURSE (VEG)
        { name: 'Mix Veg', price: 200, category: 'MAIN COURSE (VEG)', isVeg: true, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=300&auto=format&fit=crop' },
        { name: 'Paneer Butter Masala', price: 220, category: 'MAIN COURSE (VEG)', isVeg: true, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=300&auto=format&fit=crop' },
        { name: 'Shahi Paneer', price: 260, category: 'MAIN COURSE (VEG)', isVeg: true, image: 'https://images.unsplash.com/photo-1601050638917-3f048add4927?q=80&w=300&auto=format&fit=crop' },

        // NON VEG STARTER
        { name: 'Chicken Pakora', price: 180, category: 'NON VEG STARTER', isVeg: false, image: 'https://images.unsplash.com/photo-1614398751058-eb2e0bf63e51?q=80&w=300&auto=format&fit=crop' },
        { name: 'Chicken Lolipop Full (8pc)', price: 320, category: 'NON VEG STARTER', isVeg: false, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=300&auto=format&fit=crop' },
        { name: 'Fish Finger Full (8pc)', price: 300, category: 'NON VEG STARTER', isVeg: false, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=300&auto=format&fit=crop' },

        // MAIN COURSE CHICKEN
        { name: 'Chicken Curry', price: 220, category: 'MAIN COURSE CHICKEN', isVeg: false, image: 'https://images.unsplash.com/photo-1603894584134-f1c2baee290a?q=80&w=300&auto=format&fit=crop' },
        { name: 'Chicken Tikka Masala', price: 360, category: 'MAIN COURSE CHICKEN', isVeg: false, image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=300&auto=format&fit=crop' },
        { name: 'Chicken Butter Masala (Full)', price: 700, category: 'MAIN COURSE CHICKEN', isVeg: false, image: 'https://images.unsplash.com/photo-1603894584134-f1c2baee290a?q=80&w=300&auto=format&fit=crop' },

        // ROTI
        { name: 'Tandoori Roti', price: 20, category: 'ROTI', isVeg: true, image: 'https://images.unsplash.com/photo-1533777324545-e0162727fc90?q=80&w=300&auto=format&fit=crop' },
        { name: 'Butter Naan', price: 50, category: 'ROTI', isVeg: true, image: 'https://images.unsplash.com/photo-1601050638917-3f048add4927?q=80&w=300&auto=format&fit=crop' },
        { name: 'Butter Garlic Naan', price: 80, category: 'ROTI', isVeg: true, image: 'https://images.unsplash.com/photo-1533777324545-e0162727fc90?q=80&w=300&auto=format&fit=crop' },

        // BIRYANI
        { name: 'Veg Biryani', price: 200, category: 'BIRYANI', isVeg: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=300&auto=format&fit=crop' },
        { name: 'Chicken Biryani', price: 220, category: 'BIRYANI', isVeg: false, image: 'https://images.unsplash.com/photo-1642821336069-121b289d044c?q=80&w=300&auto=format&fit=crop' },
        { name: 'Mutton Biryani', price: 280, category: 'BIRYANI', isVeg: false, image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=300&auto=format&fit=crop' },

        // BEVERAGES & SHAKES
        { name: 'Cold Drinks', price: 30, category: 'BEVERAGES & SHAKES', isVeg: true, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=300&auto=format&fit=crop' },
        { name: 'Tea', price: 40, category: 'BEVERAGES & SHAKES', isVeg: true, image: 'https://images.unsplash.com/photo-1544787210-2213d84ad960?q=80&w=300&auto=format&fit=crop' },
        { name: 'Cold Coffee', price: 110, category: 'BEVERAGES & SHAKES', isVeg: true, image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=300&auto=format&fit=crop' },

        // DESERT
        { name: 'Vanila Ice Cream', price: 75, category: 'DESERT', isVeg: true, image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?q=80&w=300&auto=format&fit=crop' },
        { name: 'Chocolate Ice Cream', price: 75, category: 'DESERT', isVeg: true, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=300&auto=format&fit=crop' },
      ];

      await MenuItem.insertMany(menuItems);
      results.menuItems = menuItems.length;
    } else {
      results.skipped.push(`Menu already has ${existingMenuCount} items`);
    }

    // ─── 4. Seed Tables ────────────────────────────────────────
    // The backend tableController auto-seeds 7 tables on GET /tables if empty.
    // We explicitly seed 6 to match frontend expectations.
    const existingTableCount = await Table.countDocuments({});
    if (existingTableCount === 0) {
      const tableDocs = [];
      for (let i = 1; i <= 6; i++) {
        tableDocs.push({ tableId: i, status: 'AVAILABLE', currentOrder: [] });
      }
      await Table.insertMany(tableDocs);
      results.tables = 6;
    } else {
      results.skipped.push(`Tables already exist (${existingTableCount})`);
    }

    res.status(200).json({
      message: '✅ Demo data seeded successfully!',
      created: results,
      credentials: {
        admin: { name: 'admin', pin: 'owner123' },
        staff: { name: 'staff01', pin: 'staff123' }
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Failed to seed demo data', error: error.message });
  }
};

module.exports = { seedDemo };
