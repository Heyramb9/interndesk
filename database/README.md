# Intern Desk — Database

## Schema
See `schema.sql` for the full table definitions.

## Tables

| Table               | Purpose                                      |
|---------------------|----------------------------------------------|
| `users`             | All users (interns, mentors, managers)       |
| `cohorts`           | Program cohort groups                        |
| `intern_profiles`   | Extended intern data (track, mentor, etc.)   |
| `mentor_profiles`   | Extended mentor data (availability, bio)     |
| `tasks`             | Tasks assigned to interns                    |
| `schedule_events`   | Calendar/schedule entries per user           |
| `announcements`     | Program-wide announcements                   |
| `messages`          | Direct messages between users                |
| `skill_progress`    | Per-skill % progress for interns             |
| `reviews`           | Mentor/manager reviews of interns            |
| `notifications`     | In-app notifications                         |
| `journals`          | Weekly journals written by interns           |
| `goals`             | Goals set by/for interns                     |
| `resources`         | Shared learning resources                    |

## Setup

```bash
# Create database
createdb interndesk

# Run schema
psql -d interndesk -f schema.sql
```
