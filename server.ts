import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ohoo-fashion-secret-2026';

// Initialize Database
const db = new Database('ohoo.db');

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS subcategories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL -- 'Men' or 'Kids'
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    subcategory_id INTEGER,
    images TEXT, -- JSON array of URLs
    video TEXT, -- Video URL
    stock INTEGER DEFAULT 0,
    sizes TEXT, -- JSON array of sizes
    attributes TEXT, -- JSON object of attributes (color, material, etc.)
    is_new BOOLEAN DEFAULT 0,
    is_trending BOOLEAN DEFAULT 0,
    is_featured BOOLEAN DEFAULT 0,
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

  -- Default settings
  INSERT OR IGNORE INTO settings (key, value) VALUES ('hero_banner_text', 'Spring Collection 2026 - Up to 50% Off');

  -- Default subcategories
  INSERT OR IGNORE INTO subcategories (name, category) VALUES ('Shirts', 'Men');
  INSERT OR IGNORE INTO subcategories (name, category) VALUES ('Pants', 'Men');
  INSERT OR IGNORE INTO subcategories (name, category) VALUES ('T-Shirts', 'Men');
  INSERT OR IGNORE INTO subcategories (name, category) VALUES ('Jeans', 'Men');
  INSERT OR IGNORE INTO subcategories (name, category) VALUES ('Hoodies', 'Men');
  INSERT OR IGNORE INTO subcategories (name, category) VALUES ('Accessories', 'Men');

  INSERT OR IGNORE INTO subcategories (name, category) VALUES ('Kids Shirts', 'Kids');
  INSERT OR IGNORE INTO subcategories (name, category) VALUES ('Kids Pants', 'Kids');
  INSERT OR IGNORE INTO subcategories (name, category) VALUES ('Kids T-Shirts', 'Kids');
  INSERT OR IGNORE INTO subcategories (name, category) VALUES ('Kids Shorts', 'Kids');
  INSERT OR IGNORE INTO subcategories (name, category) VALUES ('Traditional Wear', 'Kids');
  INSERT OR IGNORE INTO subcategories (name, category) VALUES ('Accessories', 'Kids');
`);

// Seed Admin User if not exists
const adminEmail = process.env.ADMIN_EMAIL || 'admin@ohoofashion.com';
const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
if (!existingAdmin) {
  const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Admin', adminEmail, hashedPassword, 'admin');
}

app.use(express.json({ limit: '50mb' }));

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
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

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
};

// --- API Routes ---

// Auth
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashedPassword);
    const token = jwt.sign({ id: result.lastInsertRowid, email, role: 'user' }, JWT_SECRET);
    res.json({ token, user: { id: result.lastInsertRowid, name, email, role: 'user' } });
  } catch (err: any) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// Subcategories
app.get('/api/subcategories', (req, res) => {
  const { category } = req.query;
  let query = 'SELECT * FROM subcategories';
  const params = [];
  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }
  const subs = db.prepare(query).all(...params);
  res.json(subs);
});

app.post('/api/admin/subcategories', authenticate, isAdmin, (req, res) => {
  const { name, category } = req.body;
  const result = db.prepare('INSERT INTO subcategories (name, category) VALUES (?, ?)').run(name, category);
  res.json({ id: result.lastInsertRowid });
});

app.put('/api/admin/subcategories/:id', authenticate, isAdmin, (req, res) => {
  const { name, category } = req.body;
  db.prepare('UPDATE subcategories SET name = ?, category = ? WHERE id = ?').run(name, category, req.params.id);
  res.json({ success: true });
});

app.delete('/api/admin/subcategories/:id', authenticate, isAdmin, (req, res) => {
  db.prepare('DELETE FROM subcategories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Products
app.get('/api/products', (req, res) => {
  const { category, subcategory_id, search, minPrice, maxPrice, type } = req.query;
  let query = 'SELECT p.*, s.name as subcategory_name FROM products p LEFT JOIN subcategories s ON p.subcategory_id = s.id WHERE 1=1';
  const params: any[] = [];

  if (category) {
    query += ' AND p.category = ?';
    params.push(category);
  }
  if (subcategory_id) {
    query += ' AND p.subcategory_id = ?';
    params.push(subcategory_id);
  }
  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (minPrice) {
    query += ' AND p.price >= ?';
    params.push(minPrice);
  }
  if (maxPrice) {
    query += ' AND p.price <= ?';
    params.push(maxPrice);
  }
  if (type === 'new') query += ' AND p.is_new = 1';
  if (type === 'trending') query += ' AND p.is_trending = 1';
  if (type === 'featured') query += ' AND p.is_featured = 1';

  const products = db.prepare(query).all(...params);
  res.json(products.map((p: any) => ({ 
    ...p, 
    images: JSON.parse(p.images || '[]'),
    sizes: JSON.parse(p.sizes || '[]'),
    attributes: JSON.parse(p.attributes || '{}')
  })));
});

app.get('/api/products/:id', (req, res) => {
  const product: any = db.prepare('SELECT p.*, s.name as subcategory_name FROM products p LEFT JOIN subcategories s ON p.subcategory_id = s.id WHERE p.id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ 
    ...product, 
    images: JSON.parse(product.images || '[]'),
    sizes: JSON.parse(product.sizes || '[]'),
    attributes: JSON.parse(product.attributes || '{}')
  });
});

// Admin Product CRUD
app.post('/api/admin/products', authenticate, isAdmin, (req, res) => {
  const { name, description, price, category, subcategory_id, images, video, stock, sizes, attributes, is_new, is_trending, is_featured } = req.body;
  const result = db.prepare(`
    INSERT INTO products (name, description, price, category, subcategory_id, images, video, stock, sizes, attributes, is_new, is_trending, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, description, price, category, subcategory_id, JSON.stringify(images), video, stock, JSON.stringify(sizes), JSON.stringify(attributes), is_new ? 1 : 0, is_trending ? 1 : 0, is_featured ? 1 : 0);
  res.json({ id: result.lastInsertRowid });
});

app.put('/api/admin/products/:id', authenticate, isAdmin, (req, res) => {
  const { name, description, price, category, subcategory_id, images, video, stock, sizes, attributes, is_new, is_trending, is_featured } = req.body;
  db.prepare(`
    UPDATE products SET name=?, description=?, price=?, category=?, subcategory_id=?, images=?, video=?, stock=?, sizes=?, attributes=?, is_new=?, is_trending=?, is_featured=?
    WHERE id=?
  `).run(name, description, price, category, subcategory_id, JSON.stringify(images), video, stock, JSON.stringify(sizes), JSON.stringify(attributes), is_new ? 1 : 0, is_trending ? 1 : 0, is_featured ? 1 : 0, req.params.id);
  res.json({ success: true });
});

app.delete('/api/admin/products/:id', authenticate, isAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Orders
app.post('/api/orders', authenticate, (req: any, res) => {
  const { items, total, address, city, zip } = req.body;
  const userId = req.user.id;

  const transaction = db.transaction(() => {
    const orderResult = db.prepare('INSERT INTO orders (user_id, total, address, city, zip) VALUES (?, ?, ?, ?, ?)').run(userId, total, address, city, zip);
    const orderId = orderResult.lastInsertRowid;

    for (const item of items) {
      db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price, size) VALUES (?, ?, ?, ?, ?)').run(orderId, item.id, item.quantity, item.price, item.size);
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.id);
    }
    return orderId;
  });

  try {
    const orderId = transaction();
    res.json({ orderId });
  } catch (err) {
    res.status(400).json({ error: 'Order failed' });
  }
});

app.get('/api/orders/history', authenticate, (req: any, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  const ordersWithItems = orders.map((order: any) => {
    const items = db.prepare(`
      SELECT oi.*, p.name as product_name, p.images 
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id = ?
    `).all(order.id);
    return { ...order, items: items.map((i: any) => ({ ...i, images: JSON.parse(i.images || '[]') })) };
  });
  res.json(ordersWithItems);
});

// Admin Orders
app.get('/api/admin/orders', authenticate, isAdmin, (req, res) => {
  const orders = db.prepare('SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.user_id = u.id ORDER BY created_at DESC').all();
  res.json(orders);
});

app.put('/api/admin/orders/:id/status', authenticate, isAdmin, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

// Admin Dashboard
app.get('/api/admin/dashboard', authenticate, isAdmin, (req, res) => {
  const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get() as any;
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get() as any;
  const dailySales = db.prepare("SELECT SUM(total) as sum FROM orders WHERE date(created_at) = date('now')").get() as any;
  const lowStock = db.prepare('SELECT * FROM products WHERE stock < 10').all();

  res.json({
    totalProducts: totalProducts.count,
    totalOrders: totalOrders.count,
    dailySales: dailySales.sum || 0,
    lowStock
  });
});

// Settings
app.get('/api/settings', (req, res) => {
  const settings = db.prepare('SELECT * FROM settings').all();
  const settingsObj = settings.reduce((acc: any, s: any) => {
    acc[s.key] = s.value;
    return acc;
  }, {});
  res.json(settingsObj);
});

app.put('/api/admin/settings', authenticate, isAdmin, (req, res) => {
  const { key, value } = req.body;
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
  res.json({ success: true });
});

// --- Vite Integration ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
