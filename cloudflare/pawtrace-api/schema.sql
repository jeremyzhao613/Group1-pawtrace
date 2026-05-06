CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  campus TEXT DEFAULT '',
  contact TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY,
  owner_id TEXT,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Pet',
  breed TEXT DEFAULT 'Unknown',
  age TEXT DEFAULT 'Unknown',
  gender TEXT DEFAULT 'Unknown',
  avatar TEXT DEFAULT '/assets/1.png',
  traits TEXT DEFAULT '[]',
  health TEXT DEFAULT '',
  status TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nfc_pet_cards (
  id TEXT PRIMARY KEY,
  owner_id TEXT,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nfc_pet_cards_owner ON nfc_pet_cards(owner_id);

CREATE TABLE IF NOT EXISTS health_measurements (
  id TEXT PRIMARY KEY,
  device_id TEXT,
  user_id TEXT,
  tag_id TEXT,
  timestamp TEXT NOT NULL,
  heart_rate_bpm REAL,
  battery_pct REAL,
  temp_c REAL,
  accel_peak REAL,
  activity TEXT,
  lat REAL,
  lon REAL,
  metadata TEXT DEFAULT '{}',
  received_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_health_user_created ON health_measurements(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_device_created ON health_measurements(device_id, created_at DESC);

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
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_location_user_created ON location_points(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  contact_id TEXT,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_contact_created ON chat_messages(user_id, contact_id, created_at ASC);

CREATE TABLE IF NOT EXISTS monitor_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS device_commands (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  user_id TEXT,
  type TEXT NOT NULL DEFAULT 'message',
  message TEXT DEFAULT '',
  payload TEXT DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  delivered_at TEXT,
  acked_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_device_commands_pending ON device_commands(device_id, status, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_device_commands_user_created ON device_commands(user_id, created_at DESC);
