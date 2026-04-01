const MONITOR_MAX = Number(process.env.MONITOR_MAX || 500);
const SENSOR_MAX = Number(process.env.SENSOR_MAX || 2000);

function trimTable(database, table, maxRows) {
  database.run(
    `DELETE FROM ${table} WHERE rowid NOT IN (SELECT rowid FROM ${table} ORDER BY rowid DESC LIMIT ?)`,
    [maxRows]
  );
}

function rowPet(r) {
  let traits = [];
  try {
    traits = JSON.parse(r.traits_json || '[]');
  } catch {
    traits = [];
  }
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    breed: r.breed,
    age: r.age,
    gender: r.gender,
    avatar: r.avatar,
    traits,
    health: r.health,
    status: r.status,
  };
}

function rowUser(r) {
  return {
    id: r.id,
    username: r.username,
    displayName: r.display_name,
    avatar: r.avatar,
    bio: r.bio,
    campus: r.campus,
    contact: r.contact,
  };
}

function allObjects(database, sql, params = []) {
  const stmt = database.prepare(sql);
  if (params && params.length) stmt.bind(params);
  const out = [];
  while (stmt.step()) {
    out.push(stmt.getAsObject());
  }
  stmt.free();
  return out;
}

class PawtraceRepository {
  constructor(getDb, persist) {
    this.getDb = getDb;
    this.persist = persist;
  }

  _db() {
    return this.getDb();
  }

  safePersist() {
    try {
      this.persist();
    } catch (err) {
      const code = String(err?.code || '');
      if (code === 'EPERM' || code === 'EACCES' || code === 'EROFS') {
        console.warn(`[db] persist skipped (${code}): ${err?.message || err}`);
        return;
      }
      throw err;
    }
  }

  listPets() {
    const rows = allObjects(this._db(), 'SELECT * FROM pets ORDER BY rowid ASC');
    return rows.map(rowPet);
  }

  getPet(id) {
    const stmt = this._db().prepare('SELECT * FROM pets WHERE id = ? LIMIT 1');
    stmt.bind([id]);
    let r = null;
    if (stmt.step()) r = stmt.getAsObject();
    stmt.free();
    return r ? rowPet(r) : null;
  }

  createPet(payload) {
    const petSprites = ['/assets/1.png', '/assets/2.png', '/assets/3.png', '/assets/4.png', '/assets/5.png', '/assets/6.png'];
    const randomSprite = petSprites[Math.floor(Math.random() * petSprites.length)];
    const traits = Array.isArray(payload.traits)
      ? payload.traits
      : String(payload.traits || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
    const newPet = {
      id: `p${Date.now()}`,
      name: payload.name,
      type: payload.type || 'Pet',
      breed: payload.breed || 'Unknown',
      age: payload.age || 'Unknown',
      gender: payload.gender || 'Unknown',
      avatar: payload.avatar || randomSprite,
      traits,
      health: payload.health || 'No health notes yet.',
      status: payload.status || 'Just joined the crew.',
    };
    this._db().run(
      `INSERT INTO pets (id, name, type, breed, age, gender, avatar, traits_json, health, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newPet.id,
        newPet.name,
        newPet.type,
        newPet.breed,
        newPet.age,
        newPet.gender,
        newPet.avatar,
        JSON.stringify(newPet.traits),
        newPet.health,
        newPet.status,
      ]
    );
    this.safePersist();
    return newPet;
  }

  deletePet(id) {
    this._db().run('DELETE FROM pets WHERE id = ?', [id]);
    this.safePersist();
  }

  listUsers() {
    const rows = allObjects(this._db(), 'SELECT * FROM users ORDER BY rowid ASC');
    return rows.map(rowUser);
  }

  findUserByIdOrUsername(input) {
    const value = String(input || '').trim();
    if (!value) return null;
    const stmt = this._db().prepare('SELECT * FROM users WHERE id = ? OR username = ? LIMIT 1');
    stmt.bind([value, value]);
    let r = null;
    if (stmt.step()) r = stmt.getAsObject();
    stmt.free();
    return r ? rowUser(r) : null;
  }

  resolveUserId(input) {
    const u = this.findUserByIdOrUsername(input);
    return u?.id || (String(input || '').trim() || null);
  }

  getChatHistory(contactId) {
    const rows = allObjects(
      this._db(),
      'SELECT role, content FROM chat_messages WHERE contact_id = ? ORDER BY id ASC',
      [contactId]
    );
    return rows.map((r) => ({ role: r.role, content: r.content }));
  }

  ensureChatHistory(contactId) {
    return this.getChatHistory(contactId);
  }

  appendChatTurns(contactId, messages, reply) {
    const db = this._db();
    const now = new Date().toISOString();
    const ins = db.prepare('INSERT INTO chat_messages (contact_id, role, content, created_at) VALUES (?, ?, ?, ?)');
    try {
      for (const m of messages) {
        ins.run([contactId, m.role, m.content, now]);
      }
      ins.run([contactId, 'assistant', reply, now]);
    } finally {
      ins.free();
    }
    this.safePersist();
  }

  getChatHistoryMap() {
    const rows = allObjects(this._db(), 'SELECT DISTINCT contact_id FROM chat_messages');
    const out = {};
    for (const { contact_id: cid } of rows) {
      out[cid] = this.getChatHistory(cid);
    }
    return out;
  }

  listStickyNotes() {
    const rows = allObjects(this._db(), 'SELECT * FROM sticky_notes ORDER BY rowid ASC');
    return rows.map((r) => ({ id: r.id, text: r.text, createdAt: r.created_at }));
  }

  addStickyNote(text) {
    const note = {
      id: `note-${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
    };
    this._db().run('INSERT INTO sticky_notes (id, text, created_at) VALUES (?, ?, ?)', [
      note.id,
      note.text,
      note.createdAt,
    ]);
    this.safePersist();
    return note;
  }

  deleteStickyNote(id) {
    this._db().run('DELETE FROM sticky_notes WHERE id = ?', [id]);
    this.safePersist();
  }

  clearStickyNotes() {
    this._db().run('DELETE FROM sticky_notes');
    this.safePersist();
  }

  getSetting(key) {
    const stmt = this._db().prepare('SELECT value FROM app_settings WHERE key = ? LIMIT 1');
    stmt.bind([key]);
    let v = null;
    if (stmt.step()) v = stmt.getAsObject().value;
    stmt.free();
    return v;
  }

  setSetting(key, value) {
    this._db().run('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)', [key, String(value)]);
    this.safePersist();
  }

  addLocationPoint(point) {
    this._db().run(
      `INSERT INTO location_points (id, source, tag_id, device_id, user_id, timestamp, lat, lon, accuracy, altitude, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        point.id,
        point.source || null,
        point.tagId || null,
        point.deviceId || null,
        point.userId || null,
        point.timestamp,
        point.lat,
        point.lon,
        point.accuracy != null ? point.accuracy : null,
        point.altitude != null ? point.altitude : null,
        new Date().toISOString(),
      ]
    );
    trimTable(this._db(), 'location_points', SENSOR_MAX);
    this.safePersist();
  }

  listLocationPoints(filters, max) {
    let rows = allObjects(this._db(), 'SELECT * FROM location_points ORDER BY rowid ASC');
    rows = rows.map((r) => ({
      id: r.id,
      source: r.source,
      tagId: r.tag_id,
      deviceId: r.device_id,
      userId: r.user_id,
      timestamp: r.timestamp,
      lat: r.lat,
      lon: r.lon,
      accuracy: r.accuracy,
      altitude: r.altitude,
    }));
    if (filters.deviceId) {
      rows = rows.filter((p) => p.deviceId === filters.deviceId);
    }
    if (filters.userId) {
      rows = rows.filter((p) => p.userId === filters.userId);
    }
    return rows.slice(-max);
  }

  setLastLocation(userId, payload) {
    this._db().run(
      `INSERT OR REPLACE INTO last_locations (user_id, lat, lon, accuracy, timestamp, source, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        payload.lat,
        payload.lon,
        payload.accuracy != null ? payload.accuracy : null,
        payload.timestamp,
        payload.source || 'app-gps',
        new Date().toISOString(),
      ]
    );
    this.safePersist();
  }

  getLastLocation(userId) {
    const stmt = this._db().prepare('SELECT * FROM last_locations WHERE user_id = ? LIMIT 1');
    stmt.bind([userId]);
    let r = null;
    if (stmt.step()) r = stmt.getAsObject();
    stmt.free();
    if (!r) return null;
    return {
      lat: r.lat,
      lon: r.lon,
      accuracy: r.accuracy,
      timestamp: r.timestamp,
      source: r.source,
      updatedAt: r.updated_at,
    };
  }

  getLastLocationsObject() {
    const rows = allObjects(this._db(), 'SELECT * FROM last_locations');
    const out = {};
    for (const r of rows) {
      out[r.user_id] = {
        lat: r.lat,
        lon: r.lon,
        accuracy: r.accuracy,
        timestamp: r.timestamp,
        source: r.source,
        updatedAt: r.updated_at,
      };
    }
    return out;
  }

  addHealthMeasurement(m) {
    this._db().run(
      `INSERT INTO health_measurements (
        id, device_id, user_id, tag_id, timestamp, heart_rate_bpm, sound_level_db, battery_pct, steps, temp_c, accel_peak, activity,
        lat, lon, location_accuracy, location_timestamp, quality, metadata_json, received_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        m.id,
        m.deviceId || null,
        m.userId || null,
        m.tagId || null,
        m.timestamp,
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
        m.receivedAt,
      ]
    );
    trimTable(this._db(), 'health_measurements', SENSOR_MAX);
    this.safePersist();
  }

  listHealthMeasurements(filters, max) {
    let rows = allObjects(this._db(), 'SELECT * FROM health_measurements ORDER BY rowid ASC');
    rows = rows.map((r) => {
      let metadata = null;
      try {
        metadata = r.metadata_json ? JSON.parse(r.metadata_json) : null;
      } catch {
        metadata = null;
      }
      return {
        id: r.id,
        deviceId: r.device_id,
        userId: r.user_id,
        tagId: r.tag_id,
        timestamp: r.timestamp,
        heartRateBpm: r.heart_rate_bpm,
        soundLevelDb: r.sound_level_db,
        batteryPct: r.battery_pct,
        steps: r.steps,
        tempC: r.temp_c,
        accelPeak: r.accel_peak,
        activity: r.activity,
        lat: r.lat,
        lon: r.lon,
        locationAccuracy: r.location_accuracy,
        locationTimestamp: r.location_timestamp,
        quality: r.quality,
        metadata,
        receivedAt: r.received_at,
      };
    });
    if (filters.deviceId) {
      rows = rows.filter((x) => x.deviceId === filters.deviceId);
    }
    if (filters.userId) {
      rows = rows.filter((x) => x.userId === filters.userId);
    }
    return rows.slice(-max);
  }

  getPublicCard(userId, petId) {
    const user = this.findUserByIdOrUsername(userId);
    const pet = this.getPet(petId);
    if (!user || !pet) return null;
    return {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        contact: user.contact,
        campus: user.campus,
        bio: user.bio,
      },
      pet: {
        id: pet.id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: pet.age,
        gender: pet.gender,
        avatar: pet.avatar,
        status: pet.status,
        health: pet.health,
      },
    };
  }

  recordChatForMonitoring(contactId, messages, reply) {
    const id = `chat-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    this._db().run(
      'INSERT INTO monitoring_chat_logs (id, contact_id, messages_json, reply, captured_at) VALUES (?, ?, ?, ?, ?)',
      [id, contactId, JSON.stringify(messages), reply, new Date().toISOString()]
    );
    trimTable(this._db(), 'monitoring_chat_logs', MONITOR_MAX);
    this.safePersist();
  }

  monitoringAppendUserProfile(payload) {
    const id = `profile-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const capturedAt = new Date().toISOString();
    this._db().run(
      'INSERT INTO monitoring_user_profiles (id, captured_at, profile_json, personal_info_json, metadata_json) VALUES (?, ?, ?, ?, ?)',
      [
        id,
        capturedAt,
        JSON.stringify(payload.userProfile || {}),
        payload.personalInfo ? JSON.stringify(payload.personalInfo) : null,
        payload.metadata ? JSON.stringify(payload.metadata) : null,
      ]
    );
    trimTable(this._db(), 'monitoring_user_profiles', MONITOR_MAX);
    this.safePersist();
  }

  monitoringAppendPetProfiles(ownerLabel, pets, metadata) {
    const capturedAt = new Date().toISOString();
    const ins = this._db().prepare(
      'INSERT INTO monitoring_pet_profiles (id, captured_at, owner_label, pet_json, metadata_json) VALUES (?, ?, ?, ?, ?)'
    );
    try {
      for (const pet of pets) {
        const id = `pet-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        ins.run([id, capturedAt, ownerLabel, JSON.stringify(pet), metadata ? JSON.stringify(metadata) : null]);
      }
    } finally {
      ins.free();
    }
    trimTable(this._db(), 'monitoring_pet_profiles', MONITOR_MAX);
    this.safePersist();
  }

  monitoringAppendPurchases(items, metadata) {
    const capturedAt = new Date().toISOString();
    const ins = this._db().prepare(
      'INSERT INTO monitoring_purchases (id, captured_at, purchase_json, metadata_json) VALUES (?, ?, ?, ?)'
    );
    try {
      for (const item of items) {
        const id = item.id || `purchase-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        ins.run([id, capturedAt, JSON.stringify(item), metadata ? JSON.stringify(metadata) : null]);
      }
    } finally {
      ins.free();
    }
    trimTable(this._db(), 'monitoring_purchases', MONITOR_MAX);
    this.safePersist();
  }

  getMonitoringOverview() {
    const db = this._db();
    const mapProfile = (r) => ({
      id: r.id,
      capturedAt: r.captured_at,
      profile: JSON.parse(r.profile_json || '{}'),
      ...(r.personal_info_json ? { personalInfo: JSON.parse(r.personal_info_json) } : {}),
      ...(r.metadata_json ? { metadata: JSON.parse(r.metadata_json) } : {}),
    });
    const mapPet = (r) => ({
      id: r.id,
      capturedAt: r.captured_at,
      owner: r.owner_label,
      pet: JSON.parse(r.pet_json || '{}'),
      ...(r.metadata_json ? { metadata: JSON.parse(r.metadata_json) } : {}),
    });
    const mapPur = (r) => ({
      id: r.id,
      capturedAt: r.captured_at,
      purchase: JSON.parse(r.purchase_json || '{}'),
      ...(r.metadata_json ? { metadata: JSON.parse(r.metadata_json) } : {}),
    });
    const mapChat = (r) => ({
      id: r.id,
      contactId: r.contact_id,
      messages: JSON.parse(r.messages_json || '[]'),
      reply: r.reply,
      capturedAt: r.captured_at,
    });
    return {
      userProfiles: allObjects(db, 'SELECT * FROM monitoring_user_profiles ORDER BY rowid ASC').map(mapProfile),
      petProfiles: allObjects(db, 'SELECT * FROM monitoring_pet_profiles ORDER BY rowid ASC').map(mapPet),
      purchases: allObjects(db, 'SELECT * FROM monitoring_purchases ORDER BY rowid ASC').map(mapPur),
      chatLogs: allObjects(db, 'SELECT * FROM monitoring_chat_logs ORDER BY rowid ASC').map(mapChat),
    };
  }

  seedDemoIfEmpty(defaultPets, defaultUsers) {
    const db = this._db();
    const c = db.exec('SELECT COUNT(*) AS n FROM pets');
    const n = c.length && c[0].values[0] ? Number(c[0].values[0][0]) : 0;
    if (n > 0) return;

    const insPet = db.prepare(
      `INSERT INTO pets (id, name, type, breed, age, gender, avatar, traits_json, health, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const insUser = db.prepare(
      `INSERT INTO users (id, username, display_name, avatar, bio, campus, contact)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    try {
      for (const p of defaultPets) {
        insPet.run([
          p.id,
          p.name,
          p.type,
          p.breed,
          p.age,
          p.gender,
          p.avatar,
          JSON.stringify(p.traits || []),
          p.health,
          p.status,
        ]);
      }
      for (const u of defaultUsers) {
        insUser.run([u.id, u.username, u.displayName, u.avatar || '', u.bio, u.campus, u.contact]);
      }
    } finally {
      insPet.free();
      insUser.free();
    }
    this.setSetting('nextPetId', String((defaultPets.length || 0) + 1));
    this.safePersist();
  }
}

module.exports = { PawtraceRepository, MONITOR_MAX, SENSOR_MAX };
