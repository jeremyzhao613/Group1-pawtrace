const fs = require('fs');
const path = require('path');
const { getDb, persist, dataDir } = require('./sqljsDatabase');

const JSON_PATH = path.join(dataDir, 'pawtrace-db.json');

function countPets(database) {
  const r = database.exec('SELECT COUNT(*) AS c FROM pets');
  if (!r.length || !r[0].values.length) return 0;
  return Number(r[0].values[0][0]) || 0;
}

/**
 * One-time import from legacy lowdb JSON when SQLite is empty.
 */
function migrateFromJsonIfNeeded() {
  const database = getDb();
  if (countPets(database) > 0) return false;
  if (!fs.existsSync(JSON_PATH)) return false;

  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  } catch {
    return false;
  }

  database.run('BEGIN');
  try {
    (raw.pets || []).forEach((p) => {
      database.run(
        `INSERT OR REPLACE INTO pets (id, name, type, breed, age, gender, avatar, traits_json, health, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.name,
          p.type || null,
          p.breed || null,
          p.age || null,
          p.gender || null,
          p.avatar || null,
          JSON.stringify(Array.isArray(p.traits) ? p.traits : []),
          p.health || null,
          p.status || null,
        ]
      );
    });

    (raw.users || []).forEach((u) => {
      database.run(
        `INSERT OR REPLACE INTO users (id, username, display_name, avatar, bio, campus, contact)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [u.id, u.username || null, u.displayName || null, u.avatar || null, u.bio || null, u.campus || null, u.contact || null]
      );
    });

    (raw.stickyNotes || []).forEach((n) => {
      database.run('INSERT OR REPLACE INTO sticky_notes (id, text, created_at) VALUES (?, ?, ?)', [
        n.id,
        n.text,
        n.createdAt || new Date().toISOString(),
      ]);
    });

    (raw.locationPoints || []).forEach((p) => {
      database.run(
        `INSERT OR REPLACE INTO location_points (id, source, tag_id, device_id, user_id, timestamp, lat, lon, accuracy, altitude, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.source || null,
          p.tagId || null,
          p.deviceId || null,
          p.userId || null,
          p.timestamp || new Date().toISOString(),
          p.lat,
          p.lon,
          p.accuracy != null ? p.accuracy : null,
          p.altitude != null ? p.altitude : null,
          new Date().toISOString(),
        ]
      );
    });

    (raw.healthMeasurements || []).forEach((m) => {
      database.run(
        `INSERT OR REPLACE INTO health_measurements (
          id, device_id, user_id, tag_id, timestamp, heart_rate_bpm, sound_level_db, battery_pct, steps, temp_c, accel_peak, activity,
          lat, lon, location_accuracy, location_timestamp, quality, metadata_json, received_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.id,
          m.deviceId || null,
          m.userId || null,
          m.tagId || null,
          m.timestamp || new Date().toISOString(),
          m.heartRateBpm != null ? m.heartRateBpm : null,
          m.soundLevelDb != null ? m.soundLevelDb : null,
          m.batteryPct != null ? m.batteryPct : null,
          m.steps != null ? m.steps : null,
          m.tempC != null ? m.tempC : null,
          m.accelPeak != null ? m.accelPeak : null,
          m.activity || null,
          m.lat != null ? m.lat : null,
          m.lon != null ? m.lon : null,
          m.locationAccuracy != null ? m.locationAccuracy : null,
          m.locationTimestamp || null,
          m.quality != null ? String(m.quality) : null,
          m.metadata ? JSON.stringify(m.metadata) : null,
          m.receivedAt || new Date().toISOString(),
        ]
      );
    });

    const ll = raw.lastLocations || {};
    Object.entries(ll).forEach(([userId, v]) => {
      database.run(
        `INSERT OR REPLACE INTO last_locations (user_id, lat, lon, accuracy, timestamp, source, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          v.lat,
          v.lon,
          v.accuracy != null ? v.accuracy : null,
          v.timestamp || null,
          v.source || null,
          v.updatedAt || new Date().toISOString(),
        ]
      );
    });

    const hist = raw.chatHistory || {};
    Object.entries(hist).forEach(([contactId, messages]) => {
      if (!Array.isArray(messages)) return;
      const now = new Date().toISOString();
      messages.forEach((msg) => {
        database.run('INSERT INTO chat_messages (contact_id, role, content, created_at) VALUES (?, ?, ?, ?)', [
          contactId,
          msg.role === 'assistant' ? 'assistant' : 'user',
          typeof msg.content === 'string' ? msg.content : '',
          now,
        ]);
      });
    });

    const mon = raw.monitoring;
    if (mon && typeof mon === 'object') {
      (mon.userProfiles || []).forEach((row) => {
        database.run(
          'INSERT OR REPLACE INTO monitoring_user_profiles (id, captured_at, profile_json, personal_info_json, metadata_json) VALUES (?, ?, ?, ?, ?)',
          [
            row.id,
            row.capturedAt,
            JSON.stringify(row.profile || {}),
            row.personalInfo ? JSON.stringify(row.personalInfo) : null,
            row.metadata ? JSON.stringify(row.metadata) : null,
          ]
        );
      });
      (mon.petProfiles || []).forEach((row) => {
        database.run(
          'INSERT OR REPLACE INTO monitoring_pet_profiles (id, captured_at, owner_label, pet_json, metadata_json) VALUES (?, ?, ?, ?, ?)',
          [
            row.id,
            row.capturedAt,
            row.owner || null,
            JSON.stringify(row.pet || {}),
            row.metadata ? JSON.stringify(row.metadata) : null,
          ]
        );
      });
      (mon.purchases || []).forEach((row) => {
        database.run(
          'INSERT OR REPLACE INTO monitoring_purchases (id, captured_at, purchase_json, metadata_json) VALUES (?, ?, ?, ?)',
          [
            row.id,
            row.capturedAt,
            JSON.stringify(row.purchase || {}),
            row.metadata ? JSON.stringify(row.metadata) : null,
          ]
        );
      });
      (mon.chatLogs || []).forEach((row) => {
        database.run(
          'INSERT OR REPLACE INTO monitoring_chat_logs (id, contact_id, messages_json, reply, captured_at) VALUES (?, ?, ?, ?, ?)',
          [
            row.id,
            row.contactId,
            JSON.stringify(row.messages || []),
            row.reply || '',
            row.capturedAt,
          ]
        );
      });
    }

    if (raw.settings && raw.settings.nextPetId != null) {
      database.run('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)', [
        'nextPetId',
        String(raw.settings.nextPetId),
      ]);
    }

    database.run('COMMIT');
  } catch (e) {
    database.run('ROLLBACK');
    throw e;
  }

  persist();
  return true;
}

module.exports = { migrateFromJsonIfNeeded, JSON_PATH };
