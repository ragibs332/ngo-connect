import React from 'react';
import { useApp } from '../context/AppContext';
import { HeartHandshake, Home, ArrowLeft, LayoutDashboard, Search } from 'lucide-react';

export const NotFoundPage = () => {
  const { setActiveTab, currentUser } = useApp();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 max-w-lg w-full text-center space-y-6 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
          <Search className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="text-5xl font-black text-slate-900 tracking-tight">404</div>
          <h1 className="text-xl font-extrabold text-slate-800">Page Not Found</h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            The page or relief section you are looking for might have been moved or is currently unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('home')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </button>

          {currentUser && (
            <button
              onClick={() => setActiveTab(currentUser.role === 'admin' ? 'admin-dashboard' : currentUser.role === 'ngo' ? 'ngo-dashboard' : 'profile')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
