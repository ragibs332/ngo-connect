import React, { useState } from 'react';
import { useApp, ROLES } from '../context/AppContext';
import {
  X,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  User,
  ShieldAlert,
  ChevronRight,
  Send,
  Phone,
  Navigation,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STAGES = [
  { id: 'reported', label: 'Reported', icon: '📝' },
  { id: 'assigned', label: 'NGO Assigned', icon: '📍' },
  { id: 'accepted', label: 'NGO Accepted', icon: '🤝' },
  { id: 'team_dispatched', label: 'Team Dispatched', icon: '🚑' },
  { id: 'reached_location', label: 'Reached Location', icon: '🏁' },
  { id: 'help_provided', label: 'Help Provided', icon: '🩹' },
  { id: 'resolved', label: 'Resolved', icon: '✅' },
];

export const IncidentTimelineModal = () => {
  const {
    selectedIncidentForTimeline,
    setSelectedIncidentForTimeline,
    currentRole,
    triggerRefresh
  } = useApp();

  const [statusNote, setStatusNote] = useState('');
  const [resolvedOutcomeNote, setResolvedOutcomeNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!selectedIncidentForTimeline) return null;
  const incident = selectedIncidentForTimeline;

  // Determine current stage index
  const currentStageIndex = STAGES.findIndex(s => s.id === incident.status);
  const nextStage = STAGES[currentStageIndex + 1];

  const handleAdvanceStatus = async (targetStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/incidents/${incident.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          note: statusNote || undefined,
          resolvedNote: targetStatus === 'resolved' ? (resolvedOutcomeNote || 'Case resolved successfully with on-ground aid.') : undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        if (targetStatus === 'resolved') {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        setSelectedIncidentForTimeline(data.data);
        setStatusNote('');
        setResolvedOutcomeNote('');
        triggerRefresh();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update incident status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const priorityBadge = {
    critical: 'bg-red-100 text-red-800 border-red-200 animate-pulse',
    high: 'bg-amber-100 text-amber-800 border-amber-200',
    medium: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-slate-100 text-slate-800 border-slate-200',
  }[incident.priority] || 'bg-slate-100 text-slate-800';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl">{incident.categoryIcon}</span>
              <span className="text-sm font-extrabold tracking-wide uppercase">{incident.categoryLabel}</span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${priorityBadge}`}>
                {incident.priority} Priority
              </span>
              <span className="text-[11px] text-slate-400 font-mono">#{incident.id}</span>
            </div>
            <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>{incident.address}</span>
            </p>
          </div>
          <button
            onClick={() => setSelectedIncidentForTimeline(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</h4>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">{incident.description}</p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <div className="bg-blue-50 border border-blue-200 text-blue-900 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Assigned NGO: <strong>{incident.assignedNgoName || 'Pending'}</strong></span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Reporter: <strong>{incident.isAnonymous ? 'Anonymous Citizen' : incident.reporterName}</strong></span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative h-36 md:h-auto">
              <img
                src={incident.photoUrl}
                alt="Incident site"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                Live Geo Snapshot
              </div>
            </div>
          </div>

          {/* FLAGSHIP: 7-Stage Live Incident Timeline */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Live Response Timeline Tracker</span>
              </h4>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Status: {incident.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Step Progress Bar (Horizontal on desktop) */}
            <div className="hidden sm:grid grid-cols-7 gap-1 bg-slate-100 p-2 rounded-2xl mb-6">
              {STAGES.map((st, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div
                    key={st.id}
                    className={`p-2 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 text-white font-bold shadow-md ring-2 ring-emerald-400/40'
                        : isPassed
                        ? 'bg-emerald-100 text-emerald-900 font-semibold'
                        : 'text-slate-400 font-medium'
                    }`}
                  >
                    <span className="text-base">{st.icon}</span>
                    <span className="text-[10px] mt-1 leading-tight">{st.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Detailed Timeline Events List */}
            <div className="relative pl-6 border-l-2 border-emerald-500 space-y-4">
              {incident.statusTimeline.map((item, idx) => {
                const isLatest = idx === incident.statusTimeline.length - 1;
                return (
                  <div key={idx} className="relative group">
                    {/* Dot */}
                    <div
                      className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                        isLatest ? 'bg-emerald-600 ring-4 ring-emerald-200' : 'bg-emerald-400'
                      }`}
                    />
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800">{item.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{item.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resolved Final Outcome Note Box if Resolved */}
          {incident.status === 'resolved' && incident.resolvedNote && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Official Resolution Report</h5>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed font-medium">{incident.resolvedNote}</p>
              </div>
            </div>
          )}

          {/* NGO & Admin Action Control Panel to Advance Stages */}
          {(currentRole === ROLES.NGO || currentRole === ROLES.ADMIN) && incident.status !== 'resolved' && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    NGO Rescue Dispatch Controls
                  </h5>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  Next Step: {nextStage?.label}
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder={`Add dispatcher log for ${nextStage?.label} (e.g. Van MH-02 dispatched / reached corner)...`}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 outline-hidden focus:border-emerald-500"
                />

                {nextStage?.id === 'resolved' && (
                  <textarea
                    rows={2}
                    value={resolvedOutcomeNote}
                    onChange={(e) => setResolvedOutcomeNote(e.target.value)}
                    placeholder="Enter final resolution outcome note (e.g. Patient admitted to general hospital ward / safely reunited)..."
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 outline-hidden focus:border-emerald-500"
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  {STAGES.slice(currentStageIndex + 1).map((st) => (
                    <button
                      key={st.id}
                      disabled={isUpdating}
                      onClick={() => handleAdvanceStatus(st.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                        st.id === nextStage?.id
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {st.icon} {st.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleAdvanceStatus(nextStage?.id || 'resolved')}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-md transition-all ml-auto disabled:opacity-50"
                >
                  <span>Advance to {nextStage?.label}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
