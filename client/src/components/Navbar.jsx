import React, { useState } from 'react';
import { useApp, ROLES } from '../context/AppContext';
import {
  HeartHandshake,
  AlertTriangle,
  Search,
  Users,
  Gift,
  HandHeart,
  Baby,
  LayoutDashboard,
  ShieldCheck,
  Bell,
  CheckCircle,
  Menu,
  X,
  QrCode,
  FileCheck
} from 'lucide-react';

export const Navbar = () => {
  const {
    currentRole,
    currentUser,
    activeTab,
    setActiveTab,
    setIsReportModalOpen,
    notifications,
    unreadCount,
    setIsQRScannerOpen
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const publicNavItems = [
    { id: 'home', label: 'Explore', icon: HeartHandshake },
    { id: 'incidents', label: 'Emergency Tracker', icon: AlertTriangle, badge: 'Flagship' },
    { id: 'ngos', label: 'NGO Directory', icon: Search },
    { id: 'adoption', label: 'Adoption & Care', icon: Baby, sub: 'CARA' },
    { id: 'campaigns', label: 'Donate (Anon)', icon: Gift },
    { id: 'volunteering', label: 'Volunteer', icon: HandHeart },
    { id: 'profile', label: 'My Impact', icon: Users },
  ];

  const ngoNavItems = [
    { id: 'ngo-dashboard', label: 'SOS Emergency Queue', icon: AlertTriangle, badge: 'Live Dispatch' },
    { id: 'ngo-needs', label: 'Post Needs & Campaigns', icon: Gift },
    { id: 'ngo-adoption', label: 'Adoption Listings', icon: Baby },
    { id: 'ngo-volunteers', label: 'Volunteer Attendance', icon: QrCode },
    { id: 'ngo-donations', label: 'Donor Privacy Ledger', icon: HandHeart },
    { id: 'ngo-profile', label: 'Org Credentials', icon: FileCheck }
  ];

  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Verification Queue', icon: ShieldCheck, badge: 'Pending Approval' },
    { id: 'admin-incidents', label: 'Incident Audit & Disputes', icon: AlertTriangle },
    { id: 'admin-analytics', label: 'Platform Analytics', icon: LayoutDashboard }
  ];

  const navItems = currentRole === ROLES.NGO ? ngoNavItems : currentRole === ROLES.ADMIN ? adminNavItems : publicNavItems;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-9 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab(currentRole === ROLES.NGO ? 'ngo-dashboard' : currentRole === ROLES.ADMIN ? 'admin-dashboard' : 'home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-800 bg-clip-text text-transparent">
                  NGO Connect
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-1.5 py-0.5 rounded-sm">
                  INDIA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Verified Relief & Smart SOS Dispatch</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.sub && (
                    <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1 py-0.2 rounded-sm">
                      {item.sub}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Action Icons & SOS Button */}
          <div className="flex items-center gap-2.5">
            {/* SOS Trigger Button (Public Mode) */}
            {currentRole === ROLES.PUBLIC && (
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-red-500/20 badge-pulse transition-all transform active:scale-95"
              >
                <AlertTriangle className="w-4 h-4 animate-bounce" />
                <span className="tracking-wide uppercase">Report SOS</span>
              </button>
            )}

            {/* NGO QR Scanner Quick Action */}
            {currentRole === ROLES.NGO && (
              <button
                onClick={() => setIsQRScannerOpen(true)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-all"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan Attendance</span>
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popup Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live System Alerts</h4>
                    <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                      {notifications.length} updates
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-2">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No notifications at the moment
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="py-2.5 px-1 hover:bg-slate-50 rounded-lg transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="text-xs font-bold text-slate-800">{n.title}</h5>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Login / Auth Portal Trigger */}
            <button
              onClick={() => setActiveTab('auth')}
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-all ${
                activeTab === 'auth'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Portals & Login</span>
            </button>

            {/* User Profile Mini Badge */}
            <div
              onClick={() => setActiveTab(currentRole === ROLES.NGO ? 'ngo-profile' : currentRole === ROLES.ADMIN ? 'admin-dashboard' : 'profile')}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</div>
                <div className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">
                  {currentRole === ROLES.PUBLIC ? 'Citizen' : currentRole === ROLES.NGO ? 'NGO Partner' : 'System Admin'}
                </div>
              </div>
            </div>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-100 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};
