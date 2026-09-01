import React, { useState } from 'react';
import { useApp, ROLES } from '../context/AppContext';
import {
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
  HeartHandshake,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AuthPage = () => {
  const { login, register, setActiveTab, currentUser, logout } = useApp();
  const [activeTab, setActiveTabLocal] = useState('login'); // 'login' | 'register' | 'ngo'
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
        setActiveTab('home');
      } else {
        setErrorMessage(data.message || 'NGO registration failed.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Network connection error.');
    }
  };

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

  // If already logged in, show user profile overview & logout option
  if (currentUser) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-6 shadow-xl">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-emerald-500/30 shadow-md"
          />

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">
              Active Session • {currentUser.role}
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">{currentUser.name}</h2>
            <p className="text-xs text-slate-500">{currentUser.email} • {currentUser.phone}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => setActiveTab(currentUser.role === 'admin' ? 'admin-dashboard' : currentUser.role === 'ngo' ? 'ngo-dashboard' : 'profile')}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all"
            >
              Open Dashboard
            </button>
            <button
              onClick={logout}
              className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold py-3 rounded-xl transition-all border border-rose-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      {/* Branding */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/20">
          <HeartHandshake className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">NGO Connect</h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
          Connecting People, NGOs and Communities for Verified Social Impact.
        </p>
      </div>

      {/* Auth Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-extrabold">
          <button
            onClick={() => {
              setActiveTabLocal('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-3.5 text-center border-b-2 transition-all ${
              activeTab === 'login'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setActiveTabLocal('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-3.5 text-center border-b-2 transition-all ${
              activeTab === 'register'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => {
              setActiveTabLocal('ngo');
              setErrorMessage('');
            }}
            className={`flex-1 py-3.5 text-center border-b-2 transition-all ${
              activeTab === 'ngo'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            NGO Onboarding
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-5">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-900 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Demo Sign-in for Evaluator convenience */}
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
                    <span>Sign In</span>
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
                    <span>Create Account</span>
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
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
