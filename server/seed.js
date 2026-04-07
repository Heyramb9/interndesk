import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  const dbPath = path.join(__dirname, '..', 'database', 'database.sqlite');
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  const hash = await bcrypt.hash('demo123', 10);

  // Clear demo users and insert updated ones
  console.log('Inserting demo users...');
  
  // Replace the old hashes in schema.sql while we are at it
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  let schema = fs.readFileSync(schemaPath, 'utf8');
  schema = schema.replace(/\$2b\$10\$QzK85iK3O2KxS6Jv.J2.3e1d6d.5GZ6a72N5F8.hZtI7TfK5N.oH./g, hash);
  fs.writeFileSync(schemaPath, schema, 'utf8');
  console.log('Fixed broken hash inside schema.sql');

  // Execute schema to make sure tables exist
  await db.exec(schema);

  // Delete existing strictly to force update 
  await db.run(`DELETE FROM users WHERE email IN ('intern@demo.com', 'mentor@demo.com', 'manager@demo.com')`);

  await db.run(
    `INSERT INTO users (id, first_name, last_name, email, password, role, avatar_gradient) VALUES 
    (1, 'Alex', 'Johnson', 'intern@demo.com', ?, 'intern', 'linear-gradient(135deg, #2f7cf0, #8b5cf6)'),
    (2, 'Sarah', 'Rodriguez', 'mentor@demo.com', ?, 'mentor', 'linear-gradient(135deg, #10b981, #3b82f6)'),
    (3, 'James', 'Wilson', 'manager@demo.com', ?, 'manager', 'linear-gradient(135deg, #ef4444, #f59e0b)')`,
    [hash, hash, hash]
  );
  
  // Create an initial cohort if missing
  await db.run(`INSERT OR IGNORE INTO cohorts (id, name, start_date, end_date, manager_id) VALUES (1, 'Spring 2026', '2026-01-01', '2026-05-01', 3)`);
  
  // Add some initial profiles to silence FK errors
  await db.run(`INSERT OR IGNORE INTO intern_profiles (user_id, cohort_id, mentor_id, track, status, progress) VALUES (1, 1, 2, 'Frontend Dev', 'on-track', 82)`);
  await db.run(`INSERT OR IGNORE INTO mentor_profiles (user_id, title) VALUES (2, 'Senior Software Engineer')`);

  console.log('Demo users successfully injected with password: demo123');
  await db.close();
}

seed().catch(console.error);
