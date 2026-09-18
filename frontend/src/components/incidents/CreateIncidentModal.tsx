import React, { useState } from 'react';
import { incidentApi } from '../../api/endpoints';
import { IncidentSeverity, IncidentStatus } from '../../types';
import { Icon, icons } from '../common/Icons';
import { useNavigate } from '../../router';

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const COMMON_DATA_TAGS = [
  'Names',
  'Email Addresses',
  'Phone Numbers',
  'Registration Numbers',
  'Hashed Passwords',
  'IP Addresses',
  'Financial Records',
  'Internal Credentials',
];

export const CreateIncidentModal: React.FC<CreateIncidentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [incidentType, setIncidentType] = useState('accidental_data_exposure');
  const [affectedSystem, setAffectedSystem] = useState('');
  const [discoveryTime, setDiscoveryTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [severity, setSeverity] = useState<IncidentSeverity>('medium');
  const [currentStatus, setCurrentStatus] = useState<IncidentStatus>('suspected');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Names', 'Email Addresses']);
  const [customTag, setCustomTag] = useState('');
  const [description, setDescription] = useState('');
  const [actionsAlreadyTaken, setActionsAlreadyTaken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTag.trim()) {
      e.preventDefault();
      if (!selectedTags.includes(customTag.trim())) {
        setSelectedTags([...selectedTags, customTag.trim()]);
      }
      setCustomTag('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !affectedSystem.trim() || !description.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isoDiscoveryTime = new Date(discoveryTime).toISOString();
      const res = await incidentApi.create({
        title: title.trim(),
        incidentType,
        affectedSystem: affectedSystem.trim(),
        discoveryTime: isoDiscoveryTime,
        severity,
        currentStatus,
        possibleDataExposed: selectedTags,
        description: description.trim(),
        actionsAlreadyTaken: actionsAlreadyTaken.trim(),
      });

      onSuccess?.();
      onClose();
      if (res && res.incident) {
        navigate(`/incidents/${res.incident.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create incident record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0a1628] border border-[#152a52] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#152a52] bg-[#070f20]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Icon d={icons.incident} size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Report Security Incident</h2>
              <p className="text-xs text-slate-400">Log an unverified or suspected data exposure for triage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#152a52] transition-colors"
          >
            <Icon d={icons.close} size={16} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1 scrollbar-hide">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
              <Icon d={icons.alertCircle} size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Incident Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Student Portal Misconfiguration Exposure"
              required
              className="w-full bg-[#070f20] border border-[#152a52] rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          {/* Grid: Type & System */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Incident Classification *
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full bg-[#070f20] border border-[#152a52] rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400/50"
              >
                <option value="accidental_data_exposure">Accidental Data Exposure</option>
                <option value="phishing">Phishing Campaign</option>
                <option value="ransomware">Ransomware Activity</option>
                <option value="malware">Malware Infection</option>
                <option value="unauthorized_access">Unauthorized DB/System Access</option>
                <option value="data_exfiltration">Data Exfiltration Suspected</option>
                <option value="other">Other Incident Type</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Affected System / Asset *
              </label>
              <input
                type="text"
                value={affectedSystem}
                onChange={(e) => setAffectedSystem(e.target.value)}
                placeholder="e.g. PostgreSQL Cluster db-prod-01"
                required
                className="w-full bg-[#070f20] border border-[#152a52] rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50"
              >
              </input>
            </div>
          </div>

          {/* Grid: Discovery Time & Severity & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Discovery Timestamp *
              </label>
              <input
                type="datetime-local"
                value={discoveryTime}
                onChange={(e) => setDiscoveryTime(e.target.value)}
                required
                className="w-full bg-[#070f20] border border-[#152a52] rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Initial Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                className="w-full bg-[#070f20] border border-[#152a52] rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400/50"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Lifecycle Status
              </label>
              <select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value as IncidentStatus)}
                className="w-full bg-[#070f20] border border-[#152a52] rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400/50"
              >
                <option value="suspected">Suspected</option>
                <option value="investigating">Investigating</option>
                <option value="contained">Contained</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Data Exposed Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Potentially Exposed Data Categories
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_DATA_TAGS.map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      selected
                        ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                        : 'bg-[#070f20] text-slate-400 border border-[#152a52] hover:text-slate-200'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={handleAddCustomTag}
              placeholder="Type custom data category and hit Enter..."
              className="w-full bg-[#070f20] border border-[#152a52] rounded-xl px-4 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Description & Telemetry Evidence *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe how the exposure occurred, ports involved, or logs detected..."
              required
              className="w-full bg-[#070f20] border border-[#152a52] rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          {/* Actions Taken */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Actions Already Taken (Prior Containment)
            </label>
            <textarea
              rows={2}
              value={actionsAlreadyTaken}
              onChange={(e) => setActionsAlreadyTaken(e.target.value)}
              placeholder="e.g. Isolated database port 5432, revoked exposed service token..."
              className="w-full bg-[#070f20] border border-[#152a52] rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-[#152a52] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#050d1a] font-bold text-sm shadow-md shadow-cyan-400/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#050d1a] border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Icon d={icons.check} size={16} />
                  <span>Create & Launch Triage</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIncidentModal;
