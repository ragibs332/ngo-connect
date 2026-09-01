import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Calendar, MapPin, Users, CheckCircle, QrCode, Sparkles, Send } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

export const VolunteerModal = () => {
  const {
    selectedDriveForRSVP,
    setSelectedDriveForRSVP,
    currentUser,
    triggerRefresh,
    apiFetch
  } = useApp();

  const [confirmedPass, setConfirmedPass] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedDriveForRSVP) return null;
  const drive = selectedDriveForRSVP;

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await apiFetch('/api/volunteering/register', {
        method: 'POST',
        body: JSON.stringify({
          driveId: drive.id
        })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        setConfirmedPass(data.data);
        triggerRefresh();
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Error signing up for volunteering:', err);
      alert('Network error while registering');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h3 className="text-sm font-extrabold uppercase tracking-wide">Volunteer Sign-up & Digital QR Pass</h3>
          </div>
          <button
            onClick={() => {
              setSelectedDriveForRSVP(null);
              setConfirmedPass(null);
            }}
            className="text-white/80 hover:text-white p-1 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!confirmedPass ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-extrabold text-slate-900">{drive.title}</h4>
                <p className="text-xs text-blue-600 font-semibold mt-0.5">Organized by {drive.ngoName}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{drive.date} • {drive.time}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{drive.location}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{drive.description}</p>

              {/* Skills */}
              {drive.skillsNeeded && (
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Skills / Roles Needed:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {drive.skillsNeeded.map((s, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* User Confirmation */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-center justify-between">
                <span>Confirm slot as: <strong>{currentUser.name}</strong></span>
                <span className="font-bold">+50 Karma Points</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDriveForRSVP(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleRegister}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl shadow-md transition-all"
                >
                  {isSubmitting ? (
                    <span>Confirming...</span>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>Confirm & Generate QR Pass</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Confirmed Digital QR Pass View */
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Volunteer Slot Confirmed!</h4>
                <p className="text-xs text-slate-500">Show this QR Pass at the venue to check-in with the NGO coordinator.</p>
              </div>

              {/* QR Code Container */}
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-blue-300 inline-block shadow-inner">
                <QRCodeSVG
                  value={confirmedPass.qrPassToken}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
                <div className="text-[10px] font-mono font-bold text-slate-600 mt-2">
                  {confirmedPass.qrPassToken}
                </div>
              </div>

              <div className="bg-slate-100 rounded-xl p-3 text-xs text-slate-700 text-left space-y-1">
                <div><strong>Volunteer:</strong> {confirmedPass.userName}</div>
                <div><strong>Venue:</strong> {drive.location}</div>
                <div><strong>Time:</strong> {drive.date} ({drive.time})</div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedDriveForRSVP(null);
                  setConfirmedPass(null);
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl"
              >
                Done / Save to Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
