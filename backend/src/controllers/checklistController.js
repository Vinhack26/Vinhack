import { query } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get checklist tasks for an incident with optional category filter & progress stats
 * GET /api/incidents/:id/checklist
 */
export const getChecklist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category } = req.query;

    // Verify incident ownership
    const check = await query('SELECT id FROM incidents WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (check.rows.length === 0) {
      return errorResponse(res, 'Incident not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    let sql = 'SELECT * FROM checklist_tasks WHERE incident_id = $1';
    const params = [id];

    if (category) {
      sql += ' AND category = $2';
      params.push(category);
    }

    sql += ' ORDER BY id ASC';

    const result = await query(sql, params);
    const tasks = result.rows;

    // Calculate progress stats across all tasks for this incident
    const allTasksRes = await query('SELECT status FROM checklist_tasks WHERE incident_id = $1', [id]);
    const total = allTasksRes.rows.length;
    const completed = allTasksRes.rows.filter(t => t.status === 'completed').length;
    const inProgress = allTasksRes.rows.filter(t => t.status === 'in_progress').length;
    const pending = allTasksRes.rows.filter(t => t.status === 'pending').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return successResponse(res, 'Checklist tasks retrieved', {
      tasks,
      progress: {
        total,
        completed,
        inProgress,
        pending,
        percentage
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new checklist task
 * POST /api/incidents/:id/checklist
 */
export const createTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { task, category, priority } = req.body;

    // Verify incident ownership
    const check = await query('SELECT id FROM incidents WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (check.rows.length === 0) {
      return errorResponse(res, 'Incident not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    const result = await query(
      `INSERT INTO checklist_tasks (incident_id, task, category, priority, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [id, task, category, priority || 'medium']
    );

    return successResponse(res, 'Checklist task created', { task: result.rows[0] }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Update checklist task status or details
 * PATCH /api/checklist/:taskId
 */
export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    // Verify ownership via incident user_id
    const check = await query(
      `SELECT t.* FROM checklist_tasks t
       JOIN incidents i ON t.incident_id = i.id
       WHERE t.id = $1 AND i.user_id = $2`,
      [taskId, req.user.id]
    );

    if (check.rows.length === 0) {
      return errorResponse(res, 'Checklist task not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    const current = check.rows[0];
    const { task, category, priority, status } = req.body;

    const updatedTask = task !== undefined ? task : current.task;
    const updatedCategory = category !== undefined ? category : current.category;
    const updatedPriority = priority !== undefined ? priority : current.priority;
    const updatedStatus = status !== undefined ? status : current.status;

    let completedAt = current.completed_at;
    if (updatedStatus === 'completed' && current.status !== 'completed') {
      completedAt = new Date().toISOString();
    } else if (updatedStatus !== 'completed') {
      completedAt = null;
    }

    const result = await query(
      `UPDATE checklist_tasks
       SET task = $1,
           category = $2,
           priority = $3,
           status = $4,
           completed_at = $5
       WHERE id = $6
       RETURNING *`,
      [updatedTask, updatedCategory, updatedPriority, updatedStatus, completedAt, taskId]
    );

    return successResponse(res, 'Checklist task updated', { task: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete checklist task
 * DELETE /api/checklist/:taskId
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const result = await query(
      `DELETE FROM checklist_tasks
       WHERE id = $1 AND incident_id IN (SELECT id FROM incidents WHERE user_id = $2)
       RETURNING id`,
      [taskId, req.user.id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Checklist task not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    return successResponse(res, 'Checklist task deleted', { id: Number(taskId) });
  } catch (err) {
    next(err);
  }
};

export default {
  getChecklist,
  createTask,
  updateTask,
  deleteTask
};
