import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, QrCode, CheckCircle2, AlertCircle, Sparkles, ScanLine } from 'lucide-react';
import confetti from 'canvas-confetti';

export const QRScannerModal = () => {
  const { isQRScannerOpen, setIsQRScannerOpen, triggerRefresh } = useApp();
  const [tokenInput, setTokenInput] = useState('PASS_ROHAN_VERSOVA_VOL1');
  const [result, setResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isQRScannerOpen) return null;

  const handleVerify = async (tokenToUse) => {
    const token = tokenToUse || tokenInput;
    if (!token) return;

    setIsVerifying(true);
    setResult(null);

    try {
      const res = await fetch('/api/volunteering/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrPassToken: token })
      });
      const data = await res.json();
      setResult(data);
      if (data.success && !data.alreadyCheckedIn) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        triggerRefresh();
      }
    } catch (err) {
      console.error('Scan error:', err);
      setResult({ success: false, message: 'Server communication error during check-in.' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h3 className="text-sm font-extrabold uppercase tracking-wide">Volunteer QR Attendance Scanner</h3>
          </div>
          <button
            onClick={() => {
              setIsQRScannerOpen(false);
              setResult(null);
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Simulated Scanner Viewfinder */}
          <div className="bg-slate-950 rounded-2xl p-6 relative flex flex-col items-center justify-center text-center overflow-hidden border border-slate-800">
            <div className="absolute inset-x-0 h-0.5 bg-emerald-500 shadow-[0_0_12px_#10b981] animate-pulse"></div>
            <QrCode className="w-24 h-24 text-slate-700 my-4" />
            <div className="text-xs text-slate-400 font-mono">
              Live Camera Scanner Ready • Aim at Volunteer Pass
            </div>
          </div>

          {/* Quick Token Input / Quick Sim buttons */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Scan / Enter Volunteer Pass Token
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste or type QR Pass Token..."
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                disabled={isVerifying}
                onClick={() => handleVerify()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shrink-0 transition-all"
              >
                {isVerifying ? 'Checking...' : 'Check In'}
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span>Quick Demo Tokens:</span>
              <button
                type="button"
                onClick={() => {
                  setTokenInput('PASS_ROHAN_VERSOVA_VOL1');
                  handleVerify('PASS_ROHAN_VERSOVA_VOL1');
                }}
                className="text-emerald-700 hover:underline font-mono font-semibold"
              >
                Rohan (Versova Drive)
              </button>
            </div>
          </div>

          {/* Result Alert */}
          {result && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                result.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-red-50 border-red-300 text-red-950'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-extrabold">{result.message}</div>
                {result.data && (
                  <div className="text-[11px] text-slate-600 mt-1 font-medium">
                    Volunteer: <strong>{result.data.userName}</strong> • Drive: {result.data.driveTitle}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
