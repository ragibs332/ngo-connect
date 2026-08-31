import React from 'react';
import { useApp, ROLES } from '../context/AppContext';
import { User, Building2, ShieldCheck, Sparkles } from 'lucide-react';

export const RoleSwitcher = () => {
  const { currentRole, switchRole } = useApp();

  return (
    <div className="bg-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b border-slate-800 gap-2 sticky top-0 z-50">
      <div className="flex items-center gap-2 font-medium">
        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 text-[11px]">
          <Sparkles className="w-3 h-3 text-emerald-400" /> Interactive Demo Mode
        </span>
        <span className="text-slate-400 hidden sm:inline">Active Testing Role:</span>
      </div>

      <div className="flex items-center bg-slate-800/90 p-0.5 rounded-lg border border-slate-700/80">
        <button
          onClick={() => switchRole(ROLES.PUBLIC)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
            currentRole === ROLES.PUBLIC
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Public User (Rohan)</span>
        </button>

        <button
          onClick={() => switchRole(ROLES.NGO)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
            currentRole === ROLES.NGO
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>NGO Staff (Hope Horizon)</span>
        </button>

        <button
          onClick={() => switchRole(ROLES.ADMIN)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
            currentRole === ROLES.ADMIN
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Platform Admin</span>
        </button>
      </div>
    </div>
  );
};
