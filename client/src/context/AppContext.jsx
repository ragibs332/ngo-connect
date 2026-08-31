import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const ROLES = {
  PUBLIC: 'public',
  NGO: 'ngo',
  ADMIN: 'admin'
};

export const MOCK_USERS = {
  public: {
    id: 'user-rohan',
    name: 'Rohan Sharma',
    email: 'rohan.sharma@example.com',
    phone: '+91 98765 43210',
    role: 'public',
    city: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    karmaPoints: 420
  },
  ngo: {
    id: 'ngo-hope',
    name: 'Priya Deshmukh',
    ngoName: 'Hope Horizon Child Care & Shelter',
    ngoId: 'ngo-1',
    email: 'contact@hopehorizon.org',
    phone: '+91 98200 11223',
    role: 'ngo',
    city: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  admin: {
    id: 'admin-root',
    name: 'Ananya Roy (Platform Admin)',
    email: 'admin@ngoconnect.org',
    phone: '+91 91100 99887',
    role: 'admin',
    city: 'Pan-India',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  }
};

export const AppProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(ROLES.PUBLIC);
  const [currentUser, setCurrentUser] = useState(MOCK_USERS.public);
  const [activeTab, setActiveTab] = useState('home');
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal triggers
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedIncidentForTimeline, setSelectedIncidentForTimeline] = useState(null);
  const [selectedAdoptionForInquiry, setSelectedAdoptionForInquiry] = useState(null);
  const [selectedCampaignForDonation, setSelectedCampaignForDonation] = useState(null);
  const [selectedDriveForRSVP, setSelectedDriveForRSVP] = useState(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [activeReceiptData, setActiveReceiptData] = useState(null);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const switchRole = (newRole) => {
    setCurrentRole(newRole);
    setCurrentUser(MOCK_USERS[newRole]);
    if (newRole === ROLES.NGO) {
      setActiveTab('ngo-dashboard');
    } else if (newRole === ROLES.ADMIN) {
      setActiveTab('admin-dashboard');
    } else {
      setActiveTab('home');
    }
  };

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?role=${currentRole}&userId=${currentUser.id}&ngoId=${currentUser.ngoId || ''}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.data.filter(n => !n.read).length);
      }
    } catch (err) {
      console.warn('Could not fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [currentRole, currentUser, refreshKey]);

  return (
    <AppContext.Provider
      value={{
        currentRole,
        currentUser,
        switchRole,
        activeTab,
        setActiveTab,
        refreshKey,
        triggerRefresh,
        isReportModalOpen,
        setIsReportModalOpen,
        selectedIncidentForTimeline,
        setSelectedIncidentForTimeline,
        selectedAdoptionForInquiry,
        setSelectedAdoptionForInquiry,
        selectedCampaignForDonation,
        setSelectedCampaignForDonation,
        selectedDriveForRSVP,
        setSelectedDriveForRSVP,
        isQRScannerOpen,
        setIsQRScannerOpen,
        activeReceiptData,
        setActiveReceiptData,
        notifications,
        unreadCount,
        fetchNotifications
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
