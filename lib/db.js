import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'tutor-app.db');

let db;

export function getDb() {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      console.log(`Creating database directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
    console.log(`Connecting to database at: ${DB_PATH}`);
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDb(db);
  }
  return db;
}
function initializeDb(db) {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student', 'tutor')),
        zip_code TEXT DEFAULT '',
        timezone TEXT DEFAULT '',
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
        student_id INTEGER, -- Kept for backward compatibility, nullable for group chats
        tutor_id INTEGER,   -- Kept for backward compatibility, nullable for group chats
        is_group INTEGER DEFAULT 0,
        name TEXT,
        last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (tutor_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS conversation_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(conversation_id, user_id)
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
        receiver_id INTEGER, -- Nullable for group sessions
        is_group INTEGER DEFAULT 0,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        format TEXT DEFAULT 'online',
        status TEXT DEFAULT 'pending',
        subjects TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id),
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
      );
    `);
    console.log("Core tables initialized successfully.");
  } catch (e) {
    console.error("Core initialization error:", e);
    // Continue even if this fails, as individual routes might try to handle it
  }

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
    
    // Check users table for zip_code and timezone
    const userColumns = db.pragma('table_info(users)');
    if (userColumns.length > 0) {
      if (!userColumns.some(col => col.name === 'zip_code')) {
        db.exec("ALTER TABLE users ADD COLUMN zip_code TEXT DEFAULT ''");
      }
      if (!userColumns.some(col => col.name === 'timezone')) {
        db.exec("ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT ''");
      }
    }

    // Check conversations table for group columns and constraints
    const convColumns = db.pragma('table_info(conversations)');
    if (convColumns.length > 0) {
      if (!convColumns.some(col => col.name === 'is_group')) {
        db.exec("ALTER TABLE conversations ADD COLUMN is_group INTEGER DEFAULT 0");
      }
      if (!convColumns.some(col => col.name === 'name')) {
        db.exec("ALTER TABLE conversations ADD COLUMN name TEXT");
      }
      
      // If student_id is NOT NULL, we need to migrate the table to make it nullable
      const studentIdCol = convColumns.find(col => col.name === 'student_id');
      if (studentIdCol && studentIdCol.notnull === 1) {
        console.log("Migrating conversations table to allow nullable student_id/tutor_id...");
        db.exec("PRAGMA foreign_keys = OFF");
        db.exec(`
          CREATE TABLE conversations_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            tutor_id INTEGER,
            is_group INTEGER DEFAULT 0,
            name TEXT,
            last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id),
            FOREIGN KEY (tutor_id) REFERENCES users(id)
          );
          INSERT INTO conversations_new (id, student_id, tutor_id, is_group, name, last_message_at)
          SELECT id, student_id, tutor_id, is_group, name, last_message_at FROM conversations;
          DROP TABLE conversations;
          ALTER TABLE conversations_new RENAME TO conversations;
        `);
        db.exec("PRAGMA foreign_keys = ON");
      }
    }

    // Check sessions table for format column
    const sessionColumns = db.pragma('table_info(sessions)');
    if (sessionColumns.length > 0) {
      if (!sessionColumns.some(col => col.name === 'format')) {
        db.exec("ALTER TABLE sessions ADD COLUMN format TEXT DEFAULT 'online'");
      }
      if (!sessionColumns.some(col => col.name === 'subjects')) {
        db.exec("ALTER TABLE sessions ADD COLUMN subjects TEXT DEFAULT '[]'");
      }
      if (!sessionColumns.some(col => col.name === 'is_group')) {
        db.exec("ALTER TABLE sessions ADD COLUMN is_group INTEGER DEFAULT 0");
      }

      // If receiver_id is NOT NULL, we need to migrate the table to make it nullable
      const receiverIdCol = sessionColumns.find(col => col.name === 'receiver_id');
      if (receiverIdCol && receiverIdCol.notnull === 1) {
        console.log("Migrating sessions table to allow nullable receiver_id...");
        db.exec("PRAGMA foreign_keys = OFF");
        db.exec(`
          CREATE TABLE sessions_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER,
            is_group INTEGER DEFAULT 0,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            duration_minutes INTEGER NOT NULL,
            format TEXT DEFAULT 'online',
            status TEXT DEFAULT 'pending',
            subjects TEXT DEFAULT '[]',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id),
            FOREIGN KEY (sender_id) REFERENCES users(id),
            FOREIGN KEY (receiver_id) REFERENCES users(id)
          );
          INSERT INTO sessions_new (id, conversation_id, sender_id, receiver_id, is_group, date, time, duration_minutes, format, status, subjects, created_at)
          SELECT id, conversation_id, sender_id, receiver_id, is_group, date, time, duration_minutes, format, status, subjects, created_at FROM sessions;
          DROP TABLE sessions;
          ALTER TABLE sessions_new RENAME TO sessions;
        `);
        db.exec("PRAGMA foreign_keys = ON");
      }
    }

    // Migration: Populate conversation_participants for existing 1-to-1 conversations
    const existingPats = db.prepare('SELECT COUNT(*) as count FROM conversation_participants').get();
    if (existingPats.count === 0) {
      const conversations = db.prepare('SELECT id, student_id, tutor_id FROM conversations').all();
      const insertParticipant = db.prepare('INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)');
      
      const transaction = db.transaction((convs) => {
        for (const conv of convs) {
          if (conv.student_id) insertParticipant.run(conv.id, conv.student_id);
          if (conv.tutor_id) insertParticipant.run(conv.id, conv.tutor_id);
        }
      });
      transaction(conversations);
    }
  } catch (e) {
    console.error("Migration error:", e);
  }
}

export default getDb;
