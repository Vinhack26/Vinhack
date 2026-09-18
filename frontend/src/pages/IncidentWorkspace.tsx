import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from '../router';
import {
  checklistApi,
  evidenceApi,
  incidentApi,
  notesApi,
  notificationApi,
  timelineApi,
} from '../api/endpoints';
import {
  CompositeIncident,
  IncidentSeverity,
  IncidentStatus,
  TaskCategory,
  EventType,
} from '../types';
import { Icon, icons } from '../components/common/Icons';
import { CategoryBadge, SeverityBadge, StatusBadge } from '../components/common/Badge';

export const IncidentWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [incident, setIncident] = useState<CompositeIncident | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'triage' | 'checklist' | 'timeline' | 'notes' | 'notification'
  >('triage');

  // Action states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<boolean>(false);

  // New task form state
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('containment');
  const [newTaskPriority, setNewTaskPriority] = useState<IncidentSeverity>('high');

  // New timeline event form state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventTime, setNewEventTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [newEventType, setNewEventType] = useState<EventType>('investigation');

  // New note form state
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteLogRef, setNewNoteLogRef] = useState('');

  // New evidence form state
  const [newEvidenceTitle, setNewEvidenceTitle] = useState('');
  const [newEvidenceDesc, setNewEvidenceDesc] = useState('');
  const [newEvidenceType, setNewEvidenceType] = useState('log_reference');
  const [newEvidenceValue, setNewEvidenceValue] = useState('');

  // Notification edit state
  const [notifSubject, setNotifSubject] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifSaved, setNotifSaved] = useState(false);
  const [notifCopied, setNotifCopied] = useState(false);

  // Non-blocking user feedback toast
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const notify = (message: string, type: 'error' | 'success' = 'error') => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await incidentApi.getById(id);
      if (res?.incident) {
        setIncident(res.incident);
        if (res.incident.notificationDraft) {
          setNotifSubject(res.incident.notificationDraft.subject);
          setNotifBody(res.incident.notificationDraft.body);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load incident details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // Handle Status Update
  const handleStatusChange = async (newStatus: IncidentStatus) => {
    if (!incident) return;
    try {
      setStatusUpdateLoading(true);
      await incidentApi.update(incident.id, { currentStatus: newStatus });
      setIncident((prev) => (prev ? { ...prev, current_status: newStatus } : null));
      notify(`Incident lifecycle status updated to '${newStatus}'`, 'success');
    } catch (err: any) {
      notify(err.message || 'Failed to update status', 'error');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Handle AI Triage
  const handleRunAiAnalysis = async () => {
    if (!incident) return;
    try {
      setIsAnalyzing(true);
      const res = await incidentApi.analyze(incident.id);
      if (res) {
        await fetchDetails();
        notify('AI Breach Triage analysis completed and response checklist updated.', 'success');
      }
    } catch (err: any) {
      notify(err.message || 'AI Triage failed', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle PDF Export
  const handleDownloadPdf = async () => {
    if (!incident) return;
    try {
      setIsDownloadingPdf(true);
      await incidentApi.downloadPdf(incident.id);
      notify('Official PDF incident report downloaded successfully.', 'success');
    } catch (err: any) {
      notify(err.message || 'Failed to generate PDF report', 'error');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Handle Delete Incident
  const handleDeleteIncident = async () => {
    if (!incident) return;
    if (confirm('Are you sure you want to permanently delete this incident record?')) {
      try {
        await incidentApi.delete(incident.id);
        navigate('/incidents');
      } catch (err: any) {
        notify(err.message || 'Failed to delete incident', 'error');
      }
    }
  };

  // Checklist Actions
  const handleToggleTaskStatus = async (taskId: number, current: string) => {
    const nextStatus = current === 'completed' ? 'pending' : 'completed';
    try {
      await checklistApi.update(taskId, { status: nextStatus });
      setIncident((prev) => {
        if (!prev || !prev.checklist) return prev;
        return {
          ...prev,
          checklist: prev.checklist.map((t) =>
            t.id === taskId ? { ...t, status: nextStatus } : t
          ),
        };
      });
      notify('Task status updated', 'success');
    } catch (err: any) {
      notify(err.message || 'Failed to update task', 'error');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident || !newTaskText.trim()) return;
    try {
      const res = await checklistApi.create(incident.id, {
        task: newTaskText.trim(),
        category: newTaskCategory,
        priority: newTaskPriority,
      });
      if (res?.task) {
        setIncident((prev) => ({
          ...prev!,
          checklist: [...(prev?.checklist || []), res.task],
        }));
        setNewTaskText('');
        notify('Response task added to checklist', 'success');
      }
    } catch (err: any) {
      notify(err.message || 'Failed to add task', 'error');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await checklistApi.delete(taskId);
      setIncident((prev) => ({
        ...prev!,
        checklist: (prev?.checklist || []).filter((t) => t.id !== taskId),
      }));
      notify('Task removed from checklist', 'success');
    } catch (err: any) {
      notify(err.message || 'Failed to delete task', 'error');
    }
  };

  // Timeline Actions
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident || !newEventTitle.trim()) return;
    try {
      const res = await timelineApi.create(incident.id, {
        eventTitle: newEventTitle.trim(),
        description: newEventDesc.trim(),
        eventTime: new Date(newEventTime).toISOString(),
        eventType: newEventType,
      });
      if (res?.event) {
        setIncident((prev) => ({
          ...prev!,
          timeline: [...(prev?.timeline || []), res.event],
        }));
        setNewEventTitle('');
        setNewEventDesc('');
        notify('Chronological event recorded to timeline', 'success');
      }
    } catch (err: any) {
      notify(err.message || 'Failed to record timeline event', 'error');
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await timelineApi.delete(eventId);
      setIncident((prev) => ({
        ...prev!,
        timeline: (prev?.timeline || []).filter((e) => e.id !== eventId),
      }));
      notify('Timeline event removed', 'success');
    } catch (err: any) {
      notify(err.message || 'Failed to delete timeline event', 'error');
    }
  };

  // Notes Actions
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident || !newNoteTitle.trim() || !newNoteContent.trim()) return;
    try {
      const res = await notesApi.create(incident.id, {
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
        logReference: newNoteLogRef.trim() || undefined,
      });
      if (res?.note) {
        setIncident((prev) => ({
          ...prev!,
          notes: [res.note, ...(prev?.notes || [])],
        }));
        setNewNoteTitle('');
        setNewNoteContent('');
        setNewNoteLogRef('');
        notify('Forensic note recorded', 'success');
      }
    } catch (err: any) {
      notify(err.message || 'Failed to save forensic note', 'error');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await notesApi.delete(noteId);
      setIncident((prev) => ({
        ...prev!,
        notes: (prev?.notes || []).filter((n) => n.id !== noteId),
      }));
      notify('Forensic note deleted', 'success');
    } catch (err: any) {
      notify(err.message || 'Failed to delete note', 'error');
    }
  };

  // Evidence Actions
  const handleCreateEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident || !newEvidenceTitle.trim() || !newEvidenceValue.trim()) return;
    try {
      const res = await evidenceApi.create(incident.id, {
        title: newEvidenceTitle.trim(),
        description: newEvidenceDesc.trim() || undefined,
        referenceType: newEvidenceType,
        referenceValue: newEvidenceValue.trim(),
      });
      if (res?.evidence) {
        setIncident((prev) => ({
          ...prev!,
          evidence: [res.evidence, ...(prev?.evidence || [])],
        }));
        setNewEvidenceTitle('');
        setNewEvidenceDesc('');
        setNewEvidenceValue('');
        notify('Forensic evidence reference linked', 'success');
      }
    } catch (err: any) {
      notify(err.message || 'Failed to attach evidence', 'error');
    }
  };

  const handleDeleteEvidence = async (evidenceId: number) => {
    try {
      await evidenceApi.delete(evidenceId);
      setIncident((prev) => ({
        ...prev!,
        evidence: (prev?.evidence || []).filter((e) => e.id !== evidenceId),
      }));
      notify('Evidence reference deleted', 'success');
    } catch (err: any) {
      notify(err.message || 'Failed to delete evidence', 'error');
    }
  };

  // Notification Actions
  const handleGenerateNotification = async () => {
    if (!incident) return;
    try {
      const res = await notificationApi.generate(incident.id);
      if (res?.notificationDraft) {
        setNotifSubject(res.notificationDraft.subject);
        setNotifBody(res.notificationDraft.body);
        setIncident((prev) => ({
          ...prev!,
          notificationDraft: res.notificationDraft,
        }));
        notify('Fact-verified advisory draft generated', 'success');
      }
    } catch (err: any) {
      notify(err.message || 'Failed to generate draft', 'error');
    }
  };

  const handleSaveNotification = async () => {
    if (!incident) return;
    try {
      await notificationApi.update(incident.id, {
        subject: notifSubject,
        body: notifBody,
      });
      setNotifSaved(true);
      notify('Stakeholder advisory notice saved', 'success');
      setTimeout(() => setNotifSaved(false), 2500);
    } catch (err: any) {
      notify(err.message || 'Failed to save draft', 'error');
    }
  };

  const handleCopyNotification = () => {
    navigator.clipboard.writeText(`Subject: ${notifSubject}\n\n${notifBody}`);
    setNotifCopied(true);
    setTimeout(() => setNotifCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-300">Loading incident telemetry workspace...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="p-12 max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
          <Icon d={icons.alertCircle} size={24} />
        </div>
        <h2 className="text-lg font-bold text-white">Incident Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'This incident does not exist or you lack authorization.'}</p>
        <Link
          to="/incidents"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 text-black font-bold text-xs"
        >
          Return to Incident Directory
        </Link>
      </div>
    );
  }

  const possibleData = Array.isArray(incident.possible_data_exposed)
    ? incident.possible_data_exposed
    : typeof incident.possible_data_exposed === 'string'
      ? JSON.parse(incident.possible_data_exposed || '[]')
      : [];

  const completedTasks = (incident.checklist || []).filter((t) => t.status === 'completed').length;
  const totalTasks = (incident.checklist || []).length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="p-8 max-w-[1280px] mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/incidents"
            className="p-2 rounded-xl bg-[#0a1628] border border-[#152a52] text-slate-400 hover:text-white hover:border-[#1e3a6e] transition-all"
            title="Back to Incidents"
          >
            <Icon d={icons.arrowLeft} size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs text-cyan-400 font-semibold">#{incident.id}</span>
              <SeverityBadge level={incident.severity} />
              <StatusBadge status={incident.current_status} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">{incident.title}</h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Dropdown */}
          <div className="flex items-center gap-2 bg-[#0a1628] border border-[#152a52] rounded-xl px-3 py-1.5">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={incident.current_status}
              disabled={statusUpdateLoading}
              onChange={(e) => handleStatusChange(e.target.value as IncidentStatus)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="suspected">Suspected</option>
              <option value="investigating">Investigating</option>
              <option value="contained">Contained</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Download PDF Report */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0a1628] border border-[#152a52] hover:border-cyan-400/40 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
          >
            {isDownloadingPdf ? (
              <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Icon d={icons.download} size={14} className="text-cyan-400" />
            )}
            Download PDF Report
          </button>

          {/* Delete Incident */}
          <button
            onClick={handleDeleteIncident}
            title="Delete Incident"
            className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
          >
            <Icon d={icons.trash} size={15} />
          </button>
        </div>
      </div>

      {/* Incident Overview Card */}
      <div className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          <div>
            <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">Affected System</span>
            <span className="text-white font-mono text-sm">{incident.affected_system}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">Classification</span>
            <span className="text-slate-300 text-sm capitalize">{incident.incident_type.replace(/_/g, ' ')}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">Discovery Timestamp</span>
            <span className="text-slate-300 text-sm">
              {new Date(incident.discovery_time).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">Exposed Data Categories</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {possibleData.length > 0 ? (
                possibleData.map((d: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-[#152a52] text-[11px] text-cyan-300">
                    {d}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">None specified</span>
              )}
            </div>
          </div>
        </div>

        {incident.description && (
          <div className="mt-4 pt-4 border-t border-[#152a52] text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-slate-400 block mb-1">Telemetry Description:</span>
            {incident.description}
          </div>
        )}

        {incident.actions_already_taken && (
          <div className="mt-2 text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-400">Initial Actions: </span>
            {incident.actions_already_taken}
          </div>
        )}
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#152a52] pb-px overflow-x-auto scrollbar-hide">
        {[
          { id: 'triage', label: 'AI Breach Triage', icon: icons.sparkles },
          { id: 'checklist', label: `Response Checklist (${completedTasks}/${totalTasks})`, icon: icons.checkCircle },
          { id: 'timeline', label: `Timeline (${(incident.timeline || []).length})`, icon: icons.clock },
          { id: 'notes', label: `Notes & Evidence (${(incident.notes || []).length + (incident.evidence || []).length})`, icon: icons.fileText },
          { id: 'notification', label: 'Advisory Notice', icon: icons.alerts },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Icon d={tab.icon} size={15} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: AI TRIAGE */}
      {activeTab === 'triage' && (
        <div className="space-y-6">
          {/* AI Trigger / Banner */}
          <div className="flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-[#0a1628] to-[#0a1628] border border-cyan-500/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <Icon d={icons.sparkles} size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Autonomous AI Breach Triage</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                  Evaluates potential breach impact using Google Gemini with strict cybersecurity isolation rules, separates confirmed telemetry from assumptions, and auto-seeds action tasks.
                </p>
              </div>
            </div>

            <button
              onClick={handleRunAiAnalysis}
              disabled={isAnalyzing}
              className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#050d1a] font-bold text-xs shadow-lg shadow-cyan-400/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 flex-shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#050d1a] border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Telemetry...</span>
                </>
              ) : (
                <>
                  <Icon d={icons.sparkles} size={15} />
                  <span>{incident.aiReport ? 'Re-run AI Triage' : 'Execute AI Triage'}</span>
                </>
              )}
            </button>
          </div>

          {incident.aiReport ? (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-6">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Executive Summary</h4>
                <p className="text-sm text-slate-200 leading-relaxed">{incident.aiReport.summary}</p>
              </div>

              {/* Threat Impact & Missing Info Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Threat Impact */}
                <div className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-6">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Threat & Impact Assessment
                  </h4>
                  <div className="space-y-3">
                    {incident.aiReport.possibleImpact && incident.aiReport.possibleImpact.length > 0 ? (
                      incident.aiReport.possibleImpact.map((item, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-[#070f20] border border-[#152a52]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-white capitalize">
                              {item.impact.replace(/_/g, ' ')}
                            </span>
                            <SeverityBadge level={item.severity} />
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{item.reason}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">No threat vectors identified.</p>
                    )}
                  </div>
                </div>

                {/* Missing Information / Investigation Gaps */}
                <div className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-6">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Investigation Gaps & Critical Questions
                  </h4>
                  <div className="space-y-3">
                    {incident.aiReport.missingInformation && incident.aiReport.missingInformation.length > 0 ? (
                      incident.aiReport.missingInformation.map((item, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-[#070f20] border border-[#152a52]">
                          <p className="text-xs font-semibold text-cyan-300 mb-1">Q: {item.question}</p>
                          <p className="text-xs text-slate-400">Why it matters: {item.reason}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">No critical missing information detected.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Facts vs Assumptions vs Interpretations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">Confirmed Facts</h5>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(incident.aiReport.confirmedFacts || []).map((fact, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-400 font-bold">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-yellow-400" />
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">User Assumptions</h5>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(incident.aiReport.userAssumptions || []).map((assump, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-yellow-400 font-bold">•</span>
                        <span>{assump}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">AI Interpretations</h5>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(incident.aiReport.aiInterpretations || []).map((interp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{interp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center mx-auto">
                <Icon d={icons.sparkles} size={24} />
              </div>
              <h4 className="text-base font-bold text-white">No AI Analysis Generated Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click "Execute AI Triage" above to run automatic breach classification, impact mapping, and response seeding.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-white">Action Checklist Execution</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Containment, forensic investigation, and recovery tasks.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-cyan-400">{progressPct}%</span>
                <span className="text-xs text-slate-500 block">
                  {completedTasks} of {totalTasks} complete
                </span>
              </div>
            </div>

            <div className="h-2 bg-[#152a52] rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Add Task Form */}
          <form onSubmit={handleCreateTask} className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-4 flex flex-wrap gap-3 items-center">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add response task (e.g. Rotate DB credentials, capture Wireshark trace)..."
              className="flex-1 min-w-[260px] bg-[#070f20] border border-[#152a52] rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50"
            />
            <select
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
              className="bg-[#070f20] border border-[#152a52] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/50"
            >
              <option value="containment">Containment</option>
              <option value="investigation">Investigation</option>
              <option value="recovery">Recovery</option>
              <option value="communication">Communication</option>
            </select>
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as IncidentSeverity)}
              className="bg-[#070f20] border border-[#152a52] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/50"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#050d1a] font-bold text-xs shadow-md shadow-cyan-400/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Icon d={icons.plus} size={14} className="stroke-[2.5]" />
              Add Task
            </button>
          </form>

          {/* Task List */}
          <div className="bg-[#0a1628] border border-[#152a52] rounded-2xl divide-y divide-[#0f1f38] overflow-hidden">
            {(incident.checklist || []).length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No tasks assigned yet. Run AI Triage to automatically generate recommendations or add manually above.
              </div>
            ) : (
              (incident.checklist || []).map((t) => {
                const isCompleted = t.status === 'completed';
                return (
                  <div
                    key={t.id}
                    className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                      isCompleted ? 'bg-[#070f20]/40 opacity-75' : 'hover:bg-[#0f2040]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleTaskStatus(t.id, t.status)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-cyan-400 border-cyan-400 text-[#050d1a]'
                            : 'border-slate-600 hover:border-cyan-400'
                        }`}
                      >
                        {isCompleted && <Icon d={icons.check} size={13} className="stroke-[3]" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {t.task}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <CategoryBadge category={t.category} />
                      <SeverityBadge level={t.priority} />
                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete Task"
                      >
                        <Icon d={icons.trash} size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {/* Add Event Form */}
          <form onSubmit={handleCreateEvent} className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Log Chronological Security Event</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Event Title (e.g. Egress Port 5432 Blocked)..."
                required
                className="bg-[#070f20] border border-[#152a52] rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400/50"
              />
              <input
                type="datetime-local"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
                required
                className="bg-[#070f20] border border-[#152a52] rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400/50"
              />
              <select
                value={newEventType}
                onChange={(e) => setNewEventType(e.target.value as EventType)}
                className="bg-[#070f20] border border-[#152a52] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/50"
              >
                <option value="discovery">Discovery</option>
                <option value="containment">Containment</option>
                <option value="investigation">Investigation</option>
                <option value="recovery">Recovery</option>
                <option value="communication">Communication</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newEventDesc}
                onChange={(e) => setNewEventDesc(e.target.value)}
                placeholder="Event details or forensic log reference..."
                className="flex-1 bg-[#070f20] border border-[#152a52] rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/50"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#050d1a] font-bold text-xs shadow-md shadow-cyan-400/20 transition-all cursor-pointer whitespace-nowrap"
              >
                Record Event
              </button>
            </div>
          </form>

          {/* Timeline Feed */}
          <div className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-6">
            {(incident.timeline || []).length === 0 ? (
              <p className="text-center text-slate-500 text-xs py-8">No timeline events logged yet.</p>
            ) : (
              <div className="relative border-l border-[#152a52] ml-4 pl-6 space-y-6">
                {(incident.timeline || []).map((ev) => (
                  <div key={ev.id} className="relative group">
                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-cyan-400 border-4 border-[#0a1628]" />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{ev.event_title}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#152a52] text-cyan-400 uppercase tracking-wider">
                            {ev.event_type}
                          </span>
                        </div>
                        {ev.description && <p className="text-xs text-slate-400 mt-1">{ev.description}</p>}
                        <span className="text-[10px] text-slate-500 block mt-1">
                          {new Date(ev.event_time).toUTCString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                        title="Delete Event"
                      >
                        <Icon d={icons.trash} size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: NOTES & EVIDENCE */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notes Section */}
          <div className="space-y-4">
            <form onSubmit={handleCreateNote} className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Add Forensic Note</h4>
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Note Title (e.g. Syslog grep verification)..."
                required
                className="w-full bg-[#070f20] border border-[#152a52] rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400/50"
              />
              <textarea
                rows={2}
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Observation or investigation findings..."
                required
                className="w-full bg-[#070f20] border border-[#152a52] rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/50"
              />
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newNoteLogRef}
                  onChange={(e) => setNewNoteLogRef(e.target.value)}
                  placeholder="Optional log reference (e.g. /var/log/auth.log:452)..."
                  className="flex-1 bg-[#070f20] border border-[#152a52] rounded-xl px-3 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-cyan-400/50"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#050d1a] font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {(incident.notes || []).map((note) => (
                <div key={note.id} className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-4 group">
                  <div className="flex items-start justify-between mb-1">
                    <h5 className="text-sm font-semibold text-white">{note.title}</h5>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity"
                    >
                      <Icon d={icons.trash} size={13} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{note.content}</p>
                  {note.log_reference && (
                    <span className="inline-block font-mono text-[10px] text-cyan-400 bg-[#070f20] px-2 py-0.5 rounded mt-2">
                      Ref: {note.log_reference}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Evidence References Section */}
          <div className="space-y-4">
            <form onSubmit={handleCreateEvidence} className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Attach Evidence Reference</h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newEvidenceTitle}
                  onChange={(e) => setNewEvidenceTitle(e.target.value)}
                  placeholder="Evidence Title (e.g. PCAP Packet Dump)..."
                  required
                  className="bg-[#070f20] border border-[#152a52] rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400/50"
                />
                <select
                  value={newEvidenceType}
                  onChange={(e) => setNewEvidenceType(e.target.value)}
                  className="bg-[#070f20] border border-[#152a52] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/50"
                >
                  <option value="log_reference">Server Log File</option>
                  <option value="network_capture">PCAP / Network Flow</option>
                  <option value="disk_image">Disk Forensic Image</option>
                  <option value="external_url">External SIEM Link</option>
                  <option value="other">Other Reference</option>
                </select>
              </div>
              <input
                type="text"
                value={newEvidenceValue}
                onChange={(e) => setNewEvidenceValue(e.target.value)}
                placeholder="Reference Identifier / Path / URL (e.g. s3://logs-bucket/fw-2026.csv)..."
                required
                className="w-full bg-[#070f20] border border-[#152a52] rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/50"
              />
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#050d1a] font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Attach Evidence
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {(incident.evidence || []).map((ev) => (
                <div key={ev.id} className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-4 group">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon d={icons.link} size={14} className="text-cyan-400" />
                      <h5 className="text-sm font-semibold text-white">{ev.title}</h5>
                    </div>
                    <button
                      onClick={() => handleDeleteEvidence(ev.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity"
                    >
                      <Icon d={icons.trash} size={13} />
                    </button>
                  </div>
                  <p className="text-xs font-mono text-cyan-300 bg-[#070f20] p-2 rounded-xl mt-1 break-all">
                    {ev.reference_value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: NOTIFICATION ADVISORY */}
      {activeTab === 'notification' && (
        <div className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#152a52] pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Stakeholder Advisory Draft</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Drafts a legally isolated, fact-verified notification message for users or affected leadership.
              </p>
            </div>
            <button
              onClick={handleGenerateNotification}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 text-xs font-semibold transition-all cursor-pointer"
            >
              Generate Verified Draft
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Advisory Email Subject
            </label>
            <input
              type="text"
              value={notifSubject}
              onChange={(e) => setNotifSubject(e.target.value)}
              placeholder="e.g. [Security Advisory] Notice of Potential Exposure..."
              className="w-full bg-[#070f20] border border-[#152a52] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Notice Body
            </label>
            <textarea
              rows={12}
              value={notifBody}
              onChange={(e) => setNotifBody(e.target.value)}
              placeholder="Click 'Generate Verified Draft' to draft from confirmed facts..."
              className="w-full bg-[#070f20] border border-[#152a52] rounded-xl p-4 text-xs font-mono text-slate-300 leading-relaxed focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleCopyNotification}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#070f20] border border-[#152a52] text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
            >
              <Icon d={icons.copy} size={14} />
              {notifCopied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
            </button>

            <button
              onClick={handleSaveNotification}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#050d1a] font-bold text-xs shadow-md shadow-cyan-400/20 transition-all cursor-pointer"
            >
              <Icon d={icons.check} size={14} />
              {notifSaved ? 'Saved!' : 'Save Advisory Draft'}
            </button>
          </div>
        </div>
      )}

      {/* Floating Feedback Toast */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 text-xs font-semibold animate-slide-up ${
            feedback.type === 'error'
              ? 'bg-red-500/15 border-red-500/30 text-red-300'
              : 'bg-green-500/15 border-green-500/30 text-green-300'
          }`}
        >
          <Icon d={feedback.type === 'error' ? icons.alertCircle : icons.checkCircle} size={16} />
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer">
            <Icon d={icons.close} size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default IncidentWorkspace;
