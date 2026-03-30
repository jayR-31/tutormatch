const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(process.cwd(), 'data', 'tutor-app.db');

async function seed() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  console.log('Checking schema...');
  const convColumns = db.pragma('table_info(conversations)');
  const studentIdCol = convColumns.find(col => col.name === 'student_id');
  
  if (studentIdCol && studentIdCol.notnull === 1) {
    console.log("Migrating conversations table to allow nullable student_id/tutor_id...");
    db.exec("PRAGMA foreign_keys = OFF");
    db.exec(`
      DROP TABLE IF EXISTS conversations_new;
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
      SELECT id, student_id, tutor_id, 
             COALESCE(is_group, 0), 
             name, 
             last_message_at 
      FROM conversations;
      DROP TABLE conversations;
      ALTER TABLE conversations_new RENAME TO conversations;
    `);
    db.exec("PRAGMA foreign_keys = ON");
    console.log("Migration complete.");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS conversation_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(conversation_id, user_id)
    );
  `);

  try {
    db.exec("ALTER TABLE sessions ADD COLUMN is_group INTEGER DEFAULT 0");
  } catch(e) {}

  const saltCount = 10;
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, saltCount);

  console.log('Seeding demo accounts...');

  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, role, onboarded, zip_code) 
    VALUES (?, ?, ?, 1, '10001')
  `);

  const insertStudentProfile = db.prepare(`
    INSERT INTO student_profiles (user_id, name, age, grade, subjects, format_pref, zip_code) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTutorProfile = db.prepare(`
    INSERT INTO tutor_profiles (user_id, name, age, subjects, skills, format_type, bio, zip_code) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 1. Create 1 Tutor
  let tutorId;
  const tutorEmail = 'demo.tutor@example.com';
  try {
    const res = insertUser.run(tutorEmail, hashedPassword, 'tutor');
    tutorId = res.lastInsertRowid;
    insertTutorProfile.run(
      tutorId, 
      'Expert Alex', 
      35, 
      JSON.stringify(['Math', 'Science']), 
      'Advanced Calculus, Physics', 
      'online', 
      'Experienced tutor for competitive exams.',
      '10001'
    );
    console.log('Created tutor: Expert Alex');
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log('Tutor already exists');
      const user = db.prepare('SELECT id FROM users WHERE email = ?').get(tutorEmail);
      tutorId = user.id;
    } else throw e;
  }

  // 2. Create 5 Students
  const students = [
    { email: 'student1@example.com', name: 'Alice Smith', age: 15, grade: '10th' },
    { email: 'student2@example.com', name: 'Bob Johnson', age: 14, grade: '9th' },
    { email: 'student3@example.com', name: 'Charlie Brown', age: 16, grade: '11th' },
    { email: 'student4@example.com', name: 'Daisy Miller', age: 17, grade: '12th' },
    { email: 'student5@example.com', name: 'Ethan Hunt', age: 13, grade: '8th' }
  ];

  const studentIds = [];
  for (const s of students) {
    let studentId;
    try {
      const res = insertUser.run(s.email, hashedPassword, 'student');
      studentId = res.lastInsertRowid;
      insertStudentProfile.run(
        studentId, 
        s.name, 
        s.age, 
        s.grade, 
        JSON.stringify(['Math']), 
        'online',
        '10001'
      );
      console.log(`Created student: ${s.name}`);
    } catch (e) {
      if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        process.stdout.write('.');
        const user = db.prepare('SELECT id FROM users WHERE email = ?').get(s.email);
        studentId = user.id;
      } else throw e;
    }
    studentIds.push(studentId);

    // 3. Create 1-to-1 conversation with tutor for each student if not exists
    const existingConv = db.prepare('SELECT id FROM conversations WHERE 0 < (SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = conversations.id AND user_id = ?) AND 0 < (SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = conversations.id AND user_id = ?) AND is_group = 0').get(studentId, tutorId);
    if (!existingConv) {
      const convRes = db.prepare('INSERT INTO conversations (is_group) VALUES (0)').run();
      const convId = convRes.lastInsertRowid;
      db.prepare('INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)').run(convId, studentId);
      db.prepare('INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)').run(convId, tutorId);
      console.log(`Created conversation between ${s.name} and Expert Alex`);
    }
  }

  // 4. Create a Group Chat with all 5 students and 1 tutor
  const groupName = 'Calculus Prep Group';
  const existingGroup = db.prepare('SELECT id FROM conversations WHERE name = ? AND is_group = 1').get(groupName);
  if (!existingGroup) {
    const groupRes = db.prepare('INSERT INTO conversations (is_group, name) VALUES (1, ?)').run(groupName);
    const groupId = groupRes.lastInsertRowid;
    
    // Add all students
    const insertPart = db.prepare('INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)');
    for (const sid of studentIds) {
      insertPart.run(groupId, sid);
    }
    // Add tutor
    insertPart.run(groupId, tutorId);
    
    // Initial message
    db.prepare('INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)').run(
      groupId, 
      tutorId, 
      'Welcome everyone to the Calculus Prep Group! We will have our sessions here.'
    );
    console.log(`Created group chat: ${groupName}`);
  } else {
    console.log(`Group chat ${groupName} already exists`);
  }

  console.log('\nSeeding complete!');
  db.close();
}

seed().catch(console.error);
