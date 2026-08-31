import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  MapPin,
  Clock,
  Search,
  Filter,
  Navigation,
  Building2,
  User,
  CheckCircle2,
  ChevronRight,
  EyeOff,
  Sparkles
} from 'lucide-react';

export const IncidentTrackerPage = () => {
  const {
    setIsReportModalOpen,
    setSelectedIncidentForTimeline,
    refreshKey
  } = useApp();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      let url = `/api/incidents?category=${selectedCategory}&priority=${selectedPriority}&status=${selectedStatus}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setIncidents(data.data);
      }
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [selectedCategory, selectedPriority, selectedStatus, refreshKey]);

  const filteredIncidents = incidents.filter(i => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      i.description.toLowerCase().includes(q) ||
      i.address.toLowerCase().includes(q) ||
      i.categoryLabel.toLowerCase().includes(q) ||
      (i.assignedNgoName && i.assignedNgoName.toLowerCase().includes(q))
    );
  });

  const priorityStyles = {
    critical: 'bg-red-100 text-red-800 border-red-200 animate-pulse',
    high: 'bg-amber-100 text-amber-800 border-amber-200',
    medium: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const statusColors = {
    reported: 'bg-slate-100 text-slate-800',
    assigned: 'bg-blue-100 text-blue-800',
    accepted: 'bg-indigo-100 text-indigo-800',
    team_dispatched: 'bg-amber-100 text-amber-800',
    reached_location: 'bg-purple-100 text-purple-800',
    help_provided: 'bg-teal-100 text-teal-800',
    resolved: 'bg-emerald-100 text-emerald-800',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live SOS Dispatch Central</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Smart Emergency Incident System</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl font-medium">
            Multi-stage incident tracking from public report $\rightarrow$ automatic nearest NGO auto-route $\rightarrow$ live on-ground team rescue.
          </p>
        </div>

        <button
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-extrabold px-6 py-3 rounded-2xl shadow-lg shadow-red-500/30 transform active:scale-95 transition-all shrink-0"
        >
          <AlertTriangle className="w-4 h-4 animate-bounce" />
          <span>Report New Incident (SOS)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by area, description, NGO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-hidden bg-slate-50 text-slate-700"
          >
            <option value="all">All Emergency Categories</option>
            <option value="child">👶 Child in Distress</option>
            <option value="elderly">👴 Elderly Needing Help</option>
            <option value="homeless">🏠 Homeless Relief</option>
            <option value="medical">🏥 Medical Emergency</option>
            <option value="animal">🐕 Animal in Distress</option>
            <option value="disability">♿ Person with Disability</option>
            <option value="other">🔥 Other Emergency</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-hidden bg-slate-50 text-slate-700"
          >
            <option value="all">All Priority Levels</option>
            <option value="critical">🚨 Critical (SOS Immediate)</option>
            <option value="high">⚠️ High Priority</option>
            <option value="medium">🔷 Medium Priority</option>
            <option value="low">▫️ Low / Routine</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-hidden bg-slate-50 text-slate-700"
          >
            <option value="all">All Status Stages</option>
            <option value="reported">Reported</option>
            <option value="assigned">NGO Assigned</option>
            <option value="accepted">NGO Accepted</option>
            <option value="team_dispatched">Team Dispatched</option>
            <option value="reached_location">Reached Location</option>
            <option value="help_provided">Help Provided</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Incidents List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          Loading live incident feed...
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Incidents Found</h3>
          <p className="text-xs text-slate-500">No active reports match the selected filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => setSelectedIncidentForTimeline(inc)}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Left Details */}
              <div className="flex items-start gap-4 flex-1">
                <img
                  src={inc.photoUrl}
                  alt="Site snapshot"
                  className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200 shadow-xs"
                />

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base">{inc.categoryIcon}</span>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {inc.categoryLabel}
                    </h3>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${priorityStyles[inc.priority]}`}>
                      {inc.priority} Priority
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">#{inc.id}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 font-medium leading-relaxed">
                    {inc.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{inc.address}</span>
                    </div>

                    <div className="flex items-center gap-1 font-semibold text-blue-700">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{inc.assignedNgoName}</span>
                    </div>

                    {inc.isAnonymous ? (
                      <div className="flex items-center gap-1 text-slate-400">
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Anonymous Report</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-500">
                        <User className="w-3.5 h-3.5" />
                        <span>{inc.reporterName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Status & Timeline Trigger */}
              <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span className={`text-xs font-extrabold px-3 py-1 rounded-xl uppercase tracking-wide ${statusColors[inc.status] || 'bg-slate-100 text-slate-800'}`}>
                  {inc.status.replace('_', ' ')}
                </span>
                <span className="text-[11px] text-emerald-600 font-bold mt-2 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  <span>Interactive Timeline</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
