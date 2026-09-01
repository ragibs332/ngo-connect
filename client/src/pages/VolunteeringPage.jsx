import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  HandHeart,
  Calendar,
  MapPin,
  Users,
  QrCode,
  CheckCircle2,
  Sparkles,
  Search,
  ArrowRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const VolunteeringPage = () => {
  const { setSelectedDriveForRSVP, refreshKey, requireAuth, currentUser } = useApp();
  const [drives, setDrives] = useState([]);
  const [myRegs, setMyRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('drives'); // 'drives' | 'my-passes'

  useEffect(() => {
    // Fetch drives
    fetch('/api/volunteering')
      .then(res => res.json())
      .then(data => {
        if (data.success) setDrives(data.data);
        setLoading(false);
      });

    // Fetch user registrations
    fetch(`/api/volunteering/my-registrations/${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setMyRegs(data.data);
      });
  }, [refreshKey, currentUser]);

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border border-teal-500/30">
            <QrCode className="w-3.5 h-3.5" /> Instant Digital QR Check-In
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Community Volunteering & Relief Drives
          </h1>
          <p className="text-xs text-teal-100 max-w-xl leading-relaxed">
            Contribute your time on weekends. Sign up in 1-tap, show your QR Pass at the venue, and earn verified Volunteer Karma credits.
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab('drives')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
            tab === 'drives'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HandHeart className="w-4 h-4" />
          <span>Upcoming Relief Drives</span>
        </button>

        <button
          onClick={() => setTab('my-passes')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
            tab === 'my-passes'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>My QR Passes ({myRegs.length})</span>
        </button>
      </div>

      {/* Content */}
      {tab === 'my-passes' ? (
        <div className="space-y-4">
          {myRegs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <h3 className="text-sm font-bold text-slate-700">No Volunteer Passes Yet</h3>
              <p className="text-xs text-slate-500 mt-1">Register for an upcoming drive to generate your QR pass.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myRegs.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center gap-5 justify-between"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        reg.checkedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {reg.checkedIn ? '✅ Checked-In at Venue' : '⏳ Confirmed Slot'}
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900">{reg.driveTitle}</h3>
                    <p className="text-xs text-teal-700 font-semibold">{reg.ngoName}</p>

                    <div className="text-xs text-slate-500 space-y-0.5 pt-1">
                      <div>📍 {reg.driveLocation}</div>
                      <div>📅 {reg.driveDate}</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center shrink-0 shadow-inner">
                    <QRCodeSVG value={reg.qrPassToken} size={110} level="M" />
                    <span className="text-[9px] font-mono font-bold text-slate-500 block mt-1">
                      {reg.qrPassToken}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {drives.map((drive) => {
            const slotsLeft = drive.slotsTotal - drive.slotsFilled;
            return (
              <div
                key={drive.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-teal-700 uppercase tracking-wider">
                      {drive.ngoName}
                    </span>
                    <span className="bg-teal-50 text-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-teal-200">
                      {slotsLeft} Slots Left
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                    {drive.title}
                  </h3>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{drive.date} • {drive.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      <span className="truncate">{drive.location}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {drive.description}
                  </p>

                  {/* Skills */}
                  {drive.skillsNeeded && (
                    <div className="flex flex-wrap gap-1">
                      {drive.skillsNeeded.map((s, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 text-[11px] px-2 py-0.5 rounded-md font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => requireAuth(() => setSelectedDriveForRSVP(drive), 'Please log in or create an account to join volunteer drives.')}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Join Drive & Generate QR Pass</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
