import React from 'react';
import { Icon, icons } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate, Link } from '../../router';

interface NavItem {
  icon: string;
  label: string;
  path: string;
  badge?: number;
}

export const Sidebar: React.FC<{ activeIncidentCount?: number }> = ({ activeIncidentCount }) => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    { icon: icons.dashboard, label: 'Dashboard', path: '/' },
    { icon: icons.incident, label: 'Incidents', path: '/incidents', badge: activeIncidentCount },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'BB';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[#070f20] border-r border-[#152a52] flex flex-col z-30 select-none">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#152a52]">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-400/20">
            <Icon d={icons.shield} size={18} className="text-[#050d1a]" />
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight">Breach</span>
            <span className="text-cyan-400 font-bold text-base tracking-tight">Buddy</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-hide">
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest px-3 mb-2">Main</p>
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f2040]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  d={item.icon}
                  size={16}
                  className={isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-cyan-400/20 text-cyan-400' : 'bg-[#152a52] text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-[#152a52]">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest px-3 mb-2">Quick Access</p>
          <div className="px-3 py-2 text-xs text-slate-500 leading-relaxed">
            AI Triage & ISO-standard Breach Response Platform
          </div>
        </div>
      </nav>

      {/* User / Logout */}
      <div className="px-3 py-4 border-t border-[#152a52]">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-[#0f2040] transition-colors duration-150">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 shadow-md">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name || 'Security Lead'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'SOC Analyst'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <Icon d={icons.logout} size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
