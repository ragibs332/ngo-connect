import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  HeartHandshake,
  Search,
  ShieldCheck,
  Baby,
  Gift,
  HandHeart,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  Users,
  Navigation,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const PublicHome = () => {
  const {
    setIsReportModalOpen,
    setActiveTab,
    setSelectedIncidentForTimeline,
    setSelectedCampaignForDonation,
    setSelectedAdoptionForInquiry,
    requireAuth
  } = useApp();

  const [incidents, setIncidents] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [ngos, setNgos] = useState([]);

  useEffect(() => {
    // Fetch recent incidents
    fetch('/api/incidents')
      .then(res => res.json())
      .then(data => {
        if (data.success) setIncidents(data.data.slice(0, 3));
      });

    // Fetch campaigns
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCampaigns(data.data.slice(0, 3));
      });

    // Fetch NGOs
    fetch('/api/ngos?verified=true')
      .then(res => res.json())
      .then(data => {
        if (data.success) setNgos(data.data.slice(0, 4));
      });
  }, []);

  const emergencyCategories = [
    { id: 'child', label: 'Child in Distress', icon: '👶', color: 'from-amber-500 to-orange-600' },
    { id: 'elderly', label: 'Elderly Need Help', icon: '👴', color: 'from-rose-500 to-red-600' },
    { id: 'animal', label: 'Animal Trauma / SOS', icon: '🐕', color: 'from-emerald-500 to-teal-600' },
    { id: 'homeless', label: 'Homeless Shelter', icon: '🏠', color: 'from-blue-500 to-cyan-600' },
    { id: 'medical', label: 'Medical Emergency', icon: '🏥', color: 'from-purple-500 to-indigo-600' },
    { id: 'disability', label: 'Disability Mobility', icon: '♿', color: 'from-teal-500 to-emerald-600' },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* 1. HERO SECTION & LIVE EMERGENCY SOS LAUNCHER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 border border-red-500/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider badge-pulse">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
            <span>Flagship Smart Emergency Incident System</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Spot Someone in Need on the Street?{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              We Auto-Route Verified Help in Minutes.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Report distressed children, injured animals, abandoned elderly, or homeless citizens. Our geo-routing engine instantly dispatches the closest verified NGO rescue team with live step-by-step tracking.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-sm font-extrabold px-7 py-3.5 rounded-2xl shadow-xl shadow-red-600/30 transform active:scale-95 transition-all"
            >
              <AlertTriangle className="w-5 h-5 animate-bounce" />
              <span>Report Emergency Incident (SOS)</span>
            </button>

            <button
              onClick={() => setActiveTab('incidents')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold px-6 py-3.5 rounded-2xl border border-slate-700 transition-all"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Track Live Incidents</span>
            </button>
          </div>

          {/* Platform Stat Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-xs">
            <div>
              <div className="text-xl font-extrabold text-white">100%</div>
              <div className="text-slate-400 text-[11px]">Government Verified NGOs</div>
            </div>
            <div>
              <div className="text-xl font-extrabold text-emerald-400">&lt; 15 Mins</div>
              <div className="text-slate-400 text-[11px]">Average Rescue Response</div>
            </div>
            <div>
              <div className="text-xl font-extrabold text-cyan-400">Anonymous</div>
              <div className="text-slate-400 text-[11px]">Private by Default Giving</div>
            </div>
            <div>
              <div className="text-xl font-extrabold text-amber-400">CARA Compliant</div>
              <div className="text-slate-400 text-[11px]">Legal Adoption Bridge</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EMERGENCY CATEGORIES GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Emergency SOS Categories
            </h2>
            <p className="text-xs text-slate-500">Tap a category to launch immediate localized assistance</p>
          </div>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <span>Launch Form</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {emergencyCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setIsReportModalOpen(true)}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-red-300 hover:shadow-md transition-all text-left flex flex-col justify-between group"
            >
              <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{c.icon}</span>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-red-600 transition-colors">
                  {c.label}
                </h3>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                  Geo Auto-Route
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. LIVE ACTIVE INCIDENTS FEED (Flagship preview) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Live Incident Response Feed
              </h2>
              <p className="text-xs text-slate-500">Real-time status updates across verified rescue teams</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('incidents')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View All Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => setSelectedIncidentForTimeline(inc)}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{inc.categoryIcon}</span>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        {inc.categoryLabel}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">#{inc.id}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      inc.priority === 'critical'
                        ? 'bg-red-100 text-red-800 border-red-200 animate-pulse'
                        : inc.priority === 'high'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}
                  >
                    {inc.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 font-medium">{inc.description}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="truncate">{inc.address}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {inc.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-slate-400 group-hover:text-emerald-600 flex items-center gap-0.5">
                    View Timeline →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED 80G CAMPAIGNS & ANONYMOUS DONATION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Urgent Relief Campaigns
              </h2>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <Lock className="w-3 h-3" /> Anonymous by Default
              </span>
            </div>
            <p className="text-xs text-slate-500">100% verified tax-deductible contributions with transparency logs</p>
          </div>
          <button
            onClick={() => setActiveTab('campaigns')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>All Campaigns</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {campaigns.map((camp) => {
            const percent = Math.min(100, Math.round((camp.raisedAmount / camp.targetAmount) * 100));
            return (
              <div
                key={camp.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative h-44">
                  <img src={camp.banner} alt={camp.title} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                    {camp.daysLeft} Days Left
                  </span>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">
                      {camp.ngoName}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
                      {camp.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{camp.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-900">₹{camp.raisedAmount.toLocaleString('en-IN')}</span>
                      <span className="text-slate-400">Target ₹{camp.targetAmount.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <button
                      onClick={() => requireAuth(() => setSelectedCampaignForDonation(camp), 'Please log in or create an account to donate.')}
                      className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Donate Anonymously (80G)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. CARA COMPLIANT ADOPTION & VOLUNTEERING TEASER */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Adoption Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4 shadow-lg">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
              <Baby className="w-3.5 h-3.5" /> Statutory CARA Discovery Window
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">Child Adoption & Elderly Care</h3>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Explore verified discovery listings for orphaned children governed by CARA under the JJ Act, or sponsor regular companionship and healthcare for senior citizens in old-age homes.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('adoption')}
            className="self-start bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Browse Discovery Profiles</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Volunteering Card */}
        <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4 shadow-lg">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-teal-500/30 text-teal-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
              <HandHeart className="w-3.5 h-3.5" /> Instant QR Code Check-in
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">Join Weekend Volunteer Drives</h3>
            <p className="text-xs text-teal-200 leading-relaxed">
              Feed street clusters, care for shelter animals, or teach children. Register with 1-tap, generate your digital QR Pass, and earn volunteer Karma points.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('volunteering')}
            className="self-start bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Find Volunteer Drives</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
