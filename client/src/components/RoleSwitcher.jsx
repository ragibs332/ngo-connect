import React from 'react';
import { useApp, ROLES } from '../context/AppContext';
import { User, Building2, ShieldCheck, Sparkles, LogOut, Eye } from 'lucide-react';

export const RoleSwitcher = () => {
  const { currentRole, switchRole, currentUser, logout } = useApp();

  return (
    <div className="bg-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b border-slate-800 gap-2 sticky top-0 z-50">
      <div className="flex items-center gap-2 font-medium">
        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 text-[11px]">
          <Sparkles className="w-3 h-3 text-emerald-400" /> Interactive Role Switcher
        </span>
        <span className="text-slate-400 hidden sm:inline">
          Active: <strong className="text-white">{currentUser ? `${currentUser.name} (${currentUser.role})` : 'Public Visitor (Logged Out)'}</strong>
        </span>
      </div>

      <div className="flex items-center bg-slate-800/90 p-0.5 rounded-lg border border-slate-700/80 flex-wrap gap-1">
        <button
          onClick={() => switchRole(ROLES.GUEST)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
            !currentUser
              ? 'bg-slate-700 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
          title="Browse as Guest Visitor without login"
        >
          <Eye className="w-3 h-3" />
          <span>Guest (Logged Out)</span>
        </button>

        <button
          onClick={() => switchRole(ROLES.PUBLIC)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
            currentUser && currentUser.role === ROLES.PUBLIC
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <User className="w-3 h-3" />
          <span>Citizen (Rohan)</span>
        </button>

        <button
          onClick={() => switchRole(ROLES.NGO)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
            currentUser && currentUser.role === ROLES.NGO
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Building2 className="w-3 h-3" />
          <span>NGO (Hope Horizon)</span>
        </button>

        <button
          onClick={() => switchRole(ROLES.ADMIN)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
            currentUser && currentUser.role === ROLES.ADMIN
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <ShieldCheck className="w-3 h-3" />
          <span>Admin Console</span>
        </button>
      </div>
    </div>
  );
};
