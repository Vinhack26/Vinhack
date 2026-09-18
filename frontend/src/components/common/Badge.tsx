import React from 'react';
import { IncidentSeverity, IncidentStatus, TaskCategory } from '../../types';

const severityConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400', label: 'Critical' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-400', label: 'High' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400', label: 'Medium' },
  low: { bg: 'bg-sky-500/10', text: 'text-sky-400', dot: 'bg-sky-400', label: 'Low' },
};

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  suspected: { bg: 'bg-purple-500/10', text: 'text-purple-400', label: 'Suspected' },
  investigating: { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'Investigating' },
  contained: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', label: 'Contained' },
  resolved: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Resolved' },
};

const categoryConfig: Record<string, { bg: string; text: string }> = {
  containment: { bg: 'bg-red-500/10', text: 'text-red-400' },
  investigation: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  recovery: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  communication: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
};

export function SeverityBadge({ level }: { level?: IncidentSeverity | string }) {
  const key = (level || 'low').toLowerCase();
  const cfg = severityConfig[key] || severityConfig.low;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function StatusBadge({ status }: { status?: IncidentStatus | string }) {
  const key = (status || 'suspected').toLowerCase();
  const cfg = statusConfig[key] || statusConfig.suspected;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

export function CategoryBadge({ category }: { category?: TaskCategory | string }) {
  const key = (category || 'investigation').toLowerCase();
  const cfg = categoryConfig[key] || { bg: 'bg-slate-500/10', text: 'text-slate-400' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
      {category}
    </span>
  );
}
