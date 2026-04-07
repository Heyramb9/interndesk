-- INTERN DESK — Database Schema (SQLite)

CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name   VARCHAR(100) NOT NULL,
  last_name    VARCHAR(100) NOT NULL,
  email        VARCHAR(255) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  role         VARCHAR(20) NOT NULL CHECK (role IN ('intern', 'mentor', 'manager')),
  company      VARCHAR(255),
  avatar_gradient VARCHAR(255),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cohorts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         VARCHAR(255) NOT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  manager_id   INTEGER REFERENCES users(id),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS intern_profiles (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  cohort_id    INTEGER REFERENCES cohorts(id),
  mentor_id    INTEGER REFERENCES users(id),
  track        VARCHAR(100),
  progress     INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status       VARCHAR(20) DEFAULT 'on-track' CHECK (status IN ('on-track', 'at-risk', 'completed')),
  week_number  INTEGER DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mentor_profiles (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(255),
  bio             TEXT,
  max_mentees     INTEGER DEFAULT 4,
  is_available    BOOLEAN DEFAULT 1,
  rating          DECIMAL(3,2) DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  intern_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  assigned_by  INTEGER REFERENCES users(id),
  name         VARCHAR(500) NOT NULL,
  description  TEXT,
  due_date     DATE,
  priority     VARCHAR(20) DEFAULT 'upcoming' CHECK (priority IN ('urgent', 'in-progress', 'upcoming', 'learning')),
  status       VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'done')),
  is_done      BOOLEAN DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedule_events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title        VARCHAR(500) NOT NULL,
  description  TEXT,
  event_time   TIME NOT NULL,
  event_date   DATE NOT NULL,
  color        VARCHAR(20) DEFAULT '#2f7cf0',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcements (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  posted_by    INTEGER REFERENCES users(id),
  title        VARCHAR(500) NOT NULL,
  body         TEXT NOT NULL,
  audience     VARCHAR(20) DEFAULT 'all' CHECK (audience IN ('all', 'interns', 'mentors', 'managers')),
  cohort_id    INTEGER REFERENCES cohorts(id),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id    INTEGER REFERENCES users(id),
  receiver_id  INTEGER REFERENCES users(id),
  subject      VARCHAR(500),
  body         TEXT NOT NULL,
  is_read      BOOLEAN DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_progress (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  intern_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  skill_name   VARCHAR(255) NOT NULL,
  percentage   INTEGER DEFAULT 0 CHECK (percentage BETWEEN 0 AND 100),
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  reviewer_id  INTEGER REFERENCES users(id),
  intern_id    INTEGER REFERENCES users(id),
  rating       INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes        TEXT,
  review_type  VARCHAR(20) DEFAULT 'weekly' CHECK (review_type IN ('weekly', 'mid-term', 'final')),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title        VARCHAR(500) NOT NULL,
  body         TEXT,
  type         VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read      BOOLEAN DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journals (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  intern_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title        VARCHAR(500) NOT NULL,
  content      TEXT NOT NULL,
  week_number  INTEGER,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS goals (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  intern_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title        VARCHAR(500) NOT NULL,
  description  TEXT,
  due_date     DATE,
  is_completed BOOLEAN DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resources (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  posted_by    INTEGER REFERENCES users(id),
  title        VARCHAR(500) NOT NULL,
  description  TEXT,
  url          VARCHAR(1000),
  type         VARCHAR(20) DEFAULT 'article' CHECK (type IN ('article', 'video', 'course', 'document')),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_intern_id ON tasks(intern_id);
CREATE INDEX IF NOT EXISTS idx_intern_profiles_user_id ON intern_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_cohort ON announcements(cohort_id);

INSERT OR IGNORE INTO users (id, first_name, last_name, email, password, role) VALUES
  (1, 'Alex',  'Johnson', 'intern@demo.com',  '$2b$10$W2gdqvgyDc4q7iG/RaVfqeB8ATVYWjfDetmez3V110YJT/IU7Hty.',  'intern'),
  (2, 'Sarah', 'Rodriguez', 'mentor@demo.com', '$2b$10$W2gdqvgyDc4q7iG/RaVfqeB8ATVYWjfDetmez3V110YJT/IU7Hty.', 'mentor'),
  (3, 'James', 'Wilson',  'manager@demo.com', '$2b$10$W2gdqvgyDc4q7iG/RaVfqeB8ATVYWjfDetmez3V110YJT/IU7Hty.', 'manager');
