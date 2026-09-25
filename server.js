import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "buloqboshi2025";

const DATA_DIR = path.join(__dirname, "data");
const STORIES_FILE = path.join(DATA_DIR, "stories.json");
const PLACES_FILE = path.join(DATA_DIR, "places.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Papkalar va fayllar bo'lmasa yaratish
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(STORIES_FILE)) fs.writeFileSync(STORIES_FILE, "[]");
if (!fs.existsSync(PLACES_FILE)) fs.writeFileSync(PLACES_FILE, "[]");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Multer sozlash (rasm yuklash uchun)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = Date.now().toString(36) + Math.random().toString(36).slice(2, 8) + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Faqat rasm fayllari (jpg, png, webp, gif) qabul qilinadi"));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(UPLOADS_DIR));

// Rate limit
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Juda ko'p so'rov. Bir daqiqadan keyin urinib ko'ring." }
});

// ============ YORDAMCHI FUNKSIYALAR ============

function readStories() {
  try {
    return JSON.parse(fs.readFileSync(STORIES_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeStories(arr) {
  fs.writeFileSync(STORIES_FILE, JSON.stringify(arr, null, 2));
}

function readPlaces() {
  try {
    return JSON.parse(fs.readFileSync(PLACES_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writePlaces(arr) {
  fs.writeFileSync(PLACES_FILE, JSON.stringify(arr, null, 2));
}

function authMiddleware(req, res, next) {
  const pass = req.headers["x-admin-password"] || req.query.password;
  if (pass !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Ruxsat yo'q" });
  }
  next();
}

// ============ STORIES API ============

// Barcha tasdiqlangan hikoyalar (ommaviy)
app.get("/api/stories", (req, res) => {
  const stories = readStories().filter(s => s.approved);
  res.json(stories);
});

// Yangi hikoya qo'shish
app.post("/api/stories", limiter, upload.single("rasm"), (req, res) => {
  const { ism, email, matn } = req.body || {};

  if (!ism || ism.trim().length < 2) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: "Ism kamida 2 harf bo'lishi kerak" });
  }
  if (!matn || matn.trim().length < 10) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: "Xotira kamida 10 belgi bo'lishi kerak" });
  }
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: "Email formati noto'g'ri" });
  }

  const stories = readStories();
  const yangi = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    ism: ism.trim().slice(0, 60),
    email: email ? email.trim().slice(0, 80) : "",
    matn: matn.trim().slice(0, 2000),
    sana: new Date().toISOString(),
    approved: false,
    rasm: req.file ? "/uploads/" + req.file.filename : ""
  };
  stories.unshift(yangi);
  writeStories(stories);

  res.json({ ok: true, message: "Hikoyangiz qabul qilindi. Moderatsiyadan keyin chiqadi." });
});

// ============ STORIES ADMIN API ============

app.get("/api/admin/stories", authMiddleware, (req, res) => {
  res.json(readStories());
});

app.post("/api/admin/stories/:id/approve", authMiddleware, (req, res) => {
  const stories = readStories();
  const s = stories.find(x => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: "Topilmadi" });
  s.approved = true;
  writeStories(stories);
  res.json({ ok: true });
});

app.delete("/api/admin/stories/:id", authMiddleware, (req, res) => {
  const stories = readStories();
  const s = stories.find(x => x.id === req.params.id);
  if (s && s.rasm && s.rasm.startsWith("/uploads/")) {
    const filePath = path.join(UPLOADS_DIR, path.basename(s.rasm));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  const filtered = stories.filter(x => x.id !== req.params.id);
  writeStories(filtered);
  res.json({ ok: true });
});

// ============ PLACES API ============

// Barcha joylar (ommaviy)
app.get("/api/places", (req, res) => {
  res.json(readPlaces());
});

// Yangi joy qo'shish (admin)
app.post("/api/admin/places", authMiddleware, upload.single("rasm"), (req, res) => {
  const { nom, turi, tavsif, manzil, lat, lng } = req.body || {};

  if (!nom || nom.trim().length < 2) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: "Nom kamida 2 harf bo'lishi kerak" });
  }
  if (!turi) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: "Tur tanlanishi kerak" });
  }

  const places = readPlaces();
  const yangi = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    nom: nom.trim().slice(0, 80),
    turi: turi.trim(),
    tavsif: (tavsif || "").trim().slice(0, 500),
    manzil: (manzil || "").trim().slice(0, 120),
    lat: parseFloat(lat) || 39.6485,
    lng: parseFloat(lng) || 65.9761,
    rasm: req.file ? "/uploads/" + req.file.filename : ""
  };
  places.push(yangi);
  writePlaces(places);

  res.json({ ok: true, place: yangi });
});

// Joy o'chirish (admin)
app.delete("/api/admin/places/:id", authMiddleware, (req, res) => {
  const places = readPlaces();
  const p = places.find(x => x.id === req.params.id);
  if (p && p.rasm && p.rasm.startsWith("/uploads/")) {
    const filePath = path.join(UPLOADS_DIR, path.basename(p.rasm));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  const filtered = places.filter(x => x.id !== req.params.id);
  writePlaces(filtered);
  res.json({ ok: true });
});

// Barcha joylar (admin)
app.get("/api/admin/places", authMiddleware, (req, res) => {
  res.json(readPlaces());
});

// ============ LOGIN ============

app.post("/api/admin/login", (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) {
    return res.json({ ok: true });
  }
  res.status(401).json({ error: "Parol noto'g'ri" });
});

// ============ SPA FALLBACK ============

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ============ XATO USHLASH ============

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: "Fayl hajmi juda katta (5 MB dan oshmasin)" });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// ============ ISHGA TUSHIRISH ============

app.listen(PORT, () => {
  console.log(`✅ Server ishga tushdi: http://localhost:${PORT}`);
  console.log(`🔐 Admin: http://localhost:${PORT}/admin.html`);
});