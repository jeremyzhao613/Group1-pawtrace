const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const dataDir = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(dataDir, 'pawtrace.sqlite');

let SQL = null;
let db = null;

function persist() {
  if (!db) return;
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function runSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS pets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT,
      breed TEXT,
      age TEXT,
      gender TEXT,
      avatar TEXT,
      traits_json TEXT,
      health TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      display_name TEXT,
      avatar TEXT,
      bio TEXT,
      campus TEXT,
      contact TEXT
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_chat_contact ON chat_messages(contact_id);

    CREATE TABLE IF NOT EXISTS sticky_notes (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS location_points (
      id TEXT PRIMARY KEY,
      source TEXT,
      tag_id TEXT,
      device_id TEXT,
      user_id TEXT,
      timestamp TEXT NOT NULL,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      accuracy REAL,
      altitude REAL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_loc_user ON location_points(user_id);
    CREATE INDEX IF NOT EXISTS idx_loc_device ON location_points(device_id);

    CREATE TABLE IF NOT EXISTS health_measurements (
      id TEXT PRIMARY KEY,
      device_id TEXT,
      user_id TEXT,
      tag_id TEXT,
      timestamp TEXT NOT NULL,
      heart_rate_bpm REAL,
      sound_level_db REAL,
      battery_pct REAL,
      steps REAL,
      temp_c REAL,
      accel_peak REAL,
      activity TEXT,
      lat REAL,
      lon REAL,
      location_accuracy REAL,
      location_timestamp TEXT,
      quality TEXT,
      metadata_json TEXT,
      received_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_health_user ON health_measurements(user_id);

    CREATE TABLE IF NOT EXISTS last_locations (
      user_id TEXT PRIMARY KEY,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      accuracy REAL,
      timestamp TEXT,
      source TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS monitoring_user_profiles (
      id TEXT PRIMARY KEY,
      captured_at TEXT NOT NULL,
      profile_json TEXT NOT NULL,
      personal_info_json TEXT,
      metadata_json TEXT
    );

    CREATE TABLE IF NOT EXISTS monitoring_pet_profiles (
      id TEXT PRIMARY KEY,
      captured_at TEXT NOT NULL,
      owner_label TEXT,
      pet_json TEXT NOT NULL,
      metadata_json TEXT
    );

    CREATE TABLE IF NOT EXISTS monitoring_purchases (
      id TEXT PRIMARY KEY,
      captured_at TEXT NOT NULL,
      purchase_json TEXT NOT NULL,
      metadata_json TEXT
    );

    CREATE TABLE IF NOT EXISTS monitoring_chat_logs (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      messages_json TEXT NOT NULL,
      reply TEXT,
      captured_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS nfc_events (
      id TEXT PRIMARY KEY,
      event_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

async function openDatabase() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }
  runSchema(db);
  return db;
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized; call openDatabase() first');
  }
  return db;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  DB_PATH,
  dataDir,
  openDatabase,
  getDb,
  persist,
  closeDatabase,
};
