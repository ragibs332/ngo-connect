import React, { useState } from 'react';
import { useApp, ROLES } from '../context/AppContext';
import {
  X,
  Lock,
  User,
  Building2,
  ShieldCheck,
  Mail,
  KeyRound,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Phone,
  CheckCircle2,
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalPrompt,
    login,
    register
  } = useApp();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'ngo'
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // NGO Onboarding form state
  const [ngoName, setNgoName] = useState('');
  const [ngoDarpan, setNgoDarpan] = useState('');
  const [ngoCoordinator, setNgoCoordinator] = useState('');
  const [ngoEmail, setNgoEmail] = useState('');
  const [ngoPassword, setNgoPassword] = useState('');
  const [ngoCategory, setNgoCategory] = useState('child');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = await login(loginIdentifier, loginPassword);
    setIsLoading(false);
    if (res.success) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    const res = await register({
      name: regName,
      username: regUsername,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      confirmPassword: regConfirmPassword
    });
    setIsLoading(false);
    if (res.success) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleNgoRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register-ngo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngoName,
          darpanId: ngoDarpan,
          coordinatorName: ngoCoordinator,
          email: ngoEmail,
          password: ngoPassword,
          category: ngoCategory
        })
      });
      const data = await res.json();
      setIsLoading(false);

      if (data.success) {
        confetti({ particleCount: 80, spread: 70 });
        alert(data.message);
        setIsAuthModalOpen(false);
      } else {
        setErrorMessage(data.message || 'NGO registration failed.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Network connection error.');
    }
  };

  // Quick Demo Logins for Evaluator Testing
  const handleQuickLogin = async (role) => {
    setErrorMessage('');
    setIsLoading(true);
    let email = 'rohan.sharma@example.com';
    let pass = 'Password@123';

    if (role === 'ngo') {
      email = 'contact@hopehorizon.org';
      pass = 'Password@123';
    } else if (role === 'admin') {
      email = 'admin@ngoconnect.org';
      pass = 'Admin@SecurePass2026!';
    }

    const res = await login(email, pass);
    setIsLoading(false);
    if (res.success) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wide">NGO Connect Account</h3>
              <p className="text-[11px] text-slate-400">Connecting People, NGOs and Communities</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt Alert Banner */}
        <div className="bg-emerald-50 border-b border-emerald-200/80 px-5 py-3 flex items-start gap-2.5 text-xs text-emerald-950">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span className="font-semibold leading-snug">{authModalPrompt}</span>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 text-xs font-extrabold">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'login'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'register'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => {
              setActiveTab('ngo');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'ngo'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            NGO Onboarding
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-900 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Evaluator Demo Logins */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-2">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
              ⚡ 1-Click Quick Demo Sign-In:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('public')}
                className="bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 py-1.5 px-2 rounded-lg font-bold text-slate-800 hover:text-emerald-700 text-center transition-all truncate"
              >
                👤 Citizen
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('ngo')}
                className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 py-1.5 px-2 rounded-lg font-bold text-slate-800 hover:text-blue-700 text-center transition-all truncate"
              >
                🏢 NGO Staff
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('admin')}
                className="bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 py-1.5 px-2 rounded-lg font-bold text-slate-800 hover:text-purple-700 text-center transition-all truncate"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Username or Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="name@example.com or username"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Rohan Sharma"
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="rohan_s"
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="rohan@example.com"
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: NGO ONBOARDING */}
          {activeTab === 'ngo' && (
            <form onSubmit={handleNgoRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                  NGO / Shelter Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ngoName}
                  onChange={(e) => setNgoName(e.target.value)}
                  placeholder="e.g. Navjeevan Animal Trust"
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Government Darpan ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={ngoDarpan}
                    onChange={(e) => setNgoDarpan(e.target.value)}
                    placeholder="MH/2024/099120"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Emergency Category
                  </label>
                  <select
                    value={ngoCategory}
                    onChange={(e) => setNgoCategory(e.target.value)}
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
                    Coordinator Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={ngoEmail}
                    onChange={(e) => setNgoEmail(e.target.value)}
                    placeholder="contact@trust.org"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={ngoPassword}
                    onChange={(e) => setNgoPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <span>Submit for Admin Accreditation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
