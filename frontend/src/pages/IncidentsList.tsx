import React, { useState, useEffect } from 'react';
import { incidentApi } from '../api/endpoints';
import { Incident, IncidentSeverity, IncidentStatus } from '../types';
import { Icon, icons } from '../components/common/Icons';
import { SeverityBadge, StatusBadge } from '../components/common/Badge';
import { useNavigate } from '../router';

export const IncidentsList: React.FC<{ onNewIncident?: () => void }> = ({ onNewIncident }) => {
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await incidentApi.getAll();
      if (res?.incidents) {
        setIncidents(res.incidents);
      }
    } catch (err) {
      console.error('Failed to fetch incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      search === '' ||
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.affected_system.toLowerCase().includes(search.toLowerCase()) ||
      inc.incident_type.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || inc.current_status.toLowerCase() === statusFilter.toLowerCase();

    const matchesSeverity =
      severityFilter === 'all' || (inc.severity || 'medium').toLowerCase() === severityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-8 max-w-[1280px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Incident Repository</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track, triage, and execute action checklists for all recorded breaches.
          </p>
        </div>
        {onNewIncident && (
          <button
            onClick={onNewIncident}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#050d1a] font-bold text-sm shadow-md shadow-cyan-400/20 transition-all cursor-pointer"
          >
            <Icon d={icons.plus} size={16} className="stroke-[2.5]" />
            Report Incident
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-[#0a1628] border border-[#152a52] rounded-2xl p-4">
        {/* Search */}
        <div className="flex-1 min-w-[240px] relative">
          <Icon d={icons.search} size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, system, or type..."
            className="w-full bg-[#070f20] border border-[#152a52] rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#070f20] border border-[#152a52] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/50"
          >
            <option value="all">All Statuses</option>
            <option value="suspected">Suspected</option>
            <option value="investigating">Investigating</option>
            <option value="contained">Contained</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#070f20] border border-[#152a52] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/50"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <button
          onClick={fetchIncidents}
          className="p-2 rounded-xl bg-[#070f20] border border-[#152a52] text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Refresh List"
        >
          <Icon d={icons.refresh} size={15} />
        </button>
      </div>

      {/* Incidents Table */}
      <div className="bg-[#0a1628] border border-[#152a52] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-400">Loading incident directory...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#0f2040] flex items-center justify-center mx-auto text-slate-500 mb-3">
              <Icon d={icons.incident} size={24} />
            </div>
            <h3 className="text-sm font-semibold text-white">No incidents found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {search || statusFilter !== 'all' || severityFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'No breach incidents logged yet. Start by reporting your first incident.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#152a52] bg-[#070f20]/50">
                  {['Incident ID', 'Title', 'Classification', 'Affected System', 'Severity', 'Status', 'Discovery Time'].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap first:pl-6 last:pr-6"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0f1f38]">
                {filteredIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => navigate(`/incidents/${inc.id}`)}
                    className="hover:bg-[#0f2040] transition-colors duration-100 cursor-pointer group"
                  >
                    <td className="px-5 py-4 pl-6">
                      <span className="font-mono text-xs text-cyan-400 font-semibold group-hover:underline">
                        #{inc.id}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-w-[260px]">
                      <div className="text-slate-200 font-medium leading-snug truncate">{inc.title}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {inc.incident_type.replace(/_/g, ' ')}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-300 font-mono">
                      {inc.affected_system}
                    </td>
                    <td className="px-5 py-4">
                      <SeverityBadge level={inc.severity} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={inc.current_status} />
                    </td>
                    <td className="px-5 py-4 pr-6 text-xs text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Icon d={icons.clock} size={12} className="text-slate-500" />
                        {formatDate(inc.discovery_time)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentsList;
