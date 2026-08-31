import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  Gift,
  Baby,
  QrCode,
  HandHeart,
  ShieldCheck,
  MapPin,
  Clock,
  Plus,
  CheckCircle2,
  ChevronRight,
  EyeOff,
  Sparkles,
  Phone,
  FileCheck,
  Send,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const NgoDashboardPage = () => {
  const {
    currentUser,
    setSelectedIncidentForTimeline,
    setIsQRScannerOpen,
    refreshKey,
    triggerRefresh
  } = useApp();

  const [activeTab, setActiveTab] = useState('incidents'); // 'incidents' | 'post-need' | 'post-adoption' | 'inquiries' | 'donations'
  const [incidents, setIncidents] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [needTitle, setNeedTitle] = useState('');
  const [needFunds, setNeedFunds] = useState('');
  const [needVolunteers, setNeedVolunteers] = useState('');

  const [adoptType, setAdoptType] = useState('child');
  const [adoptName, setAdoptName] = useState('');
  const [adoptAge, setAdoptAge] = useState('');
  const [adoptGender, setAdoptGender] = useState('Male');
  const [adoptHealth, setAdoptHealth] = useState('');
  const [adoptNote, setAdoptNote] = useState('');

  const fetchNgoData = async () => {
    setLoading(true);
    try {
      // Fetch incidents assigned to this NGO or nearby
      const incRes = await fetch(`/api/incidents?ngoId=${currentUser.ngoId || 'ngo-1'}`);
      const incData = await incRes.json();
      if (incData.success) setIncidents(incData.data);

      // Fetch inquiries
      const inqRes = await fetch(`/api/adoption-inquiries?ngoId=${currentUser.ngoId || 'ngo-1'}`);
      const inqData = await inqRes.json();
      if (inqData.success) setInquiries(inqData.data);

      // Fetch donations (anonymized view)
      const donRes = await fetch(`/api/donations?ngoId=${currentUser.ngoId || 'ngo-1'}`);
      const donData = await donRes.json();
      if (donData.success) setDonations(donData.data);
    } catch (err) {
      console.error('Error fetching NGO data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgoData();
  }, [refreshKey, currentUser]);

  const handlePostNeed = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/ngos/${currentUser.ngoId || 'ngo-1'}/needs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: needTitle,
          fundsNeeded: needFunds ? Number(needFunds) : undefined,
          volunteersNeeded: needVolunteers ? Number(needVolunteers) : undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 70, spread: 60 });
        alert('Need posted to public feed successfully!');
        setNeedTitle('');
        setNeedFunds('');
        setNeedVolunteers('');
        triggerRefresh();
      }
    } catch (err) {
      console.error('Error posting need:', err);
    }
  };

  const handlePostAdoption = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/adoption-listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngoId: currentUser.ngoId || 'ngo-1',
          type: adoptType,
          name: adoptName,
          age: adoptAge,
          gender: adoptGender,
          healthStatus: adoptHealth,
          backgroundNote: adoptNote
        })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 70, spread: 60 });
        alert(`${adoptType === 'child' ? 'Child' : 'Elderly'} listing posted for discovery!`);
        setAdoptName('');
        setAdoptAge('');
        setAdoptHealth('');
        setAdoptNote('');
        triggerRefresh();
      }
    } catch (err) {
      console.error('Error posting adoption listing:', err);
    }
  };

  const handleApproveInquiry = async (inqId, newStatus) => {
    try {
      await fetch(`/api/adoption-inquiries/${inqId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          ngoNote: newStatus === 'approved' ? 'Inquiry accepted. Briefing meeting scheduled.' : 'Inquiry closed.'
        })
      });
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const totalFunds = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const activeIncidentsCount = incidents.filter(i => i.status !== 'resolved').length;

  return (
    <div className="space-y-6 pb-12">
      {/* NGO Header Profile */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl border border-blue-900/40">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified NGO Coordinator Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hope Horizon Child Care & Shelter
          </h1>
          <p className="text-xs text-blue-200">
            Darpan ID: <strong>MH/2019/0234190</strong> • Verified 80G Partner • Andheri West, Mumbai
          </p>
        </div>

        <button
          onClick={() => setIsQRScannerOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all shrink-0"
        >
          <QrCode className="w-4 h-4" />
          <span>Launch QR Attendance Scanner</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Pending SOS Cases</div>
          <div className="text-2xl font-black text-red-600 mt-1">{activeIncidentsCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Funds Raised (Ledger)</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">₹{totalFunds.toLocaleString('en-IN')}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Adoption Inquiries</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{inquiries.length}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Active Volunteers</div>
          <div className="text-2xl font-black text-blue-600 mt-1">140</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {[
          { id: 'incidents', label: '🚨 SOS Emergency Queue', count: activeIncidentsCount },
          { id: 'post-need', label: '📢 Post Need / Campaign' },
          { id: 'post-adoption', label: '👶 Add Adoption Listing (CARA)' },
          { id: 'inquiries', label: '📬 Inquiries Review', count: inquiries.length },
          { id: 'donations', label: '🔒 Anonymized Donor Ledger' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === t.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === t.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: FLAGSHIP INCOMING EMERGENCY QUEUE */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
              Live Assigned Emergency Incidents (Sorted by Urgency)
            </h3>
            <span className="text-xs text-slate-500">Tap an incident to advance on-ground rescue status</span>
          </div>

          {incidents.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 mt-2">No Active Incidents in Queue</h4>
              <p className="text-xs text-slate-500">All assigned cases have been resolved!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentForTimeline(inc)}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={inc.photoUrl}
                      alt="site preview"
                      className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base">{inc.categoryIcon}</span>
                        <h4 className="text-sm font-extrabold text-slate-900">{inc.categoryLabel}</h4>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          inc.priority === 'critical'
                            ? 'bg-red-100 text-red-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inc.priority} Priority
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">#{inc.id}</span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium line-clamp-2">{inc.description}</p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          <span>{inc.address}</span>
                        </div>
                        <div>
                          Reporter: <strong>{inc.isAnonymous ? 'Anonymous Citizen' : inc.reporterName}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span className="text-xs font-extrabold bg-blue-100 text-blue-900 px-3 py-1 rounded-xl uppercase">
                      {inc.status.replace('_', ' ')}
                    </span>
                    <button className="text-xs font-bold text-blue-600 mt-2 flex items-center gap-1 hover:underline">
                      <span>Dispatch Actions</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: POST NEED */}
      {activeTab === 'post-need' && (
        <form onSubmit={handlePostNeed} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 max-w-xl shadow-xs">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Post Urgent Need / Item Request</h3>
            <p className="text-xs text-slate-500">This will be broadcast on the public feeds for donor & volunteer support.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Need Title / Material Required <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={needTitle}
              onChange={(e) => setNeedTitle(e.target.value)}
              placeholder="e.g. 50 Winter Blankets for Children / Medical Kit Refill"
              className="w-full text-xs p-3 rounded-xl border border-slate-300 outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Estimated Funds Needed (₹)
              </label>
              <input
                type="number"
                value={needFunds}
                onChange={(e) => setNeedFunds(e.target.value)}
                placeholder="₹ 25,000"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Volunteers Needed
              </label>
              <input
                type="number"
                value={needVolunteers}
                onChange={(e) => setNeedVolunteers(e.target.value)}
                placeholder="e.g. 5"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold py-3 rounded-xl shadow-md transition-all"
          >
            Publish Urgent Need
          </button>
        </form>
      )}

      {/* TAB 3: POST ADOPTION LISTING */}
      {activeTab === 'post-adoption' && (
        <form onSubmit={handlePostAdoption} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 max-w-xl shadow-xs">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Post New Discovery Profile</h3>
            <p className="text-xs text-slate-500">
              Child listings must carry CWC clearance for official CARA discovery.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Type</label>
              <select
                value={adoptType}
                onChange={(e) => setAdoptType(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-slate-50"
              >
                <option value="child">👶 Child (CARA Discovery)</option>
                <option value="elderly">👴 Elderly Care & Sponsorship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Gender</label>
              <select
                value={adoptGender}
                onChange={(e) => setAdoptGender(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-slate-50"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">First Name / Reference</label>
              <input
                type="text"
                required
                value={adoptName}
                onChange={(e) => setAdoptName(e.target.value)}
                placeholder="e.g. Yash"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Age</label>
              <input
                type="text"
                required
                value={adoptAge}
                onChange={(e) => setAdoptAge(e.target.value)}
                placeholder="e.g. 5 years"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Health / Immunization Status</label>
            <input
              type="text"
              required
              value={adoptHealth}
              onChange={(e) => setAdoptHealth(e.target.value)}
              placeholder="e.g. Fully Immunized, Healthy"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Background / Legal Order Clearance Note</label>
            <textarea
              rows={3}
              required
              value={adoptNote}
              onChange={(e) => setAdoptNote(e.target.value)}
              placeholder="e.g. Declared legally free for adoption under CWC Order No. 4920..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold py-3 rounded-xl shadow-md transition-all"
          >
            Create Discovery Listing
          </button>
        </form>
      )}

      {/* TAB 4: INQUIRIES REVIEW */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
            Adoption & Elderly Care Inquiries
          </h3>

          {inquiries.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <h4 className="text-sm font-bold text-slate-700">No Inquiries Received Yet</h4>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div key={inq.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        Inquiry for {inq.personName} ({inq.type.toUpperCase()})
                      </h4>
                      <p className="text-xs text-slate-500">
                        From: <strong>{inq.userName}</strong> • {inq.userPhone} • {inq.userEmail}
                      </p>
                    </div>

                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                      inq.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {inq.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">
                    "{inq.message}"
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleApproveInquiry(inq.id, 'approved')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
                    >
                      Accept & Schedule Briefing
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ANONYMIZED DONATION LEDGER */}
      {activeTab === 'donations' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  Donor Privacy Protection Ledger
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Compliant with platform anonymity policy: Donor personal info is masked to prevent unauthorized contact.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Total: ₹{totalFunds.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {donations.map((d) => (
              <div key={d.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{d.donorName}</span>
                    {d.isAnonymousPublic && (
                      <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.2 rounded-sm font-medium">
                        Anonymous Donor
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {d.campaignTitle} • Receipt #{d.receiptNo}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-emerald-700">₹{d.amount.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
