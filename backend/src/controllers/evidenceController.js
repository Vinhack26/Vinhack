import { query } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get evidence references for an incident
 * GET /api/incidents/:id/evidence
 */
export const getEvidence = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const check = await query('SELECT id FROM incidents WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (check.rows.length === 0) {
      return errorResponse(res, 'Incident not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    const result = await query('SELECT * FROM evidence_references WHERE incident_id = $1 ORDER BY created_at DESC', [id]);
    return successResponse(res, 'Evidence references retrieved successfully', { evidence: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Add a new evidence reference
 * POST /api/incidents/:id/evidence
 */
export const createEvidence = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, referenceType, referenceValue } = req.body;

    // Verify ownership
    const check = await query('SELECT id FROM incidents WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (check.rows.length === 0) {
      return errorResponse(res, 'Incident not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    const result = await query(
      `INSERT INTO evidence_references (incident_id, user_id, title, description, reference_type, reference_value)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, req.user.id, title, description || '', referenceType, referenceValue]
    );

    return successResponse(res, 'Evidence reference created successfully', { evidence: result.rows[0] }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete evidence reference
 * DELETE /api/evidence/:evidenceId
 */
export const deleteEvidence = async (req, res, next) => {
  try {
    const { evidenceId } = req.params;

    const result = await query('DELETE FROM evidence_references WHERE id = $1 AND user_id = $2 RETURNING id', [evidenceId, req.user.id]);
    if (result.rows.length === 0) {
      return errorResponse(res, 'Evidence reference not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    return successResponse(res, 'Evidence reference deleted successfully', { id: Number(evidenceId) });
  } catch (err) {
    next(err);
  }
};

export default {
  getEvidence,
  createEvidence,
  deleteEvidence
};
