import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const ROLES = {
  GUEST: 'guest',
  PUBLIC: 'public',
  NGO: 'ngo',
  ADMIN: 'admin'
};

export const AppProvider = ({ children }) => {
  // Auth state
  const [token, setToken] = useState(() => localStorage.getItem('ngo_auth_token') || null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(ROLES.GUEST);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Navigation state
  const [activeTab, setActiveTab] = useState('home');
  const [refreshKey, setRefreshKey] = useState(0);

  // Auth Modal (Triggered when unauthenticated visitor performs protected action)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalPrompt, setAuthModalPrompt] = useState('Please log in or create an account to continue.');
  const [pendingAction, setPendingAction] = useState(null);

  // Feature Modals
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

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Helper for authenticated API calls
  const apiFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const activeToken = token || localStorage.getItem('ngo_auth_token');
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    const res = await fetch(url, { ...options, headers });
    return res;
  };

  // Check active session on startup or token change
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('ngo_auth_token');
      if (!storedToken) {
        setCurrentUser(null);
        setCurrentRole(ROLES.GUEST);
        setIsAuthLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          setCurrentRole(data.user.role || ROLES.PUBLIC);
          setToken(storedToken);
        } else {
          // Token invalid/expired
          localStorage.removeItem('ngo_auth_token');
          setToken(null);
          setCurrentUser(null);
          setCurrentRole(ROLES.GUEST);
        }
      } catch (err) {
        console.warn('Session check failed:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };

    verifySession();
  }, [refreshKey]);

  // Login action
  const login = async (emailOrUsername, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('ngo_auth_token', data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        setCurrentRole(data.user.role);
        setIsAuthModalOpen(false);

        // Execute pending action if any
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        } else {
          // Redirect based on role
          if (data.user.role === ROLES.NGO) setActiveTab('ngo-dashboard');
          else if (data.user.role === ROLES.ADMIN) setActiveTab('admin-dashboard');
          else setActiveTab('home');
        }
        triggerRefresh();
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Invalid username or password.' };
    } catch (err) {
      return { success: false, message: 'Server connection error. Please try again.' };
    }
  };

  // Register action
  const register = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('ngo_auth_token', data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        setCurrentRole(data.user.role);
        setIsAuthModalOpen(false);

        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        } else {
          setActiveTab('home');
        }
        triggerRefresh();
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Registration failed.' };
    } catch (err) {
      return { success: false, message: 'Server connection error.' };
    }
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem('ngo_auth_token');
    setToken(null);
    setCurrentUser(null);
    setCurrentRole(ROLES.GUEST);
    setActiveTab('home');
    triggerRefresh();
  };

  // Role Switcher for quick demo / evaluator testing
  const switchRole = async (targetRole) => {
    // Quick login credentials for demo accounts
    let email = 'rohan.sharma@example.com';
    let pass = 'Password@123';

    if (targetRole === ROLES.NGO) {
      email = 'contact@hopehorizon.org';
      pass = 'Password@123';
    } else if (targetRole === ROLES.ADMIN) {
      email = 'admin@ngoconnect.org';
      pass = 'Admin@SecurePass2026!';
    } else if (targetRole === ROLES.GUEST) {
      logout();
      return;
    }

    await login(email, pass);
  };

  // Protected Action Interceptor
  const requireAuth = (actionCallback, promptMessage, requiredRole) => {
    if (!currentUser) {
      setAuthModalPrompt(promptMessage || 'Please log in or create an account to continue.');
      setPendingAction(() => actionCallback);
      setIsAuthModalOpen(true);
      return false;
    }

    if (requiredRole && currentUser.role !== requiredRole && currentUser.role !== ROLES.ADMIN) {
      alert(`This section requires ${requiredRole.toUpperCase()} permissions.`);
      return false;
    }

    actionCallback();
    return true;
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const activeToken = token || localStorage.getItem('ngo_auth_token');
      const headers = activeToken ? { 'Authorization': `Bearer ${activeToken}` } : {};
      const res = await fetch(`/api/notifications?role=${currentRole}`, { headers });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.data.filter(n => !n.read).length);
      }
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [currentRole, currentUser, refreshKey]);

  return (
    <AppContext.Provider
      value={{
        token,
        currentUser,
        currentRole,
        isAuthLoading,
        login,
        register,
        logout,
        switchRole,
        requireAuth,
        activeTab,
        setActiveTab,
        refreshKey,
        triggerRefresh,
        apiFetch,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalPrompt,
        setAuthModalPrompt,
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
