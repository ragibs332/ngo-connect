import React from 'react';
import { AppProvider, useApp, ROLES } from './context/AppContext';
import { RoleSwitcher } from './components/RoleSwitcher';
import { Navbar } from './components/Navbar';
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

import { HeartHandshake, ShieldCheck, Scale, Lock, QrCode } from 'lucide-react';

const MainLayout = () => {
  const { activeTab, currentRole } = useApp();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <PublicHome />;
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
        return <UserProfilePage />;
      case 'ngo-dashboard':
      case 'ngo-needs':
      case 'ngo-adoption':
      case 'ngo-volunteers':
      case 'ngo-donations':
      case 'ngo-profile':
        return <NgoDashboardPage />;
      case 'admin-dashboard':
      case 'admin-incidents':
      case 'admin-analytics':
        return <AdminDashboardPage />;
      default:
        return <PublicHome />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      <div>
        {/* Quick Role Switcher Bar */}
        <RoleSwitcher />

        {/* Navigation */}
        <Navbar />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Global Modals & Floating Tools */}
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
