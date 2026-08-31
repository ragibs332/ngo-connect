import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Building2,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Star,
  Gift,
  HandHeart,
  ExternalLink,
  Users,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export const NgoDirectoryPage = () => {
  const { setSelectedCampaignForDonation, setActiveTab, setIsReportModalOpen } = useApp();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  useEffect(() => {
    fetch('/api/ngos')
      .then(res => res.json())
      .then(data => {
        if (data.success) setNgos(data.data);
        setLoading(false);
      });
  }, []);

  const filteredNgos = ngos.filter(n => {
    if (categoryFilter !== 'all' && n.category !== categoryFilter && !(n.subCategories && n.subCategories.includes(categoryFilter))) {
      return false;
    }
    if (cityFilter !== 'all' && n.city.toLowerCase() !== cityFilter.toLowerCase()) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return n.name.toLowerCase().includes(q) || n.description.toLowerCase().includes(q) || (n.area && n.area.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" /> Government Darpan Verified
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Verified NGO & Orphanage Directory</h1>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Browse accredited non-profits across Child Protection, Animal Rescue, Senior Citizen Care, and Disaster Relief.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search NGO name, cause, locality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-hidden bg-slate-50 text-slate-700"
        >
          <option value="all">All Causes & Specialties</option>
          <option value="child">👶 Child Welfare & Shelter</option>
          <option value="animal">🐕 Animal Trauma & Rescue</option>
          <option value="elderly">👴 Elderly Care & Palliative</option>
          <option value="homeless">🏠 Homeless & Hunger Relief</option>
          <option value="disability">♿ Disability & Mobility</option>
        </select>

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-hidden bg-slate-50 text-slate-700"
        >
          <option value="all">All Locations</option>
          <option value="Mumbai">Mumbai & MMR</option>
          <option value="Pune">Pune Region</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading verified NGOs...</div>
      ) : filteredNgos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
          <h3 className="text-base font-bold text-slate-800">No NGOs Found</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredNgos.map((ngo) => (
            <div
              key={ngo.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={ngo.logo}
                    alt={ngo.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
                  />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{ngo.name}</h3>
                      {ngo.isVerified ? (
                        <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-sm">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Verified
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-sm">
                          Pending Audit
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Darpan ID: <strong>{ngo.darpanId}</strong> • Reg: {ngo.registrationNo}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{ngo.description}</p>

                {/* Info tags */}
                <div className="flex flex-wrap gap-2 text-xs pt-1">
                  <div className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl flex items-center gap-1 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>{ngo.area}, {ngo.city}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl flex items-center gap-1 text-slate-700">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{ngo.rating} Rating</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl flex items-center gap-1 text-slate-700">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span>{ngo.activeVolunteers} Active Volunteers</span>
                  </div>
                </div>

                {/* Urgent Needs if any */}
                {ngo.urgentNeeds && ngo.urgentNeeds.length > 0 && (
                  <div className="bg-red-50/70 border border-red-200 rounded-2xl p-3 space-y-1.5">
                    <div className="text-[11px] font-extrabold uppercase text-red-900 tracking-wider">
                      🚨 Urgent On-Ground Need:
                    </div>
                    {ngo.urgentNeeds.map((need) => (
                      <div key={need.id} className="text-xs text-red-800 font-medium flex items-center justify-between">
                        <span>• {need.title}</span>
                        {need.fundsNeeded && (
                          <span className="font-bold">₹{need.fundsNeeded.toLocaleString()}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2 rounded-xl transition-colors text-center"
                >
                  Report SOS
                </button>
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl transition-colors text-center shadow-xs"
                >
                  Donate (80G)
                </button>
                <button
                  onClick={() => setActiveTab('volunteering')}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl transition-colors text-center"
                >
                  Volunteer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
