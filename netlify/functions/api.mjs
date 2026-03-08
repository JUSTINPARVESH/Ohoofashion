import express from 'express';
import { createClient } from '@libsql/client';
import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import serverless from 'serverless-http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'ohoo-fashion-secret-2026';

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Database
const client = createClient({
    url: process.env.DATABASE_URL || '',
    authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = {
    exec: async (sql) => {
        try { await client.executeMultiple(sql); } catch (err) { console.error('DB Init Error:', err.message); }
    },
    prepare: (sql) => ({
        all: async (...args) => (await client.execute({ sql, args })).rows,
        get: async (...args) => (await client.execute({ sql, args })).rows[0],
        run: async (...args) => {
            const res = await client.execute({ sql, args });
            return { lastInsertRowid: Number(res.lastInsertRowid) };
        },
    }),
};

// Initialize DB tables
const initDb = async () => {
    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user'
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS subcategories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      UNIQUE(name, category_id)
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category_id INTEGER NOT NULL,
      subcategory_id INTEGER,
      images TEXT,
      video TEXT,
      stock INTEGER DEFAULT 0,
      sizes TEXT,
      attributes TEXT,
      is_new BOOLEAN DEFAULT 0,
      is_trending BOOLEAN DEFAULT 0,
      is_featured BOOLEAN DEFAULT 0,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'Pending',
      address TEXT,
      city TEXT,
      zip TEXT,
      payment_method TEXT DEFAULT 'COD',
      payment_status TEXT DEFAULT 'Unpaid',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      size TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS reels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    INSERT OR IGNORE INTO settings (key, value) VALUES ('hero_banner_text', 'WE GIVE OFFERS 365 DAYS');
    INSERT OR IGNORE INTO categories (name) VALUES ('Men');
    INSERT OR IGNORE INTO categories (name) VALUES ('Kids');
    INSERT OR IGNORE INTO categories (name) VALUES ('Accessories');
    CREATE UNIQUE INDEX IF NOT EXISTS unq_subcategory_name_cat ON subcategories(name, category_id);
    INSERT OR IGNORE INTO subcategories (name, category_id) SELECT 'Shirts', id FROM categories WHERE name = 'Men';
    INSERT OR IGNORE INTO subcategories (name, category_id) SELECT 'Jeans', id FROM categories WHERE name = 'Men';
    INSERT OR IGNORE INTO subcategories (name, category_id) SELECT 'Kids T-Shirts', id FROM categories WHERE name = 'Kids';
    INSERT OR IGNORE INTO subcategories (name, category_id) SELECT 'Watches', id FROM categories WHERE name = 'Accessories';
    INSERT OR IGNORE INTO subcategories (name, category_id) SELECT 'Caps', id FROM categories WHERE name = 'Accessories';
  `);

    // Migrations
    try { await db.prepare("ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'COD'").run(); } catch (e) { }
    try { await db.prepare("ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'Unpaid'").run(); } catch (e) { }

    // Seed Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ohoofashion.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const existingAdmin = await db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
    if (!existingAdmin) {
        const hashedPassword = bcrypt.hashSync(adminPassword, 10);
        await db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Admin Manager', adminEmail, hashedPassword, 'admin');
    }
};

// Initialize once
let dbInitialized = false;
const ensureDb = async () => {
    if (!dbInitialized) {
        await initDb();
        dbInitialized = true;
    }
};

app.use(express.json({ limit: '50mb' }));

// Auth Middleware
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
};

// DB init middleware
app.use(async (req, res, next) => {
    await ensureDb();
    next();
});

// --- API Routes ---

// Auth
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const result = await db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashedPassword);
        const token = jwt.sign({ id: result.lastInsertRowid, email, role: 'user' }, JWT_SECRET);
        res.json({ token, user: { id: result.lastInsertRowid, name, email, role: 'user' } });
    } catch (err) {
        res.status(400).json({ error: 'Email already exists' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// Categories
app.get('/api/categories', async (req, res) => {
    const categories = await db.prepare('SELECT * FROM categories').all();
    res.json(categories);
});

app.post('/api/admin/categories', authenticate, isAdmin, async (req, res) => {
    const { name } = req.body;
    const result = await db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
    res.json({ id: result.lastInsertRowid });
});

app.put('/api/admin/categories/:id', authenticate, isAdmin, async (req, res) => {
    const { name } = req.body;
    await db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, req.params.id);
    res.json({ success: true });
});

app.delete('/api/admin/categories/:id', authenticate, isAdmin, async (req, res) => {
    await db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// Subcategories
app.get('/api/subcategories', async (req, res) => {
    const { category_id } = req.query;
    let query = 'SELECT * FROM subcategories';
    const params = [];
    if (category_id) { query += ' WHERE category_id = ?'; params.push(category_id); }
    const subs = await db.prepare(query).all(...params);
    res.json(subs);
});

app.post('/api/admin/subcategories', authenticate, isAdmin, async (req, res) => {
    const { name, category_id } = req.body;
    const result = await db.prepare('INSERT INTO subcategories (name, category_id) VALUES (?, ?)').run(name, category_id);
    res.json({ id: result.lastInsertRowid });
});

app.put('/api/admin/subcategories/:id', authenticate, isAdmin, async (req, res) => {
    const { name, category_id } = req.body;
    await db.prepare('UPDATE subcategories SET name = ?, category_id = ? WHERE id = ?').run(name, category_id, req.params.id);
    res.json({ success: true });
});

app.delete('/api/admin/subcategories/:id', authenticate, isAdmin, async (req, res) => {
    await db.prepare('UPDATE products SET subcategory_id = NULL WHERE subcategory_id = ?').run(req.params.id);
    await db.prepare('DELETE FROM subcategories WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// Products
app.get('/api/products', async (req, res) => {
    const { category_id, subcategory_id, search, minPrice, maxPrice, type } = req.query;
    let query = 'SELECT p.*, s.name as subcategory_name, c.name as category_name FROM products p LEFT JOIN subcategories s ON p.subcategory_id = s.id LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params = [];

    if (category_id) { query += ' AND p.category_id = ?'; params.push(category_id); }
    if (subcategory_id) { query += ' AND p.subcategory_id = ?'; params.push(subcategory_id); }
    if (search) { query += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (minPrice) { query += ' AND p.price >= ?'; params.push(minPrice); }
    if (maxPrice) { query += ' AND p.price <= ?'; params.push(maxPrice); }
    if (type === 'new') query += ' AND p.is_new = 1';
    if (type === 'trending') query += ' AND p.is_trending = 1';
    if (type === 'featured') query += ' AND p.is_featured = 1';

    const products = await db.prepare(query).all(...params);
    res.json(products.map(p => ({
        ...p,
        images: JSON.parse(p.images || '[]'),
        sizes: JSON.parse(p.sizes || '[]'),
        attributes: JSON.parse(p.attributes || '{}'),
    })));
});

app.get('/api/products/:id', async (req, res) => {
    const product = await db.prepare('SELECT p.*, s.name as subcategory_name, c.name as category_name FROM products p LEFT JOIN subcategories s ON p.subcategory_id = s.id LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ ...product, images: JSON.parse(product.images || '[]'), sizes: JSON.parse(product.sizes || '[]'), attributes: JSON.parse(product.attributes || '{}') });
});

// Admin Product CRUD
app.post('/api/admin/products', authenticate, isAdmin, async (req, res) => {
    const { name, description, price, category_id, subcategory_id, images, video, stock, sizes, attributes, is_new, is_trending, is_featured } = req.body;
    const result = await db.prepare(`INSERT INTO products (name, description, price, category_id, subcategory_id, images, video, stock, sizes, attributes, is_new, is_trending, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(name, description, price, category_id, subcategory_id, JSON.stringify(images), video, stock, JSON.stringify(sizes), JSON.stringify(attributes), is_new ? 1 : 0, is_trending ? 1 : 0, is_featured ? 1 : 0);
    res.json({ id: result.lastInsertRowid });
});

app.put('/api/admin/products/:id', authenticate, isAdmin, async (req, res) => {
    const { name, description, price, category_id, subcategory_id, images, video, stock, sizes, attributes, is_new, is_trending, is_featured } = req.body;
    await db.prepare(`UPDATE products SET name=?, description=?, price=?, category_id=?, subcategory_id=?, images=?, video=?, stock=?, sizes=?, attributes=?, is_new=?, is_trending=?, is_featured=? WHERE id=?`).run(name, description, price, category_id, subcategory_id, JSON.stringify(images), video, stock, JSON.stringify(sizes), JSON.stringify(attributes), is_new ? 1 : 0, is_trending ? 1 : 0, is_featured ? 1 : 0, req.params.id);
    res.json({ success: true });
});

app.delete('/api/admin/products/:id', authenticate, isAdmin, async (req, res) => {
    await db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// Orders
app.post('/api/orders', authenticate, async (req, res) => {
    const { items, total, address, city, zip, paymentMethod } = req.body;
    const userId = req.user.id;
    try {
        const orderResult = await db.prepare('INSERT INTO orders (user_id, total, address, city, zip, payment_method) VALUES (?, ?, ?, ?, ?, ?)').run(userId, total, address, city, zip, paymentMethod || 'COD');
        const orderId = orderResult.lastInsertRowid;
        for (const item of items) {
            await db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price, size) VALUES (?, ?, ?, ?, ?)').run(orderId, item.id, item.quantity, item.price, item.size);
            await db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.id);
        }
        res.json({ orderId });
    } catch (err) {
        res.status(400).json({ error: 'Order failed' });
    }
});

app.get('/api/orders/history', authenticate, async (req, res) => {
    const orders = await db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const items = await db.prepare(`SELECT oi.*, p.name as product_name, p.images FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`).all(order.id);
        return { ...order, items: items.map(i => ({ ...i, images: JSON.parse(i.images || '[]') })) };
    }));
    res.json(ordersWithItems);
});

// Admin Orders
app.get('/api/admin/orders', authenticate, isAdmin, async (req, res) => {
    const orders = await db.prepare('SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.user_id = u.id ORDER BY created_at DESC').all();
    res.json(orders);
});

app.put('/api/admin/orders/:id/payment-status', authenticate, isAdmin, async (req, res) => {
    const { status } = req.body;
    await db.prepare('UPDATE orders SET payment_status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
});

app.put('/api/admin/orders/:id/status', authenticate, isAdmin, async (req, res) => {
    const { status } = req.body;
    await db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
});

// Admin Dashboard
app.get('/api/admin/dashboard', authenticate, isAdmin, async (req, res) => {
    const totalProducts = await db.prepare('SELECT COUNT(*) as count FROM products').get();
    const totalOrders = await db.prepare('SELECT COUNT(*) as count FROM orders').get();
    const dailySales = await db.prepare("SELECT SUM(total) as sum FROM orders WHERE date(created_at) = date('now')").get();
    const lowStock = await db.prepare('SELECT * FROM products WHERE stock < 10').all();
    res.json({ totalProducts: totalProducts.count, totalOrders: totalOrders.count, dailySales: dailySales.sum || 0, lowStock });
});

// Reels
app.get('/api/reels', async (req, res) => {
    const reels = await db.prepare('SELECT * FROM reels ORDER BY created_at DESC').all();
    res.json(reels);
});

app.post('/api/admin/reels', authenticate, isAdmin, async (req, res) => {
    const { url, description } = req.body;
    const result = await db.prepare('INSERT INTO reels (url, description) VALUES (?, ?)').run(url, description);
    res.json({ id: result.lastInsertRowid });
});

app.delete('/api/admin/reels/:id', authenticate, isAdmin, async (req, res) => {
    await db.prepare('DELETE FROM reels WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// Settings
app.get('/api/settings', async (req, res) => {
    const settings = await db.prepare('SELECT * FROM settings').all();
    const settingsObj = settings.reduce((acc, s) => { acc[s.key] = s.value; return acc; }, {});
    res.json(settingsObj);
});

app.put('/api/admin/settings', authenticate, isAdmin, async (req, res) => {
    const { key, value } = req.body;
    await db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
    res.json({ success: true });
});

// Upload (Cloudinary only in serverless)
app.post('/api/admin/upload', authenticate, isAdmin, async (req, res) => {
    const { image, fileName } = req.body;
    if (!image) return res.status(400).json({ error: 'No media provided' });

    try {
        const mimeMatch = image.match(/^data:([^;]*);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : '';
        const isVideo = mimeType.startsWith('video/') || mimeType === 'application/mp4' || image.startsWith('data:video/') || (fileName && /\.(mp4|mov|avi|mkv|webm)$/i.test(fileName));

        const uploadRes = await cloudinary.uploader.upload(image, {
            resource_type: isVideo ? 'video' : 'image',
            folder: 'ohoofashion_media',
        });
        res.json({ url: uploadRes.secure_url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to upload media' });
    }
});

export const handler = serverless(app);
