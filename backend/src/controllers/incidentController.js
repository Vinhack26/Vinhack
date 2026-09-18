import { query } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { getFullIncidentDetails } from '../services/incidentService.js';
import { analyzeIncidentWithAI } from '../services/aiService.js';

/**
 * Create a new incident
 * POST /api/incidents
 */
export const createIncident = async (req, res, next) => {
  try {
    const {
      title,
      incidentType,
      description,
      discoveryTime,
      affectedSystem,
      possibleDataExposed,
      currentStatus,
      actionsAlreadyTaken
    } = req.body;

    const result = await query(
      `INSERT INTO incidents (
        user_id,
        title,
        incident_type,
        description,
        discovery_time,
        affected_system,
        possible_data_exposed,
        current_status,
        actions_already_taken
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        req.user.id,
        title,
        incidentType,
        description,
        discoveryTime,
        affectedSystem,
        JSON.stringify(possibleDataExposed || []),
        currentStatus || 'suspected',
        actionsAlreadyTaken || ''
      ]
    );

    const incident = result.rows[0];

    // Create an initial timeline event for discovery
    await query(
      `INSERT INTO timeline_events (incident_id, event_title, description, event_time, event_type)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        incident.id,
        'Incident Discovered',
        `Incident '${title}' was reported on system '${affectedSystem}'.`,
        discoveryTime,
        'discovery'
      ]
    );

    return successResponse(
      res,
      'Incident created successfully',
      {
        incident: {
          id: incident.id,
          title: incident.title,
          status: incident.current_status,
          created_at: incident.created_at
        }
      },
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Get all incidents belonging to authenticated user
 * GET /api/incidents
 */
export const getIncidents = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, title, incident_type, affected_system, current_status, discovery_time, created_at, updated_at
       FROM incidents
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return successResponse(res, 'Incidents retrieved successfully', { incidents: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single incident with full aggregated details
 * GET /api/incidents/:id
 */
export const getIncidentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fullIncident = await getFullIncidentDetails(id, req.user.id);

    if (!fullIncident) {
      return errorResponse(res, 'Incident not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    return successResponse(res, 'Incident details retrieved successfully', { incident: fullIncident });
  } catch (err) {
    next(err);
  }
};

/**
 * Update incident details
 * PATCH /api/incidents/:id
 */
export const updateIncident = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check ownership
    const check = await query('SELECT * FROM incidents WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (check.rows.length === 0) {
      return errorResponse(res, 'Incident not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    const current = check.rows[0];
    const {
      title,
      incidentType,
      description,
      discoveryTime,
      affectedSystem,
      possibleDataExposed,
      currentStatus,
      actionsAlreadyTaken
    } = req.body;

    const updatedTitle = title !== undefined ? title : current.title;
    const updatedType = incidentType !== undefined ? incidentType : current.incident_type;
    const updatedDesc = description !== undefined ? description : current.description;
    const updatedDiscovery = discoveryTime !== undefined ? discoveryTime : current.discovery_time;
    const updatedSystem = affectedSystem !== undefined ? affectedSystem : current.affected_system;
    const updatedDataExposed = possibleDataExposed !== undefined ? JSON.stringify(possibleDataExposed) : current.possible_data_exposed;
    const updatedStatus = currentStatus !== undefined ? currentStatus : current.current_status;
    const updatedActions = actionsAlreadyTaken !== undefined ? actionsAlreadyTaken : current.actions_already_taken;

    const result = await query(
      `UPDATE incidents
       SET title = $1,
           incident_type = $2,
           description = $3,
           discovery_time = $4,
           affected_system = $5,
           possible_data_exposed = $6,
           current_status = $7,
           actions_already_taken = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [
        updatedTitle,
        updatedType,
        updatedDesc,
        updatedDiscovery,
        updatedSystem,
        updatedDataExposed,
        updatedStatus,
        updatedActions,
        id,
        req.user.id
      ]
    );

    return successResponse(res, 'Incident updated successfully', { incident: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete incident
 * DELETE /api/incidents/:id
 */
export const deleteIncident = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM incidents WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Incident not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    return successResponse(res, 'Incident deleted successfully', { id: Number(id) });
  } catch (err) {
    next(err);
  }
};

/**
 * Run AI Analysis on incident
 * POST /api/incidents/:id/analyze
 */
export const analyzeIncident = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership & fetch incident
    const check = await query('SELECT * FROM incidents WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (check.rows.length === 0) {
      return errorResponse(res, 'Incident not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    const incident = check.rows[0];

    // Call AI Service
    const aiResult = await analyzeIncidentWithAI(incident);

    // Save AI report to database
    await query(
      `INSERT INTO ai_reports (
        incident_id,
        summary,
        data_categories,
        possible_impact,
        missing_information,
        confirmed_facts,
        user_assumptions,
        ai_interpretations
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        aiResult.summary,
        JSON.stringify(aiResult.dataCategories || []),
        JSON.stringify(aiResult.possibleImpact || []),
        JSON.stringify(aiResult.missingInformation || []),
        JSON.stringify(aiResult.confirmedFacts || []),
        JSON.stringify(aiResult.userAssumptions || []),
        JSON.stringify(aiResult.aiInterpretations || [])
      ]
    );

    // Automatically seed recommended checklist tasks if none exist for this incident
    const existingChecklist = await query('SELECT COUNT(*) FROM checklist_tasks WHERE incident_id = $1', [id]);
    if (parseInt(existingChecklist.rows[0].count, 10) === 0 && Array.isArray(aiResult.checklist)) {
      for (const item of aiResult.checklist) {
        await query(
          `INSERT INTO checklist_tasks (incident_id, task, category, priority, status)
           VALUES ($1, $2, $3, $4, 'pending')`,
          [id, item.task, item.category || 'investigation', item.priority || 'medium']
        );
      }
    }

    // Automatically seed/update notification draft if none exists for this incident
    const existingNotification = await query('SELECT COUNT(*) FROM notification_drafts WHERE incident_id = $1', [id]);
    if (parseInt(existingNotification.rows[0].count, 10) === 0 && aiResult.notificationDraft) {
      await query(
        `INSERT INTO notification_drafts (incident_id, subject, body, verified_information)
         VALUES ($1, $2, $3, $4)`,
        [
          id,
          aiResult.notificationDraft.subject,
          aiResult.notificationDraft.body,
          JSON.stringify(aiResult.confirmedFacts || [])
        ]
      );
    }

    return successResponse(res, 'AI Analysis completed successfully', aiResult);
  } catch (err) {
    next(err);
  }
};

export default {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
  analyzeIncident
};
