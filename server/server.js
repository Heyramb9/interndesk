import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

let db;
const isPostgres = !!process.env.DATABASE_URL;

async function initDb() {
  if (isPostgres) {
    const { Pool } = pg;
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    console.log('Connecting to PostgreSQL...');
    
    // Unified interface for PostgreSQL
    db = {
      async all(query, params = []) {
        const sq = query.replace(/\?/g, (_, i, s) => `$${(s.slice(0, i).match(/\?/g) || []).length + 1}`);
        const res = await pool.query(sq, params);
        return res.rows;
      },
      async get(query, params = []) {
        const sq = query.replace(/\?/g, (_, i, s) => `$${(s.slice(0, i).match(/\?/g) || []).length + 1}`);
        const res = await pool.query(sq, params);
        return res.rows[0];
      },
      async run(query, params = []) {
        const sq = query.replace(/\?/g, (_, i, s) => `$${(s.slice(0, i).match(/\?/g) || []).length + 1}`);
        const res = await pool.query(sq, params);
        return { lastID: res.rows[0]?.id || null, changes: res.rowCount };
      },
      async exec(query) {
        return pool.query(query);
      }
    };
  } else {
    console.log('Connecting to SQLite...');
    db = await open({
      filename: path.join(__dirname, '..', 'database', 'database.sqlite'),
      driver: sqlite3.Database
    });
  }

  // Schema initialization
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    let schema = fs.readFileSync(schemaPath, 'utf8');
    if (isPostgres) {
      // PostgreSQL Compatibility fixes for schema
      schema = schema
        .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY')
        .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
        .replace(/INSERT OR IGNORE/gi, 'INSERT') // We'll just ignore errors on initial seeds
        .replace(/CHECK \(role IN \('intern', 'mentor', 'manager'\)\)/gi, '') // Postgre handle constraints differently or we ignore for simplicity
        // The above is a bit risky but we have a limited schema.
        // Let's be more careful.
    }
    
    try {
      if (isPostgres) {
        // Run schema line by line or split by semicolon (careful with multiline)
        const statements = schema.split(';').filter(s => s.trim());
        for (let s of statements) {
          try { await db.exec(s); } catch (e) {
            if (!e.message.includes('already exists') && !e.message.includes('duplicate')) {
              console.warn('Schema Warning:', e.message);
            }
          }
        }
      } else {
        await db.exec(schema);
      }
      console.log('Database initialized successfully.');
    } catch (e) {
      console.error('Database Initialization Failed:', e.message);
    }
  }
}

// verifyToken middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Generic CRUD Framework
app.get('/api/data/:table', verifyToken, async (req, res) => {
  try {
    const { table } = req.params;
    if (!/^[a-zA-Z0-9_]+$/.test(table)) return res.status(400).json({ success: false, message: 'Invalid table' });
    
    const allowedFilters = Object.keys(req.query).filter(k => /^[a-zA-Z0-9_]+$/.test(k));
    let query = `SELECT * FROM ${table}`;
    const params = [];
    
    if (allowedFilters.length > 0) {
      query += ` WHERE ` + allowedFilters.map(k => `${k} = ?`).join(' AND ');
      allowedFilters.forEach(k => params.push(req.query[k]));
    }
    query += ` ORDER BY id DESC`;
    const data = await db.all(query, params);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/data/:table', verifyToken, async (req, res) => {
  try {
    const { table } = req.params;
    if (!/^[a-zA-Z0-9_]+$/.test(table)) return res.status(400).json({ success: false, message: 'Invalid table' });
    
    const keys = Object.keys(req.body).filter(k => /^[a-zA-Z0-9_]+$/.test(k) && k !== 'id');
    const values = keys.map(k => req.body[k]);
    const placeholders = keys.map(() => '?').join(', ');
    
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    const result = await db.run(query, values);
    
    res.json({ success: true, id: result.lastID, message: 'Created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/data/:table/:id', verifyToken, async (req, res) => {
  try {
    const { table, id } = req.params;
    if (!/^[a-zA-Z0-9_]+$/.test(table)) return res.status(400).json({ success: false, message: 'Invalid table' });
    
    const keys = Object.keys(req.body).filter(k => /^[a-zA-Z0-9_]+$/.test(k) && k !== 'id');
    const values = keys.map(k => req.body[k]);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    
    const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    await db.run(query, [...values, id]);
    
    res.json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/data/:table/:id', verifyToken, async (req, res) => {
  try {
    const { table, id } = req.params;
    if (!/^[a-zA-Z0-9_]+$/.test(table)) return res.status(400).json({ success: false, message: 'Invalid table' });
    await db.run(`DELETE FROM ${table} WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Dedicated Profiles API
app.get('/api/users', verifyToken, async (req, res) => {
  try {
    const { role } = req.query;
    let query = `SELECT id, first_name, last_name, email, role, avatar_gradient, company FROM users`;
    const params = [];
    if (role) {
      query += ` WHERE role = ?`;
      params.push(role);
    }
    const users = await db.all(query, params);
    
    for (let u of users) {
      u.name = `${u.first_name} ${u.last_name}`;
      u.initials = (u.first_name[0] + u.last_name[0]).toUpperCase();
      if (u.role === 'intern') {
        const profile = await db.get(`SELECT track, progress, status FROM intern_profiles WHERE user_id = ?`, [u.id]);
        if (profile) Object.assign(u, profile);
      } else if (u.role === 'mentor') {
        const profile = await db.get(`SELECT title FROM mentor_profiles WHERE user_id = ?`, [u.id]);
        if (profile) Object.assign(u, profile);
      }
    }
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Dedicated Messaging APIs
app.post('/api/messages/send', verifyToken, async (req, res) => {
  try {
    const { receiver_id, subject, body } = req.body;
    if (!receiver_id || !body) return res.status(400).json({ success: false, message: 'Missing fields' });
    
    await db.run(
      'INSERT INTO messages (sender_id, receiver_id, subject, body) VALUES (?, ?, ?, ?)',
      [req.user.id, receiver_id, subject || '', body]
    );
    res.json({ success: true, message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/messages/inbox', verifyToken, async (req, res) => {
  try {
    const messages = await db.all(`
      SELECT m.*, u.first_name, u.last_name, u.avatar_gradient
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.receiver_id = ? ORDER BY m.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/messages/sent', verifyToken, async (req, res) => {
  try {
    const messages = await db.all(`
      SELECT m.*, u.first_name, u.last_name, u.avatar_gradient
      FROM messages m
      JOIN users u ON m.receiver_id = u.id
      WHERE m.sender_id = ? ORDER BY m.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Register Endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, company } = req.body;

    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const gradient = `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}, #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')})`;

    const result = await db.run(
      'INSERT INTO users (first_name, last_name, email, password, role, company, avatar_gradient) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, role, company, gradient]
    );

    if (role === 'intern') {
      await db.run('INSERT INTO intern_profiles (user_id, track) VALUES (?, ?)', [result.lastID, req.body.track || 'Unassigned']);
    } else if (role === 'mentor') {
      await db.run('INSERT INTO mentor_profiles (user_id, title) VALUES (?, ?)', [result.lastID, req.body.title || 'Mentor']);
    }

    const token = jwt.sign({ id: result.lastID, role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      success: true,
      token,
      user: {
        id: result.lastID,
        firstName,
        lastName,
        email,
        role,
        company,
        initials: (firstName[0] + lastName[0]).toUpperCase(),
        avatarGradient: gradient
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        company: user.company,
        initials: (user.first_name[0] + user.last_name[0]).toUpperCase(),
        avatarGradient: user.avatar_gradient
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Database Engine Endpoints
app.get('/api/admin/tables', async (req, res) => {
  try {
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    res.json({ success: true, tables: tables.map(t => t.name) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/admin/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, message: 'No query provided' });
    
    // Check if it's a mutation (INSERT, UPDATE, DELETE) or SELECT
    const isMutation = !query.trim().toUpperCase().startsWith('SELECT') && 
                       !query.trim().toUpperCase().startsWith('PRAGMA') && 
                       !query.trim().toUpperCase().startsWith('EXPLAIN');
    
    if (isMutation) {
      const result = await db.run(query);
      return res.json({ 
        success: true, 
        message: `Query successful. Changes: ${result.changes}, Last ID: ${result.lastID}`,
        results: []
      });
    } else {
      const results = await db.all(query);
      return res.json({ success: true, results });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

const INITIAL_PORT = process.env.PORT || 5000;
initDb().then(() => {
  startServer(INITIAL_PORT);
}).catch(console.error);
