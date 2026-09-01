import React from 'react';
import { AppProvider, useApp, ROLES } from './context/AppContext';
import { RoleSwitcher } from './components/RoleSwitcher';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { IncidentReporterModal } from './components/IncidentReporterModal';
import { IncidentTimelineModal } from './components/IncidentTimelineModal';
import { AdoptionModal } from './components/AdoptionModal';
import { DonationModal } from './components/DonationModal';
import { ReceiptModal } from './components/ReceiptModal';
import { VolunteerModal } from './components/VolunteerModal';
import { QRScannerModal } from './components/QRScannerModal';
import { SahayChatbot } from './components/SahayChatbot';

// Pages
import { PublicHome } from './pages/PublicHome';
import { IncidentTrackerPage } from './pages/IncidentTrackerPage';
import { NgoDirectoryPage } from './pages/NgoDirectoryPage';
import { AdoptionPage } from './pages/AdoptionPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { VolunteeringPage } from './pages/VolunteeringPage';
import { NgoDashboardPage } from './pages/NgoDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AuthPage } from './pages/AuthPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { HeartHandshake, ShieldCheck, Scale, Lock, QrCode } from 'lucide-react';

const MainLayout = () => {
  const { activeTab, currentUser, setActiveTab } = useApp();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <PublicHome />;
      case 'auth':
        return <AuthPage />;
      case 'incidents':
        return <IncidentTrackerPage />;
      case 'ngos':
        return <NgoDirectoryPage />;
      case 'adoption':
        return <AdoptionPage />;
      case 'campaigns':
        return <CampaignsPage />;
      case 'volunteering':
        return <VolunteeringPage />;
      case 'profile':
        if (!currentUser) {
          return (
            <div className="max-w-md mx-auto py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">Sign In to View Your Impact</h2>
              <p className="text-xs text-slate-500">
                Please log in or create an account to view your donations, 80G tax receipts, and volunteer passes.
              </p>
              <button
                onClick={() => setActiveTab('auth')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md"
              >
                Sign In / Register
              </button>
            </div>
          );
        }
        return <UserProfilePage />;
      case 'ngo-dashboard':
      case 'ngo-needs':
      case 'ngo-adoption':
      case 'ngo-volunteers':
      case 'ngo-donations':
      case 'ngo-profile':
        if (!currentUser || (currentUser.role !== 'ngo' && currentUser.role !== 'admin')) {
          return (
            <div className="max-w-md mx-auto py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">NGO Partner Access Required</h2>
              <p className="text-xs text-slate-500">
                This area is reserved for registered NGO coordinators managing dispatches, campaigns, and volunteer attendance.
              </p>
              <button
                onClick={() => setActiveTab('auth')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md"
              >
                NGO Sign In / Onboarding
              </button>
            </div>
          );
        }
        return <NgoDashboardPage />;
      case 'admin-dashboard':
      case 'admin-incidents':
      case 'admin-analytics':
        if (!currentUser || currentUser.role !== 'admin') {
          return (
            <div className="max-w-md mx-auto py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-200">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">Administrator Clearance Required</h2>
              <p className="text-xs text-slate-500">
                Only authorized platform governance officers can access accreditation review queues and audit logs.
              </p>
              <button
                onClick={() => setActiveTab('auth')}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md"
              >
                Admin Sign In
              </button>
            </div>
          );
        }
        return <AdminDashboardPage />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      <div>
        {/* Interactive Role Switcher Bar */}
        <RoleSwitcher />

        {/* Top Navbar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Global Modals & Protected Action Gateways */}
      <AuthModal />
      <IncidentReporterModal />
      <IncidentTimelineModal />
      <AdoptionModal />
      <DonationModal />
      <ReceiptModal />
      <VolunteerModal />
      <QRScannerModal />
      <SahayChatbot />

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 mt-16 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base tracking-tight">NGO Connect India</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Darpan & 80G Certified
              </span>
              <span className="flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-amber-400" /> CARA Statutory Discovery
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-cyan-400" /> Anonymous by Default
              </span>
              <span className="flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-indigo-400" /> QR Attendance
              </span>
            </div>
          </div>

          <div className="text-center sm:text-left text-xs text-slate-500 leading-relaxed space-y-2">
            <p>
              <strong>CARA Legal Notice:</strong> Child adoptions in India are governed solely by the Central Adoption Resource Authority under the Juvenile Justice Act 2015. NGO Connect facilitates verified discovery and official SAA inquiry only.
            </p>
            <p className="text-[11px] text-slate-600">
              © {new Date().getFullYear()} NGO Connect Platform. Built for community relief, emergency rescue dispatch, and verified social impact.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
