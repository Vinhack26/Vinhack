import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Icon, icons } from '../components/common/Icons';
import { SeverityBadge, StatusBadge } from '../components/common/Badge';
import { analyticsApi, incidentApi } from '../api/endpoints';
import { DashboardStats, Incident } from '../types';
import { useNavigate, Link } from '../router';

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f2040] border border-[#1e3a6e] rounded-lg px-4 py-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300 capitalize">{p.name}:</span>
          <span className="text-white font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function KpiCard({
  label,
  value,
  iconPath,
  trend,
  trendUp,
  accent,
}: {
  label: string;
  value: number | string;
  iconPath: string;
  trend: string;
  trendUp: boolean;
  accent: string;
}) {
  return (
    <div className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-6 flex flex-col gap-4 hover:border-[#1e3a6e] transition-colors duration-200 group">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon d={iconPath} size={20} className="opacity-90" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
          <Icon d={trendUp ? icons.trendUp : icons.trendDown} size={12} />
          {trend}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-sm text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

function ThreatBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${color}`} />
          <span className="text-sm text-slate-300">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{pct}%</span>
          <span className="text-sm font-semibold text-white w-6 text-right">{count}</span>
        </div>
      </div>
      <div className="h-1.5 bg-[#152a52] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export const Dashboard: React.FC<{ onNewIncident?: () => void }> = ({ onNewIncident }) => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeChartTab, setActiveChartTab] = useState<'incidents' | 'resolved'>('incidents');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, incRes] = await Promise.all([
        analyticsApi.getDashboardStats().catch(() => null),
        incidentApi.getAll().catch(() => ({ incidents: [] })),
      ]);

      if (statsRes) setStats(statsRes);
      if (incRes?.incidents) setIncidents(incRes.incidents);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalThreats =
    (stats?.severityCounts.critical || 0) +
    (stats?.severityCounts.high || 0) +
    (stats?.severityCounts.medium || 0) +
    (stats?.severityCounts.low || 0);

  const fallbackChartData = [
    { day: 'Mon', incidents: 2, resolved: 1 },
    { day: 'Tue', incidents: 4, resolved: 3 },
    { day: 'Wed', incidents: 3, resolved: 2 },
    { day: 'Thu', incidents: 6, resolved: 4 },
    { day: 'Fri', incidents: 5, resolved: 4 },
    { day: 'Sat', incidents: 2, resolved: 2 },
    { day: 'Sun', incidents: 3, resolved: 2 },
  ];

  const chartData = stats?.trendData && stats.trendData.length > 0 ? stats.trendData : fallbackChartData;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-8 max-w-[1280px] mx-auto space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Security Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time telemetry, active breach triage, and defense status.</p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border ${
              (stats?.activeIncidents || 0) > 0
                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                : 'bg-green-500/10 border-green-500/20 text-green-400'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  (stats?.activeIncidents || 0) > 0 ? 'bg-orange-400' : 'bg-green-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  (stats?.activeIncidents || 0) > 0 ? 'bg-orange-400' : 'bg-green-400'
                }`}
              />
            </span>
            <span className="text-xs font-semibold">
              {(stats?.activeIncidents || 0) > 0
                ? `${stats?.activeIncidents} Active Incident${stats?.activeIncidents === 1 ? '' : 's'}`
                : 'System Protected'}
            </span>
          </div>

          <button
            onClick={fetchData}
            title="Refresh Data"
            className="p-2.5 rounded-xl bg-[#0a1628] border border-[#152a52] text-slate-400 hover:text-white hover:border-[#1e3a6e] transition-all cursor-pointer"
          >
            <Icon d={icons.refresh} size={15} />
          </button>

          {onNewIncident && (
            <button
              onClick={onNewIncident}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-400 text-[#050d1a] font-bold text-xs hover:bg-cyan-300 shadow-md shadow-cyan-400/20 transition-all cursor-pointer"
            >
              <Icon d={icons.plus} size={14} className="stroke-[2.5]" />
              New Incident
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Active Incidents"
          value={stats ? stats.activeIncidents : loading ? '...' : incidents.length}
          iconPath={icons.incident}
          trend="+1 today"
          trendUp={false}
          accent="bg-orange-500/10 text-orange-400"
        />
        <KpiCard
          label="Critical Threats"
          value={stats ? stats.criticalThreats : loading ? '...' : 0}
          iconPath={icons.threat}
          trend="+0 today"
          trendUp={true}
          accent="bg-red-500/10 text-red-400"
        />
        <KpiCard
          label="Affected Assets"
          value={stats ? stats.affectedAssets : loading ? '...' : incidents.length}
          iconPath={icons.assets}
          trend="+0 this week"
          trendUp={true}
          accent="bg-purple-500/10 text-purple-400"
        />
        <KpiCard
          label="Open Alerts"
          value={stats ? stats.openAlerts : loading ? '...' : 0}
          iconPath={icons.alerts}
          trend="Live telemetry"
          trendUp={true}
          accent="bg-cyan-500/10 text-cyan-400"
        />
      </div>

      {/* Chart + Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Trend Chart */}
        <div className="lg:col-span-2 bg-[#0a1628] border border-[#152a52] rounded-2xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">Security Incidents Telemetry</h2>
              <p className="text-xs text-slate-500 mt-0.5">Last 7 days reported vs resolved</p>
            </div>
            <div className="flex items-center gap-1 bg-[#0f2040] rounded-lg p-0.5">
              {(['incidents', 'resolved'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveChartTab(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all duration-150 cursor-pointer ${
                    activeChartTab === t ? 'bg-cyan-400/10 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-3 h-1 rounded-full bg-cyan-400 inline-block" /> Total Reported
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-3 h-1 rounded-full bg-blue-500 inline-block" /> Resolved
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#152a52" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="incidents"
                name="Incidents"
                stroke="#22d3ee"
                strokeWidth={2}
                fill="url(#gradCyan)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="resolved"
                name="Resolved"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#gradBlue)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Threat Severity Breakdown */}
        <div className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">Threat Severity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Distribution across organization</p>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-[#0f2040] px-2 py-1 rounded-md">
              {totalThreats > 0 ? `${totalThreats} total` : `${incidents.length} total`}
            </span>
          </div>

          <div className="space-y-4">
            <ThreatBar
              label="Critical"
              count={stats?.severityCounts.critical || 0}
              total={totalThreats || 1}
              color="bg-red-400"
            />
            <ThreatBar
              label="High"
              count={stats?.severityCounts.high || (incidents.filter((i) => i.severity === 'high').length)}
              total={totalThreats || 1}
              color="bg-orange-400"
            />
            <ThreatBar
              label="Medium"
              count={stats?.severityCounts.medium || (incidents.filter((i) => i.severity === 'medium').length)}
              total={totalThreats || 1}
              color="bg-yellow-400"
            />
            <ThreatBar
              label="Low"
              count={stats?.severityCounts.low || (incidents.filter((i) => i.severity === 'low').length)}
              total={totalThreats || 1}
              color="bg-sky-400"
            />
          </div>

          <div className="mt-6 pt-5 border-t border-[#152a52] grid grid-cols-2 gap-3">
            <div className="bg-[#0f2040] rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-white">
                {totalThreats > 0
                  ? `${Math.round((((stats?.severityCounts.critical || 0) + (stats?.severityCounts.high || 0)) / totalThreats) * 100)}%`
                  : '0%'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">High + Critical</p>
            </div>
            <div className="bg-[#0f2040] rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-cyan-400">
                {stats?.statusCounts.resolved || 0}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">Resolved Breaches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Incidents Table + Alerts Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Real Incidents Table */}
        <div className="xl:col-span-2 bg-[#0a1628] border border-[#152a52] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#152a52]">
            <div>
              <h2 className="text-base font-semibold text-white">Recent Incidents</h2>
              <p className="text-xs text-slate-500 mt-0.5">Active and recently updated data exposures</p>
            </div>
            <Link
              to="/incidents"
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              View all <Icon d={icons.chevronRight} size={12} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {incidents.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No incidents reported yet. Click "New Incident" to report a data breach event.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#152a52]">
                    {['ID', 'Title', 'Classification', 'Severity', 'Status', 'System', 'Reported'].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap first:pl-6 last:pr-6"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {incidents.slice(0, 6).map((inc, i) => (
                    <tr
                      key={inc.id}
                      onClick={() => navigate(`/incidents/${inc.id}`)}
                      className={`border-b border-[#0f1f38] hover:bg-[#0f2040] transition-colors duration-100 cursor-pointer ${
                        i === incidents.length - 1 ? 'border-none' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 pl-6">
                        <span className="font-mono text-xs text-cyan-400 font-medium">#{inc.id}</span>
                      </td>
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <span className="text-slate-200 text-sm font-medium leading-snug truncate block">
                          {inc.title}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">
                        {inc.incident_type.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3.5">
                        <SeverityBadge level={inc.severity} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={inc.current_status} />
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-300">
                        {inc.affected_system}
                      </td>
                      <td className="px-4 py-3.5 pr-6">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs whitespace-nowrap">
                          <Icon d={icons.clock} size={11} />
                          {formatDate(inc.discovery_time || inc.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Live Alerts Feed */}
        <div className="bg-[#0a1628] border border-[#152a52] rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-5 border-b border-[#152a52]">
            <div>
              <h2 className="text-base font-semibold text-white">Recent Alerts & Events</h2>
              <p className="text-xs text-slate-500 mt-0.5">Chronological threat signals</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
              </span>
              <span className="text-[10px] text-red-400 font-medium">Live</span>
            </div>
          </div>

          <div className="divide-y divide-[#0f1f38] overflow-y-auto max-h-[480px] scrollbar-hide flex-1">
            {stats?.recentAlerts && stats.recentAlerts.length > 0 ? (
              stats.recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="px-5 py-4 hover:bg-[#0f2040] transition-colors duration-100 cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-500/10 text-red-400">
                      <Icon d={icons.alerts} size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <SeverityBadge level={alert.severity} />
                        <span className="text-[10px] text-slate-600 whitespace-nowrap">
                          {formatDate(alert.time)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 leading-snug mb-1">{alert.title}</p>
                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{alert.desc}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                No active alerts detected. Timeline security events will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
