import { query } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get notes for an incident
 * GET /api/incidents/:id/notes
 */
export const getNotes = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const check = await query('SELECT id FROM incidents WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (check.rows.length === 0) {
      return errorResponse(res, 'Incident not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    const result = await query('SELECT * FROM notes WHERE incident_id = $1 ORDER BY created_at DESC', [id]);
    return successResponse(res, 'Notes retrieved successfully', { notes: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new note
 * POST /api/incidents/:id/notes
 */
export const createNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, logReference } = req.body;

    // Verify ownership
    const check = await query('SELECT id FROM incidents WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (check.rows.length === 0) {
      return errorResponse(res, 'Incident not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    const result = await query(
      `INSERT INTO notes (incident_id, user_id, title, content, log_reference)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, req.user.id, title, content, logReference || '']
    );

    return successResponse(res, 'Note created successfully', { note: result.rows[0] }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a note
 * PATCH /api/notes/:noteId
 */
export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const check = await query('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [noteId, req.user.id]);
    if (check.rows.length === 0) {
      return errorResponse(res, 'Note not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    const current = check.rows[0];
    const { title, content, logReference } = req.body;

    const updatedTitle = title !== undefined ? title : current.title;
    const updatedContent = content !== undefined ? content : current.content;
    const updatedLogRef = logReference !== undefined ? logReference : current.log_reference;

    const result = await query(
      `UPDATE notes
       SET title = $1, content = $2, log_reference = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [updatedTitle, updatedContent, updatedLogRef, noteId, req.user.id]
    );

    return successResponse(res, 'Note updated successfully', { note: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a note
 * DELETE /api/notes/:noteId
 */
export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const result = await query('DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id', [noteId, req.user.id]);
    if (result.rows.length === 0) {
      return errorResponse(res, 'Note not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    return successResponse(res, 'Note deleted successfully', { id: Number(noteId) });
  } catch (err) {
    next(err);
  }
};

export default {
  getNotes,
  createNote,
  updateNote,
  deleteNote
};
