import { query } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get timeline events for an incident (ordered chronologically)
 * GET /api/incidents/:id/timeline
 */
export const getTimeline = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify incident ownership
    const check = await query('SELECT id FROM incidents WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (check.rows.length === 0) {
      return errorResponse(res, 'Incident not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    const result = await query(
      'SELECT * FROM timeline_events WHERE incident_id = $1 ORDER BY event_time ASC',
      [id]
    );

    return successResponse(res, 'Timeline events retrieved', { timeline: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new timeline event
 * POST /api/incidents/:id/timeline
 */
export const createEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { eventTitle, description, eventTime, eventType } = req.body;

    // Verify incident ownership
    const check = await query('SELECT id FROM incidents WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (check.rows.length === 0) {
      return errorResponse(res, 'Incident not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    const result = await query(
      `INSERT INTO timeline_events (incident_id, event_title, description, event_time, event_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, eventTitle, description || '', eventTime, eventType]
    );

    return successResponse(res, 'Timeline event created', { event: result.rows[0] }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Update timeline event
 * PATCH /api/timeline/:eventId
 */
export const updateEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // Verify ownership via incident user_id
    const check = await query(
      `SELECT e.* FROM timeline_events e
       JOIN incidents i ON e.incident_id = i.id
       WHERE e.id = $1 AND i.user_id = $2`,
      [eventId, req.user.id]
    );

    if (check.rows.length === 0) {
      return errorResponse(res, 'Timeline event not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    const current = check.rows[0];
    const { eventTitle, description, eventTime, eventType } = req.body;

    const updatedTitle = eventTitle !== undefined ? eventTitle : current.event_title;
    const updatedDesc = description !== undefined ? description : current.description;
    const updatedTime = eventTime !== undefined ? eventTime : current.event_time;
    const updatedType = eventType !== undefined ? eventType : current.event_type;

    const result = await query(
      `UPDATE timeline_events
       SET event_title = $1,
           description = $2,
           event_time = $3,
           event_type = $4
       WHERE id = $5
       RETURNING *`,
      [updatedTitle, updatedDesc, updatedTime, updatedType, eventId]
    );

    return successResponse(res, 'Timeline event updated', { event: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete timeline event
 * DELETE /api/timeline/:eventId
 */
export const deleteEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const result = await query(
      `DELETE FROM timeline_events
       WHERE id = $1 AND incident_id IN (SELECT id FROM incidents WHERE user_id = $2)
       RETURNING id`,
      [eventId, req.user.id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Timeline event not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    return successResponse(res, 'Timeline event deleted', { id: Number(eventId) });
  } catch (err) {
    next(err);
  }
};

export default {
  getTimeline,
  createEvent,
  updateEvent,
  deleteEvent
};
