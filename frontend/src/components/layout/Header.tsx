import React from 'react';
import { Icon, icons } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onNewIncidentClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewIncidentClick,
  searchQuery,
  onSearchChange,
}) => {
  const { user } = useAuth();

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
    <header className="fixed top-0 left-[240px] right-0 h-[64px] bg-[#070f20]/95 backdrop-blur-md border-b border-[#152a52] flex items-center px-8 gap-4 z-20">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Icon d={icons.search} size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchQuery || ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search incidents, assets, logs..."
          className="w-full bg-[#0a1628] border border-[#152a52] rounded-xl pl-9 pr-4 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all duration-200"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* New Incident Quick Button */}
        {onNewIncidentClick && (
          <button
            onClick={onNewIncidentClick}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-400 text-[#050d1a] font-semibold text-xs hover:bg-cyan-300 shadow-md shadow-cyan-400/20 transition-all cursor-pointer"
          >
            <Icon d={icons.plus} size={14} className="stroke-[2.5]" />
            Report Incident
          </button>
        )}

        {/* Org badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a1628] border border-[#152a52]">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-300">BreachBuddy SOC</span>
        </div>

        {/* Bell */}
        <button
          title="Notifications"
          className="relative w-9 h-9 rounded-xl bg-[#0a1628] border border-[#152a52] flex items-center justify-center text-slate-400 hover:text-slate-200 hover:border-[#1e3a6e] transition-all"
        >
          <Icon d={icons.bell} size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#070f20]" />
        </button>

        {/* Avatar */}
        <div
          title={user?.name || 'User Profile'}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md select-none cursor-pointer"
        >
          {getInitials(user?.name)}
        </div>
      </div>
    </header>
  );
};

export default Header;
