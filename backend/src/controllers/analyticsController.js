import { query } from '../config/database.js';
import { successResponse } from '../utils/response.js';

/**
 * Get dashboard analytics & KPI metrics for the authenticated user
 * GET /api/analytics/dashboard
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Fetch all user incidents
    const incidentsRes = await query(
      `SELECT id, title, incident_type, severity, affected_system, current_status, discovery_time, created_at, updated_at
       FROM incidents
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    const incidents = incidentsRes.rows;

    // 2. Compute status & severity counts
    let activeIncidents = 0;
    let criticalThreats = 0;
    const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
    const statusCounts = { suspected: 0, investigating: 0, contained: 0, resolved: 0 };
    const uniqueAssets = new Set();

    incidents.forEach((inc) => {
      const status = (inc.current_status || 'suspected').toLowerCase();
      const severity = (inc.severity || 'medium').toLowerCase();

      if (status !== 'resolved') {
        activeIncidents += 1;
      }
      if (severity === 'critical') {
        criticalThreats += 1;
      }

      if (statusCounts[status] !== undefined) {
        statusCounts[status] += 1;
      }
      if (severityCounts[severity] !== undefined) {
        severityCounts[severity] += 1;
      }
      if (inc.affected_system) {
        uniqueAssets.add(inc.affected_system);
      }
    });

    // 3. Compute 7-day trend data
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const trendMap = {};

    // Initialize past 7 days (including today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayLabel = daysOfWeek[d.getDay()];
      const dateKey = d.toISOString().slice(0, 10);
      trendMap[dateKey] = { day: dayLabel, incidents: 0, resolved: 0 };
    }

    incidents.forEach((inc) => {
      const createdKey = inc.created_at ? new Date(inc.created_at).toISOString().slice(0, 10) : null;
      if (createdKey && trendMap[createdKey]) {
        trendMap[createdKey].incidents += 1;
      }
      if (inc.current_status === 'resolved') {
        const updatedKey = inc.updated_at ? new Date(inc.updated_at).toISOString().slice(0, 10) : null;
        if (updatedKey && trendMap[updatedKey]) {
          trendMap[updatedKey].resolved += 1;
        }
      }
    });

    // Provide trend data
    const trendData = Object.values(trendMap);

    // 4. Fetch recent timeline events to synthesize alerts
    const timelineRes = await query(
      `SELECT t.id, t.event_title, t.description, t.event_type, t.event_time, i.title as incident_title, i.severity
       FROM timeline_events t
       JOIN incidents i ON t.incident_id = i.id
       WHERE i.user_id = $1
       ORDER BY t.event_time DESC
       LIMIT 6`,
      [userId]
    );

    const alerts = timelineRes.rows.map((row) => ({
      id: row.id,
      title: row.event_title,
      desc: row.description || `Event on ${row.incident_title}`,
      severity: row.severity || (row.event_type === 'discovery' ? 'critical' : 'medium'),
      time: row.event_time,
      type: row.event_type
    }));

    return successResponse(res, 'Dashboard statistics retrieved successfully', {
      totalIncidents: incidents.length,
      activeIncidents,
      criticalThreats,
      affectedAssets: uniqueAssets.size > 0 ? uniqueAssets.size : incidents.length,
      openAlerts: alerts.length,
      severityCounts,
      statusCounts,
      trendData,
      recentAlerts: alerts
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getDashboardStats
};
