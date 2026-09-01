import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  LayoutDashboard,
  Users,
  TrendingUp,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminDashboardPage = () => {
  const { refreshKey, triggerRefresh, apiFetch } = useApp();
  const [activeTab, setActiveTab] = useState('verification'); // 'verification' | 'analytics' | 'disputes'
  const [pendingNgos, setPendingNgos] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [ngoRes, anRes] = await Promise.all([
        apiFetch('/api/admin/pending-ngos'),
        apiFetch('/api/admin/analytics')
      ]);
      const ngoData = await ngoRes.json();
      const anData = await anRes.json();

      if (ngoData.success) setPendingNgos(ngoData.data);
      if (anData.success) setAnalytics(anData.data);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [refreshKey]);

  const handleVerify = async (ngoId, action) => {
    try {
      const res = await apiFetch(`/api/admin/verify-ngo/${ngoId}`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'approve') {
          confetti({ particleCount: 70, spread: 60 });
        }
        alert(data.message);
        triggerRefresh();
      }
    } catch (err) {
      console.error('Verification error:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl border border-purple-900/40">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-purple-500/20 text-purple-300 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Platform Governance & Moderation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Control Center
          </h1>
          <p className="text-xs text-purple-200">
            Manage NGO Darpan accreditation, 80G verification, emergency dispute moderation, and platform metrics.
          </p>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-500 uppercase">Emergency Incidents</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{analytics.totalIncidents}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">{analytics.resolutionRate}% Resolved</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-500 uppercase">Avg Response Time</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">14 Mins</div>
            <div className="text-[11px] text-slate-400">Geo Auto-Routed</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-500 uppercase">Total 80G Funds</div>
            <div className="text-2xl font-black text-blue-600 mt-1">₹{analytics.totalDonations.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-slate-400">100% Anonymized</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-500 uppercase">Verified NGOs</div>
            <div className="text-2xl font-black text-purple-600 mt-1">{analytics.verifiedNgos}</div>
            <div className="text-[11px] text-amber-600 font-semibold">{pendingNgos.length} Pending Approval</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('verification')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
            activeTab === 'verification'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>NGO Verification Queue ({pendingNgos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
            activeTab === 'disputes'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Incident Audit & Moderation</span>
        </button>
      </div>

      {/* Verification Queue */}
      {activeTab === 'verification' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
              Pending Accreditation Applications
            </h3>
            <span className="text-xs text-slate-500">Examine Darpan IDs & Statutory Certificates</span>
          </div>

          {pendingNgos.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 mt-2">All NGO Applications Verified!</h4>
              <p className="text-xs text-slate-500">No pending verification items in the queue.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingNgos.map((ngo) => (
                <div
                  key={ngo.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <img
                        src={ngo.logo}
                        alt={ngo.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900">{ngo.name}</h4>
                        <p className="text-xs text-slate-500">
                          {ngo.city} • Category: <strong className="uppercase">{ngo.category}</strong>
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{ngo.description}</p>

                    {/* Document Proof Badges */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Submitted Statutory Credentials:
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-1 rounded-lg font-mono">
                          Darpan ID: {ngo.darpanId}
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-mono">
                          Reg No: {ngo.registrationNo}
                        </span>
                        {ngo.verifiedDocuments?.map((doc, idx) => (
                          <span
                            key={idx}
                            className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{doc}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center gap-2 shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <button
                      onClick={() => handleVerify(ngo.id, 'approve')}
                      className="w-full sm:w-40 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold py-2.5 rounded-xl shadow-md transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve NGO</span>
                    </button>

                    <button
                      onClick={() => handleVerify(ngo.id, 'reject')}
                      className="w-full sm:w-40 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold py-2.5 rounded-xl transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject / Request Info</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Disputes / Moderation Tab */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
            Emergency Incident Audit Log
          </h3>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>Audit Item #AUD-8812</span>
              <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Resolved</span>
            </div>
            <p className="text-slate-600">
              Verified geo-dispatch timestamp for Incident #inc-101. On-ground team arrived in 8 minutes. No anomalies detected.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
