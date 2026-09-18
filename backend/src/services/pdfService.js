import PDFDocument from 'pdfkit';

/**
 * Generate PDF Incident Report Stream
 * @param {object} fullIncident - Complete incident dataset with all relations
 * @returns {PDFDocument} pdfkit document stream
 */
export const generateIncidentPDF = (fullIncident) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Colors
  const primaryColor = '#1E293B'; // Dark Slate
  const secondaryColor = '#2563EB'; // Vibrant Blue
  const mutedColor = '#64748B'; // Slate Gray
  const accentBorder = '#E2E8F0'; // Light Gray

  // Title / Branding Header
  doc
    .fillColor(secondaryColor)
    .fontSize(22)
    .text('BreachBuddy Security Incident Report', { align: 'center' });
  doc.moveDown(0.2);

  doc
    .fillColor(mutedColor)
    .fontSize(10)
    .text(`Report Generated: ${new Date().toUTCString()} | Confidential Security Document`, { align: 'center' });
  doc.moveDown(1);
  doc.strokeColor(accentBorder).lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(1);

  // Helper for Section Headers
  const addSectionHeader = (title) => {
    doc.moveDown(0.5);
    doc.fillColor(primaryColor).fontSize(14).text(title, { underline: false });
    doc.strokeColor(secondaryColor).lineWidth(1.5).moveTo(40, doc.y + 2).lineTo(150, doc.y + 2).stroke();
    doc.moveDown(0.6);
  };

  // 1. INCIDENT DETAILS
  addSectionHeader('1. Incident Overview');
  doc.fillColor('#000000').fontSize(10);
  doc.text(`Incident ID: #${fullIncident.id}`);
  doc.text(`Title: ${fullIncident.title}`);
  doc.text(`Incident Type: ${fullIncident.incident_type}`);
  doc.text(`Current Status: ${fullIncident.current_status.toUpperCase()}`);
  doc.text(`Affected System: ${fullIncident.affected_system}`);
  doc.text(`Discovery Time: ${new Date(fullIncident.discovery_time).toUTCString()}`);
  doc.text(`Description: ${fullIncident.description}`);
  if (fullIncident.actions_already_taken) {
    doc.text(`Actions Taken Prior: ${fullIncident.actions_already_taken}`);
  }

  // 2. INCIDENT SUMMARY (AI)
  addSectionHeader('2. Incident Summary');
  if (fullIncident.aiReport && fullIncident.aiReport.summary) {
    doc.fillColor('#334155').fontSize(10).text(fullIncident.aiReport.summary);
  } else {
    doc.fillColor(mutedColor).fontSize(10).text('No AI analysis generated yet.');
  }

  // 3. POTENTIALLY EXPOSED DATA
  addSectionHeader('3. Potentially Exposed Data Categories');
  const possibleData = Array.isArray(fullIncident.possible_data_exposed)
    ? fullIncident.possible_data_exposed
    : typeof fullIncident.possible_data_exposed === 'string'
      ? JSON.parse(fullIncident.possible_data_exposed || '[]')
      : [];

  if (possibleData.length > 0) {
    possibleData.forEach(item => {
      doc.fillColor('#000000').fontSize(10).text(`• ${item}`, { indent: 10 });
    });
  } else {
    doc.fillColor(mutedColor).fontSize(10).text('None specified.');
  }

  // 4. POSSIBLE IMPACT
  addSectionHeader('4. Possible Impact & Threat Assessment');
  const impactList = fullIncident.aiReport ? fullIncident.aiReport.possible_impact : [];
  if (Array.isArray(impactList) && impactList.length > 0) {
    impactList.forEach((imp, i) => {
      doc.fillColor('#000000').fontSize(10).text(`${i + 1}. [${(imp.severity || 'medium').toUpperCase()}] ${imp.impact}: ${imp.reason}`);
    });
  } else {
    doc.fillColor(mutedColor).fontSize(10).text('No detailed threat assessment available.');
  }

  // 5. MISSING INFORMATION
  addSectionHeader('5. Missing Information & Investigation Gaps');
  const missingInfo = fullIncident.aiReport ? fullIncident.aiReport.missing_information : [];
  if (Array.isArray(missingInfo) && missingInfo.length > 0) {
    missingInfo.forEach((item, i) => {
      doc.fillColor('#000000').fontSize(10).text(`? Question: ${item.question}`);
      doc.fillColor(mutedColor).fontSize(9).text(`   Reason: ${item.reason}`);
      doc.moveDown(0.2);
    });
  } else {
    doc.fillColor(mutedColor).fontSize(10).text('No missing information flagged.');
  }

  // 6. IMMEDIATE RESPONSE CHECKLIST
  addSectionHeader('6. Immediate Response Checklist');
  if (fullIncident.checklist && fullIncident.checklist.length > 0) {
    fullIncident.checklist.forEach(t => {
      const statusIcon = t.status === 'completed' ? '[X]' : t.status === 'in_progress' ? '[/]' : '[ ]';
      doc.fillColor('#000000').fontSize(10).text(`${statusIcon} [${t.priority.toUpperCase()}] ${t.task} (${t.category})`);
    });
  } else {
    doc.fillColor(mutedColor).fontSize(10).text('No response checklist tasks assigned.');
  }

  // 7. NOTIFICATION DRAFT
  addSectionHeader('7. Stakeholder Notification Draft');
  if (fullIncident.notificationDraft) {
    doc.fillColor(primaryColor).fontSize(10).text(`Subject: ${fullIncident.notificationDraft.subject}`);
    doc.moveDown(0.2);
    doc.fillColor('#334155').fontSize(9).text(fullIncident.notificationDraft.body);
  } else {
    doc.fillColor(mutedColor).fontSize(10).text('No notification draft generated.');
  }

  // 8. INCIDENT TIMELINE
  addSectionHeader('8. Incident Chronological Timeline');
  if (fullIncident.timeline && fullIncident.timeline.length > 0) {
    fullIncident.timeline.forEach(e => {
      doc.fillColor('#000000').fontSize(10).text(`[${new Date(e.event_time).toUTCString()}] - ${e.event_title} (${e.event_type})`);
      if (e.description) {
        doc.fillColor(mutedColor).fontSize(9).text(`  ${e.description}`);
      }
    });
  } else {
    doc.fillColor(mutedColor).fontSize(10).text('No timeline events logged.');
  }

  // 9. NOTES & LOG REFERENCES
  addSectionHeader('9. Forensic Notes & Log References');
  if (fullIncident.notes && fullIncident.notes.length > 0) {
    fullIncident.notes.forEach(n => {
      doc.fillColor('#000000').fontSize(10).text(`• ${n.title}: ${n.content}`);
      if (n.log_reference) {
        doc.fillColor(mutedColor).fontSize(9).text(`  Log Ref: ${n.log_reference}`);
      }
    });
  } else {
    doc.fillColor(mutedColor).fontSize(10).text('No notes recorded.');
  }

  // 10. EVIDENCE REFERENCES
  addSectionHeader('10. Evidence References');
  if (fullIncident.evidence && fullIncident.evidence.length > 0) {
    fullIncident.evidence.forEach(ev => {
      doc.fillColor('#000000').fontSize(10).text(`• ${ev.title} (${ev.reference_type}): ${ev.reference_value}`);
      if (ev.description) {
        doc.fillColor(mutedColor).fontSize(9).text(`  Description: ${ev.description}`);
      }
    });
  } else {
    doc.fillColor(mutedColor).fontSize(10).text('No evidence references recorded.');
  }

  // Footer Disclaimer
  doc.moveDown(2);
  doc.strokeColor(accentBorder).lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);
  doc
    .fillColor(mutedColor)
    .fontSize(8)
    .text('BreachBuddy Initial Incident Assessment Report. Generated for operational response. Not binding legal advice.', { align: 'center' });

  doc.end();
  return doc;
};

export default {
  generateIncidentPDF
};
