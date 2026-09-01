import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Gift,
  ShieldCheck,
  Lock,
  Calendar,
  Users,
  CheckCircle,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const CampaignsPage = () => {
  const { setSelectedCampaignForDonation, requireAuth, refreshKey } = useApp();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'child' | 'animal' | 'elderly'

  useEffect(() => {
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCampaigns(data.data);
        setLoading(false);
      });
  }, [refreshKey]);

  const filtered = campaigns.filter(c => activeTab === 'all' || c.category === activeTab);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
            <Lock className="w-3.5 h-3.5" /> Anonymous by Default Giving
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Urgent Relief Campaigns & 80G Tax Exemption
          </h1>
          <p className="text-xs text-emerald-100 max-w-xl leading-relaxed">
            Donate with total identity privacy. Your donation is automatically hidden from public feeds while generating instant 80G tax receipts.
          </p>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Campaigns' },
          { id: 'child', label: '👶 Child Nutrition & Shelter' },
          { id: 'animal', label: '🐕 Animal Trauma & Ambulance' },
          { id: 'elderly', label: '👴 Senior Palliative & Medical' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === t.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading active campaigns...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((camp) => {
            const percent = Math.min(100, Math.round((camp.raisedAmount / camp.targetAmount) * 100));
            return (
              <div
                key={camp.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative h-48">
                  <img src={camp.banner} alt={camp.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                    {camp.daysLeft} Days Remaining
                  </div>
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                    80G Verified
                  </div>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[11px] text-emerald-700 font-extrabold uppercase tracking-wider">
                      {camp.ngoName}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
                      {camp.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {camp.description}
                    </p>
                  </div>

                  {/* Fund Target & Progress */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-xs font-extrabold">
                      <span className="text-slate-900">₹{camp.raisedAmount.toLocaleString('en-IN')}</span>
                      <span className="text-slate-400">of ₹{camp.targetAmount.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 font-medium pt-0.5">
                      <span>{percent}% Funded</span>
                      <span>{camp.donorCount} Generous Donors</span>
                    </div>

                    {/* Transparency Update snippet */}
                    {camp.transparencyUpdates && camp.transparencyUpdates.length > 0 && (
                      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-2.5 text-[11px] space-y-1">
                        <div className="flex items-center gap-1 font-bold text-emerald-900">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Latest Utilization Proof:</span>
                        </div>
                        <p className="text-emerald-800 line-clamp-2">
                          {camp.transparencyUpdates[0].description} ({camp.transparencyUpdates[0].cost})
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => requireAuth(() => setSelectedCampaignForDonation(camp), 'Please log in or create an account to donate.')}
                      className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Donate Anonymously (80G Tax Receipt)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
