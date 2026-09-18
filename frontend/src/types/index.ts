export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'suspected' | 'investigating' | 'contained' | 'resolved';
export type TaskCategory = 'containment' | 'investigation' | 'recovery' | 'communication';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type EventType = 'discovery' | 'containment' | 'investigation' | 'recovery' | 'communication' | 'other';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Incident {
  id: number;
  user_id?: number;
  title: string;
  incident_type: string;
  description?: string;
  discovery_time: string;
  affected_system: string;
  severity: IncidentSeverity;
  current_status: IncidentStatus;
  possible_data_exposed?: string[] | string;
  actions_already_taken?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateIncidentPayload {
  title: string;
  incidentType: string;
  description: string;
  discoveryTime: string;
  affectedSystem: string;
  severity?: IncidentSeverity;
  possibleDataExposed?: string[];
  currentStatus?: IncidentStatus;
  actionsAlreadyTaken?: string;
}

export interface UpdateIncidentPayload {
  title?: string;
  incidentType?: string;
  description?: string;
  discoveryTime?: string;
  affectedSystem?: string;
  severity?: IncidentSeverity;
  possibleDataExposed?: string[];
  currentStatus?: IncidentStatus;
  actionsAlreadyTaken?: string;
}

export interface DataCategory {
  category: string;
  items: string[];
  status: string;
}

export interface ThreatImpact {
  impact: string;
  reason: string;
  severity: IncidentSeverity;
}

export interface MissingInfo {
  question: string;
  reason: string;
}

export interface AIReport {
  id?: number;
  incident_id?: number;
  summary: string;
  dataCategories?: DataCategory[];
  possibleImpact?: ThreatImpact[];
  missingInformation?: MissingInfo[];
  confirmedFacts?: string[];
  userAssumptions?: string[];
  aiInterpretations?: string[];
  checklist?: Array<{ task: string; category: TaskCategory; priority: IncidentSeverity }>;
  notificationDraft?: { subject: string; body: string };
  generated_at?: string;
}

export interface ChecklistTask {
  id: number;
  incident_id: number;
  task: string;
  category: TaskCategory;
  priority: IncidentSeverity;
  status: TaskStatus;
  completed_at?: string | null;
  created_at?: string;
}

export interface ChecklistProgress {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  percentage: number;
}

export interface TimelineEvent {
  id: number;
  incident_id: number;
  event_title: string;
  description?: string;
  event_time: string;
  event_type: EventType;
  created_at?: string;
}

export interface Note {
  id: number;
  incident_id: number;
  user_id?: number;
  title: string;
  content: string;
  log_reference?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EvidenceReference {
  id: number;
  incident_id: number;
  user_id?: number;
  title: string;
  description?: string;
  reference_type: string;
  reference_value: string;
  created_at?: string;
}

export interface NotificationDraft {
  id?: number;
  incident_id?: number;
  subject: string;
  body: string;
  verified_information?: string[] | string;
  created_at?: string;
  updated_at?: string;
}

export interface CompositeIncident extends Incident {
  aiReport?: AIReport | null;
  checklist?: ChecklistTask[];
  timeline?: TimelineEvent[];
  notificationDraft?: NotificationDraft | null;
  notes?: Note[];
  evidence?: EvidenceReference[];
}

export interface DashboardAlert {
  id: number;
  title: string;
  desc: string;
  severity: IncidentSeverity;
  time: string;
  type?: string;
}

export interface TrendPoint {
  day: string;
  incidents: number;
  resolved: number;
}

export interface DashboardStats {
  totalIncidents: number;
  activeIncidents: number;
  criticalThreats: number;
  affectedAssets: number;
  openAlerts: number;
  severityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  statusCounts: {
    suspected: number;
    investigating: number;
    contained: number;
    resolved: number;
  };
  trendData: TrendPoint[];
  recentAlerts: DashboardAlert[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: {
    code: string;
    details: unknown[];
  };
}
