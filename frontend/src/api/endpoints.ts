import api from './client';
import {
  AuthResponse,
  CompositeIncident,
  CreateIncidentPayload,
  DashboardStats,
  Incident,
  UpdateIncidentPayload,
  User,
  ChecklistTask,
  ChecklistProgress,
  TimelineEvent,
  EventType,
  NotificationDraft,
  Note,
  EvidenceReference,
  AIReport,
  TaskCategory,
  IncidentSeverity,
  TaskStatus,
} from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { name, email, password }),

  getMe: () => api.get<{ user: User }>('/auth/me'),
};

export const analyticsApi = {
  getDashboardStats: () => api.get<DashboardStats>('/analytics/dashboard'),
};

export const incidentApi = {
  getAll: () => api.get<{ incidents: Incident[] }>('/incidents'),

  getById: (id: number | string) =>
    api.get<{ incident: CompositeIncident }>(`/incidents/${id}`),

  create: (payload: CreateIncidentPayload) =>
    api.post<{ incident: Incident }>('/incidents', payload),

  update: (id: number | string, payload: UpdateIncidentPayload) =>
    api.patch<{ incident: Incident }>(`/incidents/${id}`, payload),

  delete: (id: number | string) =>
    api.delete<{ id: number }>(`/incidents/${id}`),

  analyze: (id: number | string) =>
    api.post<AIReport>(`/incidents/${id}/analyze`),

  downloadPdf: (id: number | string) =>
    api.downloadBlob(`/incidents/${id}/report/pdf`, `incident-report-${id}.pdf`),
};

export const checklistApi = {
  getByIncident: (incidentId: number | string, category?: string) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return api.get<{ tasks: ChecklistTask[]; progress: ChecklistProgress }>(
      `/incidents/${incidentId}/checklist${query}`
    );
  },

  create: (incidentId: number | string, data: { task: string; category: TaskCategory; priority: IncidentSeverity }) =>
    api.post<{ task: ChecklistTask }>(`/incidents/${incidentId}/checklist`, data),

  update: (taskId: number | string, data: { status?: TaskStatus; priority?: IncidentSeverity; task?: string }) =>
    api.patch<{ task: ChecklistTask }>(`/checklist/${taskId}`, data),

  delete: (taskId: number | string) =>
    api.delete<{ id: number }>(`/checklist/${taskId}`),
};

export const timelineApi = {
  getByIncident: (incidentId: number | string) =>
    api.get<{ events: TimelineEvent[] }>(`/incidents/${incidentId}/timeline`),

  create: (
    incidentId: number | string,
    data: { eventTitle: string; description?: string; eventTime: string; eventType: EventType }
  ) => api.post<{ event: TimelineEvent }>(`/incidents/${incidentId}/timeline`, data),

  delete: (eventId: number | string) =>
    api.delete<{ id: number }>(`/timeline/${eventId}`),
};

export const notificationApi = {
  get: (incidentId: number | string) =>
    api.get<{ notificationDraft: NotificationDraft }>(`/incidents/${incidentId}/notification`),

  generate: (incidentId: number | string) =>
    api.post<{ notificationDraft: NotificationDraft }>(`/incidents/${incidentId}/notification/generate`),

  update: (incidentId: number | string, data: { subject?: string; body?: string }) =>
    api.patch<{ notificationDraft: NotificationDraft }>(`/incidents/${incidentId}/notification`, data),
};

export const notesApi = {
  getByIncident: (incidentId: number | string) =>
    api.get<{ notes: Note[] }>(`/incidents/${incidentId}/notes`),

  create: (incidentId: number | string, data: { title: string; content: string; logReference?: string }) =>
    api.post<{ note: Note }>(`/incidents/${incidentId}/notes`, data),

  delete: (noteId: number | string) =>
    api.delete<{ id: number }>(`/notes/${noteId}`),
};

export const evidenceApi = {
  getByIncident: (incidentId: number | string) =>
    api.get<{ evidence: EvidenceReference[] }>(`/incidents/${incidentId}/evidence`),

  create: (
    incidentId: number | string,
    data: { title: string; description?: string; referenceType: string; referenceValue: string }
  ) => api.post<{ evidence: EvidenceReference }>(`/incidents/${incidentId}/evidence`, data),

  delete: (evidenceId: number | string) =>
    api.delete<{ id: number }>(`/evidence/${evidenceId}`),
};
