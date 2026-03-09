import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@libsql/client";
import serverless from "serverless-http";

declare global {
  namespace Express {
    interface Request {
      file?: any;
    }
  }
}

dotenv.config();

const app = express();

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

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
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
}

// ---------------- AUTH ----------------

app.post("/api/auth/login", async (req, res) => {

  const { email, password } = req.body;

  const result = await db.execute({
    sql: "SELECT * FROM users WHERE email=?",
    args: [email]
  });

  const user: any = result.rows[0];

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

});

// ---------------- PRODUCTS ----------------

app.get("/api/products", async (req, res) => {

  const result = await db.execute("SELECT * FROM products");

  res.json(result.rows);

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

// 🔧 compatibility route (for admin panel)
app.post("/api/admin/upload", upload.single("file"), async (req, res) => {

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

// ---------------- STATIC FRONTEND ----------------

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ---------------- START SERVER ----------------

await initDB();

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

// ---------------- VERCEL EXPORT ----------------

export const handler = serverless(app);