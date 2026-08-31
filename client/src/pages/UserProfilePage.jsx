import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Gift,
  HandHeart,
  Receipt,
  QrCode,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const UserProfilePage = () => {
  const {
    currentUser,
    setSelectedIncidentForTimeline,
    setActiveReceiptData,
    refreshKey
  } = useApp();

  const [myIncidents, setMyIncidents] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [myVolunteerRegs, setMyVolunteerRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/incidents?reporterId=${currentUser.id}`).then(r => r.json()),
      fetch(`/api/donations?userId=${currentUser.id}`).then(r => r.json()),
      fetch(`/api/volunteering/my-registrations/${currentUser.id}`).then(r => r.json())
    ])
      .then(([incData, donData, volData]) => {
        if (incData.success) setMyIncidents(incData.data);
        if (donData.success) setMyDonations(donData.data);
        if (volData.success) setMyVolunteerRegs(volData.data);
      })
      .finally(() => setLoading(false));
  }, [refreshKey, currentUser]);

  const totalDonated = myDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xl border border-emerald-900/40">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/40 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight">{currentUser.name}</h1>
              <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/40">
                Verified Citizen
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{currentUser.email} • {currentUser.phone}</p>
            <p className="text-xs text-emerald-400 font-semibold mt-1">📍 {currentUser.city}, India</p>
          </div>
        </div>

        {/* Karma Badge */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center shrink-0 w-full sm:w-auto">
          <div className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Community Karma Score</span>
          </div>
          <div className="text-2xl font-black text-white mt-0.5">{currentUser.karmaPoints || 420} Pts</div>
          <div className="text-[10px] text-slate-300 mt-0.5">Top 5% First Responder</div>
        </div>
      </div>

      {/* 3 Impact Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: My Reported Incidents */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                My Reported Cases ({myIncidents.length})
              </h3>
            </div>
          </div>

          <div className="space-y-2.5">
            {myIncidents.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No reported incidents</p>
            ) : (
              myIncidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentForTimeline(inc)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 cursor-pointer transition-colors space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <span>{inc.categoryIcon}</span>
                      <span>{inc.categoryLabel}</span>
                    </span>
                    <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {inc.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1">{inc.description}</p>
                  <div className="text-[10px] text-emerald-600 font-semibold flex items-center justify-between pt-0.5">
                    <span>{inc.assignedNgoName}</span>
                    <span>Track Live →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Col 2: My 80G Tax Donation Receipts */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                80G Tax Receipts ({myDonations.length})
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-700">₹{totalDonated.toLocaleString()}</span>
          </div>

          <div className="space-y-2.5">
            {myDonations.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No donations recorded</p>
            ) : (
              myDonations.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setActiveReceiptData(d)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 cursor-pointer transition-colors space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700">₹{d.amount.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] font-mono text-slate-400">Receipt #{d.receiptNo.slice(-8)}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 line-clamp-1">{d.campaignTitle}</p>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                    <span>{d.isAnonymousPublic ? 'Anonymous on feed' : 'Public Donor'}</span>
                    <span className="text-emerald-700 font-bold group-hover:underline">View 80G PDF →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Col 3: My Volunteering QR Passes */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                My Volunteer Passes ({myVolunteerRegs.length})
              </h3>
            </div>
          </div>

          <div className="space-y-2.5">
            {myVolunteerRegs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No volunteer drives joined yet</p>
            ) : (
              myVolunteerRegs.map((v) => (
                <div
                  key={v.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        v.checkedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {v.checkedIn ? 'Checked-In' : 'Confirmed'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{v.driveTitle}</h4>
                    <p className="text-[10px] text-slate-500">{v.driveDate} • {v.ngoName}</p>
                  </div>

                  <div className="bg-white p-1 rounded-lg border border-slate-200 shrink-0">
                    <QRCodeSVG value={v.qrPassToken} size={48} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
