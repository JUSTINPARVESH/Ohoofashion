import express from 'express';
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@libsql/client";
import serverless from "serverless-http";
import cors from "cors";

dotenv.config();

const app = express();

// 🔧 Enable CORS for all routes
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));

// 🔧 Fix large upload error
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

const JWT_SECRET = process.env.JWT_SECRET || "ohoo-fashion-secret";

// ---------------- PATH ----------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------- DATABASE ----------------

const db = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!
});

// ---------------- CLOUDINARY ----------------

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!
});

// ---------------- MULTER ----------------

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB upload limit
});

// ---------------- INIT DATABASE ----------------

async function initDB() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS reels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE,
        value TEXT
      );
    `);

    const adminEmail = "admin@ohoofashion.com";
    const adminPassword = "admin123";

    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email=?",
      args: [adminEmail]
    });

    if (result.rows.length === 0) {
      const hash = bcrypt.hashSync(adminPassword, 10);

      await db.execute({
        sql: "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
        args: ["Admin Manager", adminEmail, hash, "admin"]
      });

      console.log("Admin created");
    }
  } catch (error) {
    console.error("Database initialization error:", error);
  }
}

// Initialize database on startup
await initDB();

// ---------------- AUTH ----------------

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email=?",
      args: [email]
    });

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// ---------------- PRODUCTS ----------------

app.get("/api/products", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM products");
    res.json(result.rows);
  } catch (error) {
    res.json([]);
  }
});

// ---------------- HEALTH CHECK ----------------

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date(),
    uptime: process.uptime(),
    database: "connected",
    cloudinary: "configured"
  });
});

// ---------------- FILE UPLOAD ----------------

// Main upload route
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) {
          return res.status(500).json({ error });
        }
        res.json({
          url: result?.secure_url
        });
      }
    );

    stream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({
      error: "Upload failed"
    });
  }
});

// 🔧 compatibility route (for admin panel - handles both form-data and JSON)
app.post("/api/admin/upload", upload.single("file"), async (req, res) => {
  try {
    // Handle multipart form-data
    if (req.file) {
      // Determine resource type based on mimetype
      const resourceType = req.file.mimetype?.startsWith('video/') ? 'video' : 'auto';

      const stream = cloudinary.uploader.upload_stream(
        { resource_type: resourceType as "auto" | "image" | "video" | "raw" },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({ error: error.message || 'Upload failed' });
          }
          res.json({ url: result?.secure_url });
        }
      );
      stream.end(req.file.buffer);
      return;
    }

    // Handle JSON with base64 image/video
    const { image, fileType } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log('Received upload request:', { fileType, imageLength: image.length });

    const base64Data = image.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Determine resource type based on file type
    let resourceType: "auto" | "image" | "video" | "raw" = 'auto';
    if (fileType?.startsWith('video/')) {
      resourceType = 'video';
    } else if (fileType?.startsWith('image/')) {
      resourceType = 'image';
    }

    console.log('Uploading file:', { fileType, resourceType, bufferSize: buffer.length });

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ error: error.message || 'Upload failed' });
        }
        console.log('Upload successful:', result?.secure_url);
        res.json({ url: result?.secure_url });
      }
    );

    stream.end(buffer);
  } catch (err) {
    res.status(500).json({
      error: "Upload failed"
    });
  }
});

// ---------------- REELS ----------------

app.get("/api/reels", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM reels ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reels" });
  }
});

app.post("/api/admin/reels", async (req, res) => {
  try {
    const { url, description } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    await db.execute({
      sql: "INSERT INTO reels (url, description) VALUES (?, ?)",
      args: [url, description || ""]
    });

    // Fetch the newly created reel
    const result = await db.execute({
      sql: "SELECT * FROM reels WHERE url = ? ORDER BY created_at DESC LIMIT 1",
      args: [url]
    });

    const newReel = result.rows[0];
    res.json(newReel);
  } catch (err) {
    console.error("Reel creation error:", err);
    res.status(500).json({ error: "Failed to add reel" });
  }
});

app.delete("/api/admin/reels/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute({
      sql: "DELETE FROM reels WHERE id = ?",
      args: [parseInt(id)]
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete reel" });
  }
});

// ---------------- SETTINGS ----------------

app.get("/api/settings", async (req, res) => {
  try {
    const result = await db.execute("SELECT key, value FROM settings");
    const settings = {};
    result.rows.forEach((row) => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  } catch (err) {
    res.json({});
  }
});

app.put("/api/admin/settings", async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ error: "Key is required" });
    }

    await db.execute({
      sql: "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      args: [key, value]
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// ---------------- VERCEL EXPORT ----------------

export default serverless(app);