import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'tutor-app.db');

let db;

export function getDb() {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDb(db);
  }
  return db;
}

function initializeDb(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'tutor')),
      onboarded INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      age INTEGER,
      grade TEXT DEFAULT '',
      school TEXT DEFAULT '',
      zip_code TEXT DEFAULT '',
      format_pref TEXT DEFAULT 'online',
      subjects TEXT DEFAULT '[]',
      photo_url TEXT DEFAULT '',
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS tutor_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      age INTEGER,
      zip_code TEXT DEFAULT '',
      subjects TEXT DEFAULT '[]',
      skills TEXT DEFAULT '',
      format_type TEXT DEFAULT 'online',
      bio TEXT DEFAULT '',
      photo_url TEXT DEFAULT '',
      grade_levels TEXT DEFAULT '[]',
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      tutor_id INTEGER NOT NULL,
      last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (tutor_id) REFERENCES users(id),
      UNIQUE(student_id, tutor_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      type TEXT DEFAULT 'text',
      reference_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id),
      FOREIGN KEY (sender_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      format TEXT DEFAULT 'online',
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id),
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id)
    );
  `);

  try {
    const columns = db.pragma('table_info(messages)');
    if (columns.length > 0) {
      if (!columns.some(col => col.name === 'type')) {
        db.exec("ALTER TABLE messages ADD COLUMN type TEXT DEFAULT 'text'");
      }
      if (!columns.some(col => col.name === 'reference_id')) {
        db.exec("ALTER TABLE messages ADD COLUMN reference_id INTEGER");
      }
    }
    
    // Check sessions table for format column
    const sessionColumns = db.pragma('table_info(sessions)');
    if (sessionColumns.length > 0) {
      if (!sessionColumns.some(col => col.name === 'format')) {
        db.exec("ALTER TABLE sessions ADD COLUMN format TEXT DEFAULT 'online'");
      }
    }
  } catch (e) {
    console.error("Migration error:", e);
  }
}

export default getDb;
