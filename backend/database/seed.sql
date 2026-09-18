-- BreachBuddy Seed Data

-- Clear existing data
TRUNCATE users, incidents, ai_reports, checklist_tasks, timeline_events, notes, notification_drafts, evidence_references RESTART IDENTITY CASCADE;

-- 1. SEED USER (password: Password123!)
INSERT INTO users (id, name, email, password_hash)
VALUES (
  1,
  'Security Lead Admin',
  'demo@breachbuddy.org',
  '$2a$10$eE6vO1yW6T4S.G32K3sF2uYJ.L9N2a3b4c5d6e7f8g9h0i1j2k3l4' -- bcrypt hash for Password123!
);

-- Reset serial sequence
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. SEED INCIDENT
INSERT INTO incidents (
  id,
  user_id,
  title,
  incident_type,
  description,
  discovery_time,
  affected_system,
  current_status,
  possible_data_exposed,
  actions_already_taken
) VALUES (
  1,
  1,
  'College Student Database Exposure',
  'accidental_data_exposure',
  'A student directory database misconfiguration left read access exposed to an internal network segment without password verification.',
  '2026-09-18T10:00:00Z',
  'Student Portal Database (DB-PROD-02)',
  'suspected',
  '["names", "register_numbers", "email_addresses", "phone_numbers"]'::jsonb,
  'Isolated network access to DB-PROD-02 and rotated DB admin credentials.'
);

SELECT setval('incidents_id_seq', (SELECT MAX(id) FROM incidents));

-- 3. SEED AI REPORT
INSERT INTO ai_reports (
  id,
  incident_id,
  summary,
  data_categories,
  possible_impact,
  missing_information,
  confirmed_facts,
  user_assumptions,
  ai_interpretations
) VALUES (
  1,
  1,
  'Initial analysis indicates a potential exposure of student PII (Names, Email, Phone Numbers, Registration IDs) due to database port exposure on internal subnet.',
  '[
    {"category": "contact_information", "items": ["email addresses", "phone numbers"], "status": "potentially_exposed"},
    {"category": "identity_data", "items": ["student names", "registration numbers"], "status": "potentially_exposed"}
  ]'::jsonb,
  '[
    {"impact": "targeted_phishing", "reason": "Exposed email addresses and phone numbers could be used for social engineering campaigns.", "severity": "medium"},
    {"impact": "unauthorized_reconnaissance", "reason": "Internal attacker could map student registry records.", "severity": "low"}
  ]'::jsonb,
  '[
    {"question": "Was the database port reachable from external internet endpoints?", "reason": "Determines whether breach extends beyond internal network perimeter."},
    {"question": "Are netflow logs or query audit logs available for DB-PROD-02?", "reason": "Required to measure actual exfiltration volumes."}
  ]'::jsonb,
  '[
    "Database access was unauthenticated on port 5432.",
    "Network isolation was applied at 2026-09-18 10:15:00Z."
  ]'::jsonb,
  '[
    "Assuming exposure was limited to internal college Wi-Fi subnet."
  ]'::jsonb,
  '[
    "Risk level is currently medium; no credential hashes or financial records are suspected to be stored in DB-PROD-02."
  ]'::jsonb
);

SELECT setval('ai_reports_id_seq', (SELECT MAX(id) FROM ai_reports));

-- 4. SEED CHECKLIST TASKS
INSERT INTO checklist_tasks (id, incident_id, task, category, priority, status) VALUES
(1, 1, 'Preserve firewall and network flow logs for DB-PROD-02', 'investigation', 'high', 'completed'),
(2, 1, 'Verify if external IP ranges queried the exposed endpoint', 'investigation', 'high', 'in_progress'),
(3, 1, 'Audit database schemas to confirm no hashed passwords or financial data were exposed', 'containment', 'high', 'pending'),
(4, 1, 'Draft advisory notification for affected student body', 'communication', 'medium', 'pending');

SELECT setval('checklist_tasks_id_seq', (SELECT MAX(id) FROM checklist_tasks));

-- 5. SEED TIMELINE EVENTS
INSERT INTO timeline_events (id, incident_id, event_title, description, event_time, event_type) VALUES
(1, 1, 'Unauthenticated Access Discovered', 'System administrator noticed open port 5432 during routine internal audit.', '2026-09-18T10:00:00Z', 'discovery'),
(2, 1, 'Network Isolation Applied', 'Database server firewall rule updated to deny non-whitelisted traffic.', '2026-09-18T10:15:00Z', 'containment');

SELECT setval('timeline_events_id_seq', (SELECT MAX(id) FROM timeline_events));

-- 6. SEED NOTES
INSERT INTO notes (id, incident_id, user_id, title, content, log_reference) VALUES
(1, 1, 1, 'Initial Forensic Inspection', 'Checked syslog on db-host-02. Connection log shows 14 queries between 08:00 and 09:30 UTC.', 'syslog-2026-09-18-db-host-02.log');

SELECT setval('notes_id_seq', (SELECT MAX(id) FROM notes));

-- 7. SEED NOTIFICATION DRAFT
INSERT INTO notification_drafts (id, incident_id, subject, body, verified_information) VALUES
(1, 1, '[Advisory] Notice of Suspected Data Exposure - Student Portal System', 'Dear Students,\n\nWe are writing to inform you of a potential security exposure identified on our student portal database system. Our security team immediately isolated the system and initiated a detailed forensic investigation.\n\nPotentially Exposed Data: Student Names, Register Numbers, Email Addresses, Phone Numbers.\nNote: No passwords or financial credentials were part of this dataset.\n\nRecommended Action: Be vigilant against incoming phishing emails or suspicious messages.\n\nBreachBuddy Security Team', '["Database isolated at 10:15 UTC", "No financial data stored in affected system"]'::jsonb);

SELECT setval('notification_drafts_id_seq', (SELECT MAX(id) FROM notification_drafts));

-- 8. SEED EVIDENCE REFERENCES
INSERT INTO evidence_references (id, incident_id, user_id, title, description, reference_type, reference_value) VALUES
(1, 1, 1, 'Firewall Access Log', 'Network log showing access attempts to DB-PROD-02', 'log_reference', 'fw-log-20260918.csv');

SELECT setval('evidence_references_id_seq', (SELECT MAX(id) FROM evidence_references));
