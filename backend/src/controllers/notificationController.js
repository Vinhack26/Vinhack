import { query } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Generate advisory notification draft using verified facts
 * POST /api/incidents/:id/notification/generate
 */
export const generateNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify incident ownership
    const check = await query('SELECT * FROM incidents WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (check.rows.length === 0) {
      return errorResponse(res, 'Incident not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    const incident = check.rows[0];

    // Fetch latest AI report for confirmed facts
    const aiReportRes = await query('SELECT confirmed_facts FROM ai_reports WHERE incident_id = $1 ORDER BY generated_at DESC LIMIT 1', [id]);
    let verifiedFacts = [];
    if (aiReportRes.rows.length > 0 && Array.isArray(aiReportRes.rows[0].confirmed_facts)) {
      verifiedFacts = aiReportRes.rows[0].confirmed_facts;
    }

    const possibleData = Array.isArray(incident.possible_data_exposed)
      ? incident.possible_data_exposed
      : JSON.parse(incident.possible_data_exposed || '[]');

    const subject = `[Security Notice] Suspected Data Exposure Advisory: ${incident.title}`;
    const body = `Dear Stakeholders,\n\nThis is an official notice regarding a suspected security event involving the system '${incident.affected_system}'.\n\nIncident Details:\n- Discovery Date: ${new Date(incident.discovery_time).toUTCString()}\n- Current Operational Status: ${incident.current_status.toUpperCase()}\n\nVerified Facts:\n${verifiedFacts.length > 0 ? verifiedFacts.map(f => `- ${f}`).join('\n') : '- System was isolated for inspection.'}\n\nPotentially Impacted Data Categories:\n${possibleData.length > 0 ? possibleData.map(d => `- ${d}`).join('\n') : '- Unspecified'}\n\nRecommended Actions:\n- Stay vigilant for suspicious emails or phishing attempts.\n- Report any anomalies immediately to your IT security contact.\n\nThank you for your cooperation.\nBreachBuddy Response Advisory Team`;

    // Upsert into notification_drafts
    const existing = await query('SELECT id FROM notification_drafts WHERE incident_id = $1', [id]);
    let draft;
    if (existing.rows.length > 0) {
      const updateRes = await query(
        `UPDATE notification_drafts
         SET subject = $1, body = $2, verified_information = $3, updated_at = CURRENT_TIMESTAMP
         WHERE incident_id = $4
         RETURNING *`,
        [subject, body, JSON.stringify(verifiedFacts), id]
      );
      draft = updateRes.rows[0];
    } else {
      const insertRes = await query(
        `INSERT INTO notification_drafts (incident_id, subject, body, verified_information)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [id, subject, body, JSON.stringify(verifiedFacts)]
      );
      draft = insertRes.rows[0];
    }

    return successResponse(res, 'Notification draft generated', { notificationDraft: draft });
  } catch (err) {
    next(err);
  }
};

/**
 * Get notification draft for an incident
 * GET /api/incidents/:id/notification
 */
export const getNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const check = await query('SELECT id FROM incidents WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (check.rows.length === 0) {
      return errorResponse(res, 'Incident not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    const result = await query('SELECT * FROM notification_drafts WHERE incident_id = $1 ORDER BY updated_at DESC LIMIT 1', [id]);
    if (result.rows.length === 0) {
      return errorResponse(res, 'No notification draft exists for this incident.', 'NOT_FOUND', [], 404);
    }

    return successResponse(res, 'Notification draft retrieved', { notificationDraft: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Update editable notification draft
 * PATCH /api/incidents/:id/notification
 */
export const updateNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const check = await query('SELECT id FROM incidents WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (check.rows.length === 0) {
      return errorResponse(res, 'Incident not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    const draftRes = await query('SELECT * FROM notification_drafts WHERE incident_id = $1', [id]);
    if (draftRes.rows.length === 0) {
      return errorResponse(res, 'No notification draft exists to update.', 'NOT_FOUND', [], 404);
    }

    const current = draftRes.rows[0];
    const { subject, body, verifiedInformation } = req.body;

    const updatedSubject = subject !== undefined ? subject : current.subject;
    const updatedBody = body !== undefined ? body : current.body;
    const updatedVerified = verifiedInformation !== undefined ? JSON.stringify(verifiedInformation) : current.verified_information;

    const result = await query(
      `UPDATE notification_drafts
       SET subject = $1, body = $2, verified_information = $3, updated_at = CURRENT_TIMESTAMP
       WHERE incident_id = $4
       RETURNING *`,
      [updatedSubject, updatedBody, updatedVerified, id]
    );

    return successResponse(res, 'Notification draft updated successfully', { notificationDraft: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export default {
  generateNotification,
  getNotification,
  updateNotification
};
