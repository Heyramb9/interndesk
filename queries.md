# Database Queries & Workbench Guide

## How to Access the SQLite Database in VS Code
Because we use SQLite, the database is fully contained within the `database/database.sqlite` file! No need to run an external service.

1. **Open the VS Code Extensions panel** (Ctrl+Shift+X or Cmd+Shift+X).
2. Search for and install the extension: **"SQLite Viewer"** (the one by Florian Klampfer).
3. Open your VS Code file explorer and simply click on `h:/interndesk/interndesk/database/database.sqlite` (this file is created automatically when you run your backend for the first time).
4. The SQLite Viewer extension will open a nice visual table view. You can browse all your tables (users, cohorts, tasks, etc.), and click the **Run Query** button at the top right to write custom SQL!

## Useful Test Queries for the Intern Desk

### 1. View All Interns
```sql
SELECT first_name, last_name, email, company
FROM users
WHERE role = 'intern';
```

### 2. View Mentors and Their Mentees' Progress
```sql
SELECT 
    m.first_name AS Mentor_Name, 
    i.first_name AS Intern_Name, 
    ip.track, 
    ip.progress
FROM users m
JOIN intern_profiles ip ON m.id = ip.mentor_id
JOIN users i ON i.id = ip.user_id
WHERE m.role = 'mentor';
```

### 3. Check Tasks for a Specific Intern
```sql
SELECT t.name AS Task, t.priority, t.status, t.due_date
FROM tasks t
JOIN users u ON u.id = t.intern_id
WHERE u.email = 'intern@demo.com';
```

### 4. View Cohort Details and Associated Manager
```sql
SELECT c.name AS Cohort, c.start_date, c.end_date, u.first_name AS Manager
FROM cohorts c
JOIN users u ON u.id = c.manager_id;
```
