import { getFullIncidentDetails } from '../services/incidentService.js';
import { generateIncidentPDF } from '../services/pdfService.js';
import { errorResponse } from '../utils/response.js';

/**
 * Download PDF Incident Report
 * GET /api/incidents/:id/report/pdf
 */
export const downloadPDFReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    const fullIncident = await getFullIncidentDetails(id, req.user.id);
    if (!fullIncident) {
      return errorResponse(res, 'Incident not found or unauthorized', 'NOT_FOUND', [], 404);
    }

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="incident-report-${id}.pdf"`);

    const pdfDoc = generateIncidentPDF(fullIncident);
    pdfDoc.pipe(res);
  } catch (err) {
    next(err);
  }
};

export default {
  downloadPDFReport
};
