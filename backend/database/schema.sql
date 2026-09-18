-- BreachBuddy PostgreSQL Database Schema

DROP TABLE IF EXISTS evidence_references CASCADE;
DROP TABLE IF EXISTS notification_drafts CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS timeline_events CASCADE;
DROP TABLE IF EXISTS checklist_tasks CASCADE;
DROP TABLE IF EXISTS ai_reports CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- 2. INCIDENTS TABLE
CREATE TABLE incidents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  incident_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  discovery_time TIMESTAMPTZ NOT NULL,
  affected_system VARCHAR(255) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  current_status VARCHAR(50) NOT NULL DEFAULT 'suspected' CHECK (current_status IN ('suspected', 'investigating', 'contained', 'resolved')),
  possible_data_exposed JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions_already_taken TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incidents_user_id ON incidents(user_id);
CREATE INDEX idx_incidents_status ON incidents(current_status);
CREATE INDEX idx_incidents_severity ON incidents(severity);

-- 3. AI_REPORTS TABLE
CREATE TABLE ai_reports (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  data_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  possible_impact JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_information JSONB NOT NULL DEFAULT '[]'::jsonb,
  confirmed_facts JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_assumptions JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_interpretations JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_reports_incident_id ON ai_reports(incident_id);

-- 4. CHECKLIST_TASKS TABLE
CREATE TABLE checklist_tasks (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('containment', 'investigation', 'recovery', 'communication')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_checklist_incident_id ON checklist_tasks(incident_id);
CREATE INDEX idx_checklist_status ON checklist_tasks(status);

-- 5. TIMELINE_EVENTS TABLE
CREATE TABLE timeline_events (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  event_title VARCHAR(255) NOT NULL,
  description TEXT,
  event_time TIMESTAMPTZ NOT NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('discovery', 'containment', 'investigation', 'recovery', 'communication', 'other')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_timeline_incident_id ON timeline_events(incident_id);

-- 6. NOTES TABLE
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  log_reference VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notes_incident_id ON notes(incident_id);

-- 7. NOTIFICATION_DRAFTS TABLE
CREATE TABLE notification_drafts (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  verified_information JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_incident_id ON notification_drafts(incident_id);

-- 8. EVIDENCE_REFERENCES TABLE
CREATE TABLE evidence_references (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reference_type VARCHAR(50) NOT NULL,
  reference_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_evidence_incident_id ON evidence_references(incident_id);
