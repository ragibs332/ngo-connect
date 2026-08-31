import React, { useState } from 'react';
import { useApp, ROLES, MOCK_USERS } from '../context/AppContext';
import {
  User,
  Building2,
  ShieldCheck,
  Phone,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Send,
  HeartHandshake,
  KeyRound
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AuthPage = () => {
  const { switchRole, setActiveTab, currentUser } = useApp();
  const [authRole, setAuthRole] = useState(ROLES.PUBLIC); // 'public' | 'ngo' | 'admin'
  const [isNgoRegister, setIsNgoRegister] = useState(false);

  // Citizen Login State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [citizenName, setCitizenName] = useState('');

  // NGO Login State
  const [ngoEmail, setNgoEmail] = useState('');
  const [ngoPassword, setNgoPassword] = useState('');

  // NGO Registration State
  const [regNgoName, setRegNgoName] = useState('');
  const [regCoordinator, setRegCoordinator] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDarpan, setRegDarpan] = useState('');
  const [regCategory, setRegCategory] = useState('child');
  const [regCity, setRegCity] = useState('Mumbai');
  const [regDescription, setRegDescription] = useState('');

  // Admin Login State
  const [adminKey, setAdminKey] = useState('');

  const [loading, setLoading] = useState(false);

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone) return alert('Please enter your mobile number.');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setSimulatedOtp(data.simulatedOtp);
        setOtp(data.simulatedOtp); // Auto-fill for convenience
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Verify Citizen Login
  const handleCitizenLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'public', identifier: phone, otp })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 70, spread: 60 });
        switchRole(ROLES.PUBLIC);
        setActiveTab('home');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // NGO Login
  const handleNgoLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'ngo', identifier: ngoEmail, password: ngoPassword })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 70, spread: 60 });
        switchRole(ROLES.NGO);
        setActiveTab('ngo-dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // NGO Onboarding Registration
  const handleNgoRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-ngo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngoName: regNgoName,
          coordinatorName: regCoordinator,
          email: regEmail,
          phone: regPhone,
          darpanId: regDarpan,
          category: regCategory,
          city: regCity,
          description: regDescription
        })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 80, spread: 70 });
        alert(data.message);
        switchRole(ROLES.NGO);
        setActiveTab('ngo-dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Admin Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin', password: adminKey })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 80, spread: 70 });
        switchRole(ROLES.ADMIN);
        setActiveTab('admin-dashboard');
      } else {
        alert(data.message || 'Invalid passcode');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 pb-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/20">
          <HeartHandshake className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          NGO Connect Portal Login
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Secure multi-role access for Citizens, Verified NGO Coordinators, and Platform Governance.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-3 gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs max-w-2xl mx-auto">
        <button
          onClick={() => {
            setAuthRole(ROLES.PUBLIC);
            setIsNgoRegister(false);
          }}
          className={`py-3 px-2 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center gap-1.5 ${
            authRole === ROLES.PUBLIC
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Citizen User</span>
        </button>

        <button
          onClick={() => setAuthRole(ROLES.NGO)}
          className={`py-3 px-2 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center gap-1.5 ${
            authRole === ROLES.NGO
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>NGO Staff</span>
        </button>

        <button
          onClick={() => {
            setAuthRole(ROLES.ADMIN);
            setIsNgoRegister(false);
          }}
          className={`py-3 px-2 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center gap-1.5 ${
            authRole === ROLES.ADMIN
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Platform Admin</span>
        </button>
      </div>

      {/* 1. PUBLIC CITIZEN LOGIN & OTP */}
      {authRole === ROLES.PUBLIC && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg mx-auto shadow-md space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Citizen Mobile OTP Sign-In</h2>
              <p className="text-xs text-slate-500">Report emergencies, donate anonymously & volunteer</p>
            </div>
            <span className="text-2xl">👤</span>
          </div>

          {/* Quick Demo 1-Click Button */}
          <button
            type="button"
            onClick={() => {
              switchRole(ROLES.PUBLIC);
              setActiveTab('home');
            }}
            className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 p-3 rounded-2xl flex items-center justify-between text-xs font-bold transition-all group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>1-Click Demo Login as <strong>Rohan Sharma (Citizen)</strong></span>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="shrink-0 mx-4 text-slate-400 text-[11px] uppercase font-bold">Or Sign In with Phone</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Phone Form */}
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Enter Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">+91</span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full text-xs pl-12 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send 6-Digit OTP</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleCitizenLogin} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                <span>OTP sent to <strong>+91 {phone}</strong></span>
                <span className="font-mono font-bold bg-emerald-200 px-2 py-0.5 rounded-md">
                  Code: {simulatedOtp}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full text-center tracking-widest text-lg font-mono p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold py-3 rounded-xl shadow-md transition-all"
              >
                Verify & Enter Platform
              </button>
            </form>
          )}
        </div>
      )}

      {/* 2. NGO STAFF & ONBOARDING */}
      {authRole === ROLES.NGO && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg mx-auto shadow-md space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">NGO Coordinator Workspace</h2>
              <p className="text-xs text-slate-500">Manage SOS dispatches, campaigns, and volunteer check-ins</p>
            </div>
            <span className="text-2xl">🏢</span>
          </div>

          {/* Quick Demo 1-Click Button */}
          <button
            type="button"
            onClick={() => {
              switchRole(ROLES.NGO);
              setActiveTab('ngo-dashboard');
            }}
            className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 p-3 rounded-2xl flex items-center justify-between text-xs font-bold transition-all group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>1-Click Demo Login as <strong>Priya @ Hope Horizon</strong></span>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-700 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Toggle Login vs Onboarding Register */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setIsNgoRegister(false)}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                !isNgoRegister ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In Existing NGO
            </button>
            <button
              type="button"
              onClick={() => setIsNgoRegister(true)}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                isNgoRegister ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Register New NGO
            </button>
          </div>

          {!isNgoRegister ? (
            /* NGO Login Form */
            <form onSubmit={handleNgoLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Coordinator Email / NGO ID
                </label>
                <input
                  type="email"
                  required
                  value={ngoEmail}
                  onChange={(e) => setNgoEmail(e.target.value)}
                  placeholder="contact@hopehorizon.org"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={ngoPassword}
                  onChange={(e) => setNgoPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold py-3 rounded-xl shadow-md transition-all"
              >
                Access NGO Dashboard
              </button>
            </form>
          ) : (
            /* NGO Registration Form */
            <form onSubmit={handleNgoRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                  NGO / Trust Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regNgoName}
                  onChange={(e) => setRegNgoName(e.target.value)}
                  placeholder="e.g. Seva Bharat Animal Hospital"
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                    NGO Darpan ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regDarpan}
                    onChange={(e) => setRegDarpan(e.target.value)}
                    placeholder="MH/2024/099128"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Primary Category
                  </label>
                  <select
                    value={regCategory}
                    onChange={(e) => setRegCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-semibold"
                  >
                    <option value="child">👶 Child Welfare</option>
                    <option value="animal">🐕 Animal Rescue</option>
                    <option value="elderly">👴 Elderly Care</option>
                    <option value="homeless">🏠 Homeless Relief</option>
                    <option value="disability">♿ Disability Aid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Official Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ngo@domain.org"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Phone / Hotline
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Description & Mission
                </label>
                <textarea
                  rows={2}
                  value={regDescription}
                  onChange={(e) => setRegDescription(e.target.value)}
                  placeholder="Briefly describe your shelters and rescue services..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl shadow-md transition-all"
              >
                Submit for Admin Accreditation
              </button>
            </form>
          )}
        </div>
      )}

      {/* 3. PLATFORM ADMIN LOGIN */}
      {authRole === ROLES.ADMIN && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg mx-auto shadow-md space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Platform Admin Master Console</h2>
              <p className="text-xs text-slate-500">Statutory verification, incident moderation & analytics</p>
            </div>
            <span className="text-2xl">🛡️</span>
          </div>

          {/* Quick Demo 1-Click Button */}
          <button
            type="button"
            onClick={() => {
              switchRole(ROLES.ADMIN);
              setActiveTab('admin-dashboard');
            }}
            className="w-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 p-3 rounded-2xl flex items-center justify-between text-xs font-bold transition-all group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>1-Click Demo Login as <strong>Ananya Roy (Admin)</strong></span>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-700 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="shrink-0 mx-4 text-slate-400 text-[11px] uppercase font-bold">Or Enter Admin Passkey</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Admin Master Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter passcode (default: admin123)"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-hidden font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold py-3 rounded-xl shadow-md transition-all"
            >
              Enter Admin Control Console
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
