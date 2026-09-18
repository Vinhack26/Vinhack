import { query } from '../config/database.js';

/**
 * Get full composite incident data including sub-resources
 * @param {number} incidentId
 * @param {number} userId
 */
export const getFullIncidentDetails = async (incidentId, userId) => {
  // 1. Fetch incident record (verify ownership)
  const incidentRes = await query(
    `SELECT * FROM incidents WHERE id = $1 AND user_id = $2`,
    [incidentId, userId]
  );

  if (incidentRes.rows.length === 0) {
    return null;
  }

  const incident = incidentRes.rows[0];

  // 2. Fetch latest AI report
  const aiReportRes = await query(
    `SELECT * FROM ai_reports WHERE incident_id = $1 ORDER BY generated_at DESC LIMIT 1`,
    [incidentId]
  );
  const aiReport = aiReportRes.rows.length > 0 ? aiReportRes.rows[0] : null;

  // 3. Fetch checklist tasks
  const checklistRes = await query(
    `SELECT * FROM checklist_tasks WHERE incident_id = $1 ORDER BY id ASC`,
    [incidentId]
  );
  const checklist = checklistRes.rows;

  // 4. Fetch timeline events
  const timelineRes = await query(
    `SELECT * FROM timeline_events WHERE incident_id = $1 ORDER BY event_time ASC`,
    [incidentId]
  );
  const timeline = timelineRes.rows;

  // 5. Fetch notification draft
  const notificationRes = await query(
    `SELECT * FROM notification_drafts WHERE incident_id = $1 ORDER BY updated_at DESC LIMIT 1`,
    [incidentId]
  );
  const notificationDraft = notificationRes.rows.length > 0 ? notificationRes.rows[0] : null;

  // 6. Fetch notes
  const notesRes = await query(
    `SELECT * FROM notes WHERE incident_id = $1 ORDER BY created_at DESC`,
    [incidentId]
  );
  const notes = notesRes.rows;

  // 7. Fetch evidence references
  const evidenceRes = await query(
    `SELECT * FROM evidence_references WHERE incident_id = $1 ORDER BY created_at DESC`,
    [incidentId]
  );
  const evidence = evidenceRes.rows;

  return {
    ...incident,
    aiReport,
    checklist,
    timeline,
    notificationDraft,
    notes,
    evidence
  };
};

export default {
  getFullIncidentDetails
};
