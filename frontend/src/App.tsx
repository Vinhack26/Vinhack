import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Icons ────────────────────────────────────────────────────────────────────

function Icon({ d, size = 18, className = "" }: { d: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}

const icons = {
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  dashboard: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  incident: "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
  threat: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  assets: "M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7",
  alerts: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  reports: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  team: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  trendUp: "M22 7l-8.5 8.5-5-5L2 17",
  trendDown: "M22 17l-8.5-8.5-5 5L2 7",
  chevronRight: "M9 18l6-6-6-6",
  moreHoriz: "M5 12h.01M12 12h.01M19 12h.01",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  check: "M20 6L9 17l-5-5",
  clock: "M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  cpu: "M12 2a10 10 0 100 20A10 10 0 0012 2zM12 8v4l3 3",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
};

// ── Data ─────────────────────────────────────────────────────────────────────

const chartData = [
  { day: "Mon", incidents: 8, resolved: 5 },
  { day: "Tue", incidents: 14, resolved: 10 },
  { day: "Wed", incidents: 11, resolved: 9 },
  { day: "Thu", incidents: 19, resolved: 13 },
  { day: "Fri", incidents: 16, resolved: 12 },
  { day: "Sat", incidents: 9, resolved: 8 },
  { day: "Sun", incidents: 12, resolved: 7 },
];

const incidents = [
  { id: "INC-1024", name: "Suspicious Database Access", severity: "Critical", status: "Investigating", assets: 8, assignee: "Arjun Kumar", time: "12 min ago" },
  { id: "INC-1023", name: "Phishing Campaign Detected", severity: "High", status: "Contained", assets: 5, assignee: "Priya Shah", time: "35 min ago" },
  { id: "INC-1022", name: "Malware Infection", severity: "High", status: "Investigating", assets: 3, assignee: "Rahul Menon", time: "1 hr ago" },
  { id: "INC-1021", name: "Unauthorized Login Attempts", severity: "Medium", status: "Resolved", assets: 2, assignee: "Ananya Rao", time: "2 hrs ago" },
  { id: "INC-1020", name: "Data Exfiltration Attempt", severity: "Critical", status: "Investigating", assets: 11, assignee: "Arjun Kumar", time: "3 hrs ago" },
  { id: "INC-1019", name: "Ransomware Signature Detected", severity: "High", status: "Contained", assets: 4, assignee: "Priya Shah", time: "5 hrs ago" },
];

const alerts = [
  { severity: "Critical", title: "Database brute force detected", desc: "192.168.1.45 → prod-db-01 — 847 failed auth attempts in 60s", time: "2 min ago" },
  { severity: "High", title: "Lateral movement via SMB", desc: "Workstation WS-042 scanning internal subnet on port 445", time: "18 min ago" },
  { severity: "High", title: "Suspicious PowerShell execution", desc: "Encoded payload detected on endpoint EP-0091", time: "41 min ago" },
  { severity: "Medium", title: "Unusual outbound traffic spike", desc: "Egress to 185.234.x.x — 2.4 GB transferred over 20 min", time: "1 hr ago" },
  { severity: "Medium", title: "New admin account created", desc: "Account 'svc_backup2' created outside change window", time: "2 hrs ago" },
  { severity: "Low", title: "SSL certificate expiring soon", desc: "api.internal.corp expires in 6 days", time: "4 hrs ago" },
];

const navItems = [
  { icon: icons.dashboard, label: "Dashboard", active: true },
  { icon: icons.incident, label: "Incidents", badge: 12 },
  { icon: icons.threat, label: "Threat Intelligence" },
  { icon: icons.assets, label: "Assets" },
  { icon: icons.alerts, label: "Alerts", badge: 18 },
  { icon: icons.reports, label: "Reports" },
  { icon: icons.team, label: "Team" },
];

// ── Color helpers ─────────────────────────────────────────────────────────────

const severityConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Critical: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  High: { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-400" },
  Medium: { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-400" },
  Low: { bg: "bg-sky-500/10", text: "text-sky-400", dot: "bg-sky-400" },
};

const statusConfig: Record<string, { bg: string; text: string }> = {
  Investigating: { bg: "bg-orange-500/10", text: "text-orange-400" },
  Contained: { bg: "bg-cyan-500/10", text: "text-cyan-400" },
  Resolved: { bg: "bg-green-500/10", text: "text-green-400" },
};

function SeverityBadge({ level }: { level: string }) {
  const cfg = severityConfig[level] ?? severityConfig.Low;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {level}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? statusConfig.Investigating;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {status}
    </span>
  );
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) {
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

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, iconPath, trend, trendUp, accent,
}: {
  label: string; value: number | string; iconPath: string; trend: string; trendUp: boolean; accent: string;
}) {
  return (
    <div className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-6 flex flex-col gap-4 hover:border-[#1e3a6e] transition-colors duration-200 group">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon d={iconPath} size={20} className="opacity-90" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? "text-green-400" : "text-red-400"}`}>
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

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[#070f20] border-r border-[#152a52] flex flex-col z-30 select-none">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#152a52]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-cyan-400 rounded-xl flex items-center justify-center">
            <Icon d={icons.shield} size={18} className="text-[#050d1a]" />
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight">Breach</span>
            <span className="text-cyan-400 font-bold text-base tracking-tight">Buddy</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-hide">
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest px-3 mb-2">Main</p>
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
              ${item.active
                ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#0f2040]"
              }`}
          >
            <div className="flex items-center gap-3">
              <Icon d={item.icon} size={16} className={item.active ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"} />
              {item.label}
            </div>
            {item.badge && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.active ? "bg-cyan-400/20 text-cyan-400" : "bg-[#152a52] text-slate-400"}`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}

        <div className="pt-4 mt-4 border-t border-[#152a52]">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest px-3 mb-2">System</p>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-[#0f2040] transition-all duration-150 group">
            <Icon d={icons.settings} size={16} className="text-slate-500 group-hover:text-slate-300" />
            Settings
          </button>
        </div>
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-[#152a52]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#0f2040] cursor-pointer transition-colors duration-150 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            AK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">Arjun Kumar</p>
            <p className="text-xs text-slate-500 truncate">SOC Analyst</p>
          </div>
          <Icon d={icons.logout} size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
        </div>
      </div>
    </aside>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────

function Header() {
  return (
    <header className="fixed top-0 left-[240px] right-0 h-[64px] bg-[#070f20]/95 backdrop-blur-md border-b border-[#152a52] flex items-center px-8 gap-4 z-20">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Icon d={icons.search} size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search incidents, assets, alerts..."
          className="w-full bg-[#0a1628] border border-[#152a52] rounded-xl pl-9 pr-4 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all duration-200"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Org name */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a1628] border border-[#152a52]">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-300">Acme Corp</span>
        </div>

        {/* Bell */}
        <button className="relative w-9 h-9 rounded-xl bg-[#0a1628] border border-[#152a52] flex items-center justify-center text-slate-400 hover:text-slate-200 hover:border-[#1e3a6e] transition-all duration-150">
          <Icon d={icons.bell} size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#070f20]" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer">
          AK
        </div>
      </div>
    </header>
  );
}

// ── Threat Severity Bar ───────────────────────────────────────────────────────

function ThreatBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = Math.round((count / total) * 100);
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

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<"incidents" | "resolved">("incidents");

  return (
    <div className="min-h-screen bg-[#050d1a]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar />
      <Header />

      {/* Main content */}
      <main className="ml-[240px] pt-[64px] min-h-screen">
        <div className="p-8 max-w-[1200px] mx-auto space-y-8">

          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Security Overview</h1>
              <p className="text-slate-400 text-sm mt-1">Monitor your organization's security posture and active incidents.</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Status pill */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-green-500/5 border border-green-500/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
                </span>
                <span className="text-sm font-medium text-green-400">System Status: Protected</span>
              </div>
              <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#0a1628] border border-[#152a52] text-slate-400 text-sm hover:text-slate-200 hover:border-[#1e3a6e] transition-all">
                <Icon d={icons.filter} size={14} />
                Filter
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Active Incidents" value={12} iconPath={icons.incident} trend="+3 today" trendUp={false} accent="bg-orange-500/10 text-orange-400" />
            <KpiCard label="Critical Threats" value={4} iconPath={icons.threat} trend="+1 today" trendUp={false} accent="bg-red-500/10 text-red-400" />
            <KpiCard label="Affected Assets" value={27} iconPath={icons.assets} trend="+5 this week" trendUp={false} accent="bg-purple-500/10 text-purple-400" />
            <KpiCard label="Open Alerts" value={18} iconPath={icons.alerts} trend="-2 today" trendUp={true} accent="bg-cyan-500/10 text-cyan-400" />
          </div>

          {/* Chart + Severity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Incident chart */}
            <div className="lg:col-span-2 bg-[#0a1628] border border-[#152a52] rounded-2xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-base font-semibold text-white">Security Incidents</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Last 7 days</p>
                </div>
                <div className="flex items-center gap-1 bg-[#0f2040] rounded-lg p-0.5">
                  {(["incidents", "resolved"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all duration-150 ${activeTab === t ? "bg-cyan-400/10 text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-3 h-1 rounded-full bg-cyan-400 inline-block" /> Total Incidents
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
                  <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="incidents" name="Incidents" stroke="#22d3ee" strokeWidth={2} fill="url(#gradCyan)" dot={false} activeDot={{ r: 4, fill: "#22d3ee", stroke: "#050d1a", strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#3b82f6" strokeWidth={2} fill="url(#gradBlue)" dot={false} activeDot={{ r: 4, fill: "#3b82f6", stroke: "#050d1a", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Threat Severity */}
            <div className="bg-[#0a1628] border border-[#152a52] rounded-2xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-base font-semibold text-white">Threat Severity</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Current distribution</p>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-[#0f2040] px-2 py-1 rounded-md">50 total</span>
              </div>

              <div className="space-y-5">
                <ThreatBar label="Critical" count={4} total={50} color="bg-red-400" />
                <ThreatBar label="High" count={8} total={50} color="bg-orange-400" />
                <ThreatBar label="Medium" count={15} total={50} color="bg-yellow-400" />
                <ThreatBar label="Low" count={23} total={50} color="bg-sky-400" />
              </div>

              {/* Summary boxes */}
              <div className="mt-6 pt-5 border-t border-[#152a52] grid grid-cols-2 gap-3">
                <div className="bg-[#0f2040] rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-white">24%</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">High+Critical</p>
                </div>
                <div className="bg-[#0f2040] rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-cyan-400">76%</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">Manageable</p>
                </div>
              </div>
            </div>
          </div>

          {/* Incidents Table + Alerts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Table */}
            <div className="xl:col-span-2 bg-[#0a1628] border border-[#152a52] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#152a52]">
                <div>
                  <h2 className="text-base font-semibold text-white">Recent Incidents</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Active and recently updated</p>
                </div>
                <button className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                  View all <Icon d={icons.chevronRight} size={12} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#152a52]">
                      {["Incident ID", "Incident", "Severity", "Status", "Assets", "Assigned To", "Detected"].map((col) => (
                        <th key={col} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap first:pl-6 last:pr-6">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((inc, i) => (
                      <tr
                        key={inc.id}
                        className={`border-b border-[#0f1f38] hover:bg-[#0f2040] transition-colors duration-100 cursor-pointer ${i === incidents.length - 1 ? "border-none" : ""}`}
                      >
                        <td className="px-4 py-3.5 pl-6">
                          <span className="font-mono text-xs text-cyan-400 font-medium">{inc.id}</span>
                        </td>
                        <td className="px-4 py-3.5 max-w-[180px]">
                          <span className="text-slate-200 text-sm font-medium leading-snug">{inc.name}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <SeverityBadge level={inc.severity} />
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={inc.status} />
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-slate-300 text-sm">{inc.assets}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#152a52] flex items-center justify-center text-[9px] font-bold text-cyan-400 flex-shrink-0">
                              {inc.assignee.split(" ").map(n => n[0]).join("")}
                            </div>
                            <span className="text-slate-300 text-xs whitespace-nowrap">{inc.assignee}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 pr-6">
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs whitespace-nowrap">
                            <Icon d={icons.clock} size={11} />
                            {inc.time}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-[#0a1628] border border-[#152a52] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-5 border-b border-[#152a52]">
                <div>
                  <h2 className="text-base font-semibold text-white">Recent Alerts</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Live feed</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
                  </span>
                  <span className="text-[10px] text-red-400 font-medium">Live</span>
                </div>
              </div>

              <div className="divide-y divide-[#0f1f38] overflow-y-auto max-h-[480px] scrollbar-hide">
                {alerts.map((alert, i) => {
                  const cfg = severityConfig[alert.severity] ?? severityConfig.Low;
                  return (
                    <div key={i} className="px-5 py-4 hover:bg-[#0f2040] transition-colors duration-100 cursor-pointer group">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                          <Icon d={icons.alerts} size={13} className={cfg.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`text-[10px] font-semibold uppercase tracking-wider ${cfg.text}`}>{alert.severity}</span>
                            <span className="text-[10px] text-slate-600 whitespace-nowrap">{alert.time}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-200 leading-snug mb-1">{alert.title}</p>
                          <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{alert.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-5 py-3.5 border-t border-[#152a52]">
                <button className="w-full text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors flex items-center justify-center gap-1">
                  View all alerts <Icon d={icons.chevronRight} size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom padding */}
          <div className="h-4" />
        </div>
      </main>
    </div>
  );
}
