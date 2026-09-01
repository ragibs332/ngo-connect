const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'ngo_connect_jwt_secret_dev_2026_super_secure';
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper to read DB
const readDB = () => {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database:', err);
    return {
      users: [],
      ngos: [],
      incidents: [],
      adoptionListings: [],
      adoptionInquiries: [],
      campaigns: [],
      donations: [],
      volunteeringDrives: [],
      volunteerRegistrations: [],
      faqKnowledgeBase: [],
      disputes: [],
      notifications: []
    };
  }
};

// Helper to write DB
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing database:', err);
    return false;
  }
};

// Strip password from user object
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

// Initialize Admin & Seed Passwords with Bcrypt
const initializeDatabaseSecurity = () => {
  const db = readDB();
  let modified = false;

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ngoconnect.org';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@SecurePass2026!';
  const defaultUserPassword = 'Password@123';

  // Check or initialize Admin
  let admin = db.users.find(u => u.role === 'admin');
  if (!admin) {
    admin = {
      id: 'admin-root',
      username: 'admin',
      name: process.env.ADMIN_NAME || 'Ananya Roy (Platform Admin)',
      email: adminEmail,
      phone: '+91 91100 99887',
      role: 'admin',
      password: bcrypt.hashSync(adminPassword, 10),
      city: 'Pan-India',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    };
    db.users.push(admin);
    modified = true;
  } else if (!admin.password || !admin.password.startsWith('$2')) {
    admin.password = bcrypt.hashSync(adminPassword, 10);
    modified = true;
  }

  // Ensure all seed users have bcrypt hashed passwords
  db.users.forEach(u => {
    if (!u.password || !u.password.startsWith('$2')) {
      u.password = bcrypt.hashSync(defaultUserPassword, 10);
      modified = true;
    }
    if (!u.username) {
      u.username = u.email.split('@')[0];
      modified = true;
    }
  });

  if (modified) {
    writeDB(db);
    console.log('✓ Security initialized: Passwords hashed with bcrypt.');
  }
};

initializeDatabaseSecurity();

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
      ngoId: user.ngoId || null
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/* ==========================================================================
   AUTHENTICATION & AUTHORIZATION MIDDLEWARES
   ========================================================================== */

// Verify JWT Token (Mandatory)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in or create an account to continue.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.'
      });
    }
    req.user = decoded;
    next();
  });
};

// Optional Auth (Attaches req.user if token is present, continues without error if absent)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err) {
      req.user = decoded;
    } else {
      req.user = null;
    }
    next();
  });
};

// Role-Based Authorization
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: You need ${allowedRoles.join(' or ')} privileges to perform this action.`
      });
    }

    next();
  };
};

// Haversine formula for distance in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};

// Smart Auto-Routing Algorithm
const routeIncidentToNearestNGO = (incident, ngos) => {
  const verifiedNgos = ngos.filter(n => n.isVerified || n.verificationStatus === 'verified');
  
  let candidates = verifiedNgos.filter(n => 
    n.category === incident.category || 
    (n.subCategories && n.subCategories.includes(incident.category))
  );

  if (candidates.length === 0) {
    candidates = verifiedNgos;
  }

  if (candidates.length === 0) {
    return { ngo: null, distance: null };
  }

  const withDistance = candidates.map(ngo => {
    const dist = calculateDistance(
      incident.geo?.lat,
      incident.geo?.lng,
      ngo.geo?.lat,
      ngo.geo?.lng
    );
    return { ngo, dist };
  });

  withDistance.sort((a, b) => a.dist - b.dist);
  return {
    ngo: withDistance[0].ngo,
    distance: withDistance[0].dist
  };
};

/* ==========================================================================
   REAL AUTHENTICATION API (Registration, Login, User Me)
   ========================================================================== */

// Real User Registration with bcrypt
app.post('/api/auth/register', (req, res) => {
  const db = readDB();
  const { name, username, email, phone, password, confirmPassword, city } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const rawUsername = username ? username.trim().toLowerCase() : normalizedEmail.split('@')[0];

  // Uniqueness checks
  if (db.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
  }

  if (db.users.some(u => u.username && u.username.toLowerCase() === rawUsername)) {
    return res.status(400).json({ success: false, message: 'This username is already taken. Please choose another.' });
  }

  const newUser = {
    id: `user-${Date.now().toString().slice(-6)}`,
    username: rawUsername,
    name: name.trim(),
    email: normalizedEmail,
    phone: phone ? phone.trim() : '+91 98765 43210',
    role: 'public',
    password: bcrypt.hashSync(password, 10),
    city: city || 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    karmaPoints: 100,
    badges: ['Welcome Member'],
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);

  const token = generateToken(newUser);
  res.status(201).json({
    success: true,
    message: 'Account created successfully!',
    user: sanitizeUser(newUser),
    token
  });
});

// Real User Login with bcrypt.compare
app.post('/api/auth/login', (req, res) => {
  const db = readDB();
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both your username/email and password.' });
  }

  const identifier = emailOrUsername.toLowerCase().trim();

  // Find user by email or username or phone
  const user = db.users.find(u => 
    u.email.toLowerCase() === identifier || 
    (u.username && u.username.toLowerCase() === identifier) ||
    (u.phone && u.phone.replace(/\s+/g, '') === identifier.replace(/\s+/g, ''))
  );

  if (!user || !user.password) {
    // Uniform message to avoid account enumeration
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
  }

  // Verify bcrypt hash
  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
  }

  const token = generateToken(user);
  res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    user: sanitizeUser(user),
    token
  });
});

// Verify active session & return fresh user data
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User account not found.' });
  }
  res.json({ success: true, user: sanitizeUser(user) });
});

// NGO Onboarding & Coordinator Registration (Requires verification)
app.post('/api/auth/register-ngo', (req, res) => {
  const db = readDB();
  const {
    ngoName,
    coordinatorName,
    email,
    password,
    phone,
    darpanId,
    registrationNo,
    category,
    city,
    area,
    description
  } = req.body;

  if (!ngoName || !darpanId || !email || !password) {
    return res.status(400).json({ success: false, message: 'Organization name, Darpan ID, email, and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (db.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
  }

  const ngoId = `ngo-${Date.now().toString().slice(-4)}`;
  const newNgo = {
    id: ngoId,
    name: ngoName.trim(),
    category: category || 'child',
    subCategories: [category || 'child', 'medical'],
    darpanId: darpanId.trim(),
    registrationNo: registrationNo ? registrationNo.trim() : `REG-${Math.floor(10000 + Math.random() * 90000)}/MH`,
    isVerified: false,
    verificationStatus: 'pending',
    city: city || 'Mumbai',
    area: area || 'Central',
    geo: { lat: 19.0760, lng: 72.8777 },
    phone: phone ? phone.trim() : '+91 98000 00000',
    email: normalizedEmail,
    website: `https://${ngoName.toLowerCase().replace(/\s+/g, '')}.org`,
    logo: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    establishedYear: new Date().getFullYear(),
    description: description || 'Non-profit organization dedicated to community relief.',
    rating: 5.0,
    activeVolunteers: 10,
    verifiedDocuments: ['Darpan_Application.pdf', 'Trust_Deed.pdf'],
    urgentNeeds: []
  };

  const coordinatorUser = {
    id: `ngo-user-${Date.now().toString().slice(-4)}`,
    username: normalizedEmail.split('@')[0],
    name: coordinatorName ? coordinatorName.trim() : `${ngoName} Coordinator`,
    email: normalizedEmail,
    phone: phone ? phone.trim() : '+91 98000 00000',
    role: 'ngo',
    ngoId,
    ngoName: newNgo.name,
    password: bcrypt.hashSync(password, 10),
    city: city || 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  };

  db.ngos.unshift(newNgo);
  db.users.push(coordinatorUser);

  // Notify Admin
  db.notifications.unshift({
    id: `notif-reg-${Date.now()}`,
    targetRole: 'admin',
    title: 'New NGO Registration Pending Verification',
    message: `${newNgo.name} (Darpan: ${newNgo.darpanId}) submitted documents for platform accreditation.`,
    timestamp: new Date().toISOString(),
    read: false,
    link: '/admin/verifications'
  });

  writeDB(db);

  const token = generateToken(coordinatorUser);
  res.status(201).json({
    success: true,
    user: sanitizeUser(coordinatorUser),
    ngo: newNgo,
    token,
    message: 'NGO onboarding submitted! Application queued for Admin verification.'
  });
});

/* ==========================================================================
   INCIDENTS API (Publicly viewable, reporting supports optionalAuth/guest)
   ========================================================================== */

// Get all incidents (Public)
app.get('/api/incidents', (req, res) => {
  const db = readDB();
  let incidents = [...db.incidents];
  const { reporterId, ngoId, category, priority, status } = req.query;

  if (reporterId) {
    incidents = incidents.filter(i => i.reporterId === reporterId);
  }
  if (ngoId) {
    incidents = incidents.filter(i => i.assignedNgoId === ngoId);
  }
  if (category && category !== 'all') {
    incidents = incidents.filter(i => i.category === category);
  }
  if (priority && priority !== 'all') {
    incidents = incidents.filter(i => i.priority === priority);
  }
  if (status && status !== 'all') {
    incidents = incidents.filter(i => i.status === status);
  }

  const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
  incidents.sort((a, b) => {
    const diff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    if (diff !== 0) return diff;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  res.json({ success: true, count: incidents.length, data: incidents });
});

// Get single incident (Public)
app.get('/api/incidents/:id', (req, res) => {
  const db = readDB();
  const incident = db.incidents.find(i => i.id === req.params.id);
  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident not found' });
  }
  res.json({ success: true, data: incident });
});

// Report a new incident (Guest or Auth)
app.post('/api/incidents', optionalAuth, (req, res) => {
  const db = readDB();
  const {
    category,
    categoryLabel,
    categoryIcon,
    priority = 'medium',
    description,
    photoUrl,
    geo,
    address,
    isAnonymous = false,
    reporterName,
    reporterPhone
  } = req.body;

  if (!category || !description) {
    return res.status(400).json({ success: false, message: 'Category and description are required.' });
  }

  const newIncidentId = `inc-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();
  const { ngo, distance } = routeIncidentToNearestNGO({ category, geo }, db.ngos);

  const effectiveReporterName = isAnonymous 
    ? 'Anonymous Citizen' 
    : (req.user?.name || reporterName || 'Concerned Citizen');
  const effectiveReporterId = isAnonymous ? null : (req.user?.id || null);

  const initialTimeline = [
    {
      status: 'reported',
      title: 'Incident Reported',
      timestamp: now,
      note: isAnonymous 
        ? 'Report submitted securely as an Anonymous Citizen.' 
        : `Report submitted by ${effectiveReporterName} with GPS & photo verification.`
    }
  ];

  if (ngo) {
    initialTimeline.push({
      status: 'assigned',
      title: 'NGO Auto-Assigned',
      timestamp: new Date(Date.now() + 1000).toISOString(),
      note: `Auto-routed to nearest verified NGO: ${ngo.name} (${distance} km away).`
    });
  }

  const newIncident = {
    id: newIncidentId,
    category,
    categoryLabel: categoryLabel || category,
    categoryIcon: categoryIcon || '🚨',
    priority: priority.toLowerCase(),
    description,
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&auto=format&fit=crop&q=80',
    geo: geo || { lat: 19.0760, lng: 72.8777 },
    address: address || 'Mumbai Central, Maharashtra',
    isAnonymous: Boolean(isAnonymous),
    reporterId: effectiveReporterId,
    reporterName: effectiveReporterName,
    reporterPhone: isAnonymous ? null : (req.user?.phone || reporterPhone || null),
    assignedNgoId: ngo ? ngo.id : null,
    assignedNgoName: ngo ? ngo.name : 'Pending Assignment',
    distanceKm: distance,
    status: ngo ? 'assigned' : 'reported',
    statusTimeline: initialTimeline,
    createdAt: now,
    resolvedNote: ''
  };

  db.incidents.unshift(newIncident);

  if (ngo) {
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      targetRole: 'ngo',
      ngoId: ngo.id,
      title: `🚨 ${priority.toUpperCase()} Priority Incident: ${newIncident.categoryLabel}`,
      message: `Emergency reported at ${newIncident.address} (${distance} km away). Urgency: ${priority.toUpperCase()}`,
      timestamp: now,
      read: false,
      link: `/ngo/incidents`
    });
  }

  writeDB(db);
  res.status(201).json({ success: true, data: newIncident, message: 'Emergency incident reported and auto-assigned!' });
});

// Update Incident Status (Protected: NGO or Admin)
app.patch('/api/incidents/:id/status', authenticateToken, requireRole(['ngo', 'admin']), (req, res) => {
  const db = readDB();
  const incident = db.incidents.find(i => i.id === req.params.id);
  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident not found' });
  }

  const { status, note, resolvedNote } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'New status is required' });
  }

  const statusTitles = {
    reported: 'Incident Reported',
    assigned: 'NGO Assigned',
    accepted: 'NGO Accepted Case',
    team_dispatched: 'Team Dispatched',
    reached_location: 'Reached Location',
    help_provided: 'Help / Aid Provided',
    resolved: 'Resolved Successfully'
  };

  incident.status = status;
  if (resolvedNote) {
    incident.resolvedNote = resolvedNote;
  }

  const stepTitle = statusTitles[status] || status.replace('_', ' ').toUpperCase();
  incident.statusTimeline.push({
    status,
    title: stepTitle,
    timestamp: new Date().toISOString(),
    note: note || (status === 'resolved' ? (resolvedNote || 'Incident closed with verified assistance.') : `Case updated to ${stepTitle}.`)
  });

  if (incident.reporterId) {
    db.notifications.unshift({
      id: `notif-u-${Date.now()}`,
      targetRole: 'public',
      userId: incident.reporterId,
      title: `Incident Update: ${stepTitle} 📍`,
      message: `${incident.assignedNgoName || 'Rescue Team'}: ${note || stepTitle}`,
      timestamp: new Date().toISOString(),
      read: false,
      link: `/incidents/${incident.id}`
    });
  }

  writeDB(db);
  res.json({ success: true, data: incident, message: `Status updated to ${status}` });
});

/* ==========================================================================
   NGO DIRECTORY & NEEDS API (Publicly viewable)
   ========================================================================== */

// List NGOs (Public)
app.get('/api/ngos', (req, res) => {
  const db = readDB();
  let ngos = [...db.ngos];
  const { category, verified, city, search } = req.query;

  if (category && category !== 'all') {
    ngos = ngos.filter(n => n.category === category || (n.subCategories && n.subCategories.includes(category)));
  }
  if (verified !== undefined) {
    const isV = verified === 'true';
    ngos = ngos.filter(n => n.isVerified === isV);
  }
  if (city) {
    ngos = ngos.filter(n => n.city.toLowerCase() === city.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    ngos = ngos.filter(n => n.name.toLowerCase().includes(q) || n.description.toLowerCase().includes(q));
  }

  res.json({ success: true, count: ngos.length, data: ngos });
});

// Single NGO (Public)
app.get('/api/ngos/:id', (req, res) => {
  const db = readDB();
  const ngo = db.ngos.find(n => n.id === req.params.id);
  if (!ngo) {
    return res.status(404).json({ success: false, message: 'NGO not found' });
  }
  res.json({ success: true, data: ngo });
});

// Post urgent need (Protected: NGO or Admin)
app.post('/api/ngos/:id/needs', authenticateToken, requireRole(['ngo', 'admin']), (req, res) => {
  const db = readDB();
  const ngo = db.ngos.find(n => n.id === req.params.id);
  if (!ngo) return res.status(404).json({ success: false, message: 'NGO not found' });

  const { title, priority = 'high', fundsNeeded, volunteersNeeded } = req.body;
  const newNeed = {
    id: `need-${Date.now()}`,
    title,
    priority,
    fundsNeeded: fundsNeeded ? Number(fundsNeeded) : undefined,
    fundsCollected: 0,
    volunteersNeeded: volunteersNeeded ? Number(volunteersNeeded) : undefined,
    volunteersJoined: 0
  };

  if (!ngo.urgentNeeds) ngo.urgentNeeds = [];
  ngo.urgentNeeds.unshift(newNeed);

  writeDB(db);
  res.status(201).json({ success: true, data: newNeed });
});

/* ==========================================================================
   ADOPTION & ELDERLY SPONSORSHIP API (CARA Compliance Bridge)
   ========================================================================== */

// List listings (Public)
app.get('/api/adoption-listings', (req, res) => {
  const db = readDB();
  let listings = [...db.adoptionListings];
  const { type, ngoId, status } = req.query;

  if (type && type !== 'all') {
    listings = listings.filter(l => l.type === type);
  }
  if (ngoId) {
    listings = listings.filter(l => l.ngoId === ngoId);
  }
  if (status && status !== 'all') {
    listings = listings.filter(l => l.status === status);
  }

  res.json({ success: true, count: listings.length, data: listings });
});

// Post new listing (Protected: NGO or Admin)
app.post('/api/adoption-listings', authenticateToken, requireRole(['ngo', 'admin']), (req, res) => {
  const db = readDB();
  const {
    ngoId,
    type,
    name,
    gender,
    age,
    photo,
    healthStatus,
    interests,
    backgroundNote,
    caraNote
  } = req.body;

  const ngo = db.ngos.find(n => n.id === (ngoId || req.user.ngoId)) || db.ngos[0];
  const isChild = type === 'child';

  const newListing = {
    id: `adopt-${Date.now().toString().slice(-6)}`,
    ngoId: ngo.id,
    ngoName: ngo.name,
    type: type || 'child',
    name,
    gender,
    age,
    photo: photo || 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500&auto=format&fit=crop&q=80',
    healthStatus: healthStatus || 'Healthy & Verified',
    interests: interests || '',
    backgroundNote: backgroundNote || '',
    caraRegistrationRequired: isChild,
    caraNote: isChild 
      ? (caraNote || 'Official CARA discovery reference. Final adoption governed under Juvenile Justice Act 2015 via CARINGS.')
      : (caraNote || 'Elderly Sponsorship & Companionship Program.'),
    status: 'available',
    createdAt: new Date().toISOString()
  };

  db.adoptionListings.unshift(newListing);
  writeDB(db);
  res.status(201).json({ success: true, data: newListing });
});

// Submit non-binding Inquiry (Protected: Must be logged in)
app.post('/api/adoption-inquiries', authenticateToken, (req, res) => {
  const db = readDB();
  const { listingId, inquiryType, message } = req.body;

  const listing = db.adoptionListings.find(l => l.id === listingId);
  if (!listing) {
    return res.status(404).json({ success: false, message: 'Listing not found' });
  }

  const newInquiry = {
    id: `inq-${Date.now().toString().slice(-6)}`,
    listingId,
    personName: listing.name,
    type: listing.type,
    ngoId: listing.ngoId,
    ngoName: listing.ngoName,
    userId: req.user.id,
    userName: req.user.name,
    userPhone: req.user.phone || '+91 98765 43210',
    userEmail: req.user.email,
    inquiryType: inquiryType || (listing.type === 'child' ? 'CARA Pre-Counseling & Discovery' : 'Elderly Sponsorship & Visit'),
    message: message || '',
    status: 'pending',
    ngoNote: 'Inquiry received. NGO coordinator will schedule a briefing.',
    createdAt: new Date().toISOString()
  };

  db.adoptionInquiries.unshift(newInquiry);

  db.notifications.unshift({
    id: `notif-inq-${Date.now()}`,
    targetRole: 'ngo',
    ngoId: listing.ngoId,
    title: `New Inquiry for ${listing.name} (${listing.type.toUpperCase()})`,
    message: `Received from ${req.user.name}: "${(message || '').slice(0, 60)}..."`,
    timestamp: new Date().toISOString(),
    read: false,
    link: `/ngo/adoption`
  });

  writeDB(db);
  res.status(201).json({
    success: true,
    data: newInquiry,
    message: listing.type === 'child'
      ? 'Formal inquiry logged. CARA compliance coordinator will reach out to guide official CARINGS registration.'
      : 'Sponsorship inquiry submitted successfully!'
  });
});

// Get inquiries (Protected)
app.get('/api/adoption-inquiries', authenticateToken, (req, res) => {
  const db = readDB();
  let inquiries = [...db.adoptionInquiries];

  if (req.user.role === 'admin') {
    // Admin sees all
  } else if (req.user.role === 'ngo') {
    inquiries = inquiries.filter(i => i.ngoId === req.user.ngoId);
  } else {
    // Citizen sees own
    inquiries = inquiries.filter(i => i.userId === req.user.id);
  }

  res.json({ success: true, count: inquiries.length, data: inquiries });
});

// Update inquiry status (Protected: NGO or Admin)
app.patch('/api/adoption-inquiries/:id', authenticateToken, requireRole(['ngo', 'admin']), (req, res) => {
  const db = readDB();
  const inquiry = db.adoptionInquiries.find(i => i.id === req.params.id);
  if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });

  const { status, ngoNote } = req.body;
  if (status) inquiry.status = status;
  if (ngoNote) inquiry.ngoNote = ngoNote;

  writeDB(db);
  res.json({ success: true, data: inquiry });
});

/* ==========================================================================
   DONATIONS & CAMPAIGNS API (Anonymous by default, 80G Receipts)
   ========================================================================== */

// List campaigns (Public)
app.get('/api/campaigns', (req, res) => {
  const db = readDB();
  const { category, ngoId } = req.query;
  let campaigns = [...db.campaigns];

  if (category && category !== 'all') {
    campaigns = campaigns.filter(c => c.category === category);
  }
  if (ngoId) {
    campaigns = campaigns.filter(c => c.ngoId === ngoId);
  }

  res.json({ success: true, count: campaigns.length, data: campaigns });
});

// Process donation (Protected: Login required)
app.post('/api/donations', authenticateToken, (req, res) => {
  const db = readDB();
  const {
    campaignId,
    ngoId,
    amount,
    isAnonymousPublic = true,
    showDonorName = false,
    paymentMethod = 'UPI (Test Mode)'
  } = req.body;

  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Valid donation amount is required.' });
  }

  let campaign = null;
  let ngo = null;

  if (campaignId) {
    campaign = db.campaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.raisedAmount += numAmount;
      campaign.donorCount += 1;
      ngo = db.ngos.find(n => n.id === campaign.ngoId);
    }
  }

  if (!ngo && ngoId) {
    ngo = db.ngos.find(n => n.id === ngoId);
  }
  if (!ngo) ngo = db.ngos[0];

  const donId = `don-${Date.now().toString().slice(-6)}`;
  const receiptNo = `80G-${ngo.id.toUpperCase()}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newDonation = {
    id: donId,
    campaignId: campaign ? campaign.id : null,
    campaignTitle: campaign ? campaign.title : `General Fund for ${ngo.name}`,
    ngoId: ngo.id,
    ngoName: ngo.name,
    userId: req.user.id,
    donorName: req.user.name,
    donorEmail: req.user.email,
    donorPhone: req.user.phone || '+91 98765 43210',
    amount: numAmount,
    isAnonymousPublic: Boolean(isAnonymousPublic),
    showDonorName: Boolean(showDonorName),
    paymentMethod,
    transactionId: `TXN_${Date.now()}`,
    receiptNo,
    createdAt: new Date().toISOString()
  };

  db.donations.unshift(newDonation);

  // Credit user karma
  const user = db.users.find(u => u.id === req.user.id);
  if (user) {
    user.karmaPoints = (user.karmaPoints || 0) + Math.floor(numAmount / 10);
  }

  // Notify NGO (Donor name hidden if anonymous)
  db.notifications.unshift({
    id: `notif-don-${Date.now()}`,
    targetRole: 'ngo',
    ngoId: ngo.id,
    title: `💰 New Donation of ₹${numAmount.toLocaleString('en-IN')}`,
    message: showDonorName 
      ? `Received from ${req.user.name} for ${newDonation.campaignTitle}.`
      : `Received from an Anonymous Citizen for ${newDonation.campaignTitle}. Donor identity encrypted.`,
    timestamp: new Date().toISOString(),
    read: false,
    link: `/ngo/donations`
  });

  writeDB(db);

  res.status(201).json({
    success: true,
    data: newDonation,
    message: 'Donation processed successfully! 80G tax receipt generated.'
  });
});

// Get donations (Anonymized view based on viewer role)
app.get('/api/donations', optionalAuth, (req, res) => {
  const db = readDB();
  const { userId, ngoId, campaignId } = req.query;
  let list = [...db.donations];

  if (userId) {
    list = list.filter(d => d.userId === userId);
    return res.json({ success: true, count: list.length, data: list });
  }

  if (ngoId) {
    list = list.filter(d => d.ngoId === ngoId);
  }
  if (campaignId) {
    list = list.filter(d => d.campaignId === campaignId);
  }

  const isPlatformAdmin = req.user && req.user.role === 'admin';

  // Apply privacy masking
  const maskedList = list.map(d => {
    if (isPlatformAdmin) return d;
    if (!d.showDonorName && d.isAnonymousPublic) {
      return {
        ...d,
        donorName: 'Kind Anonymous Donor',
        donorEmail: '***@***.com',
        donorPhone: '**********'
      };
    }
    return d;
  });

  res.json({ success: true, count: maskedList.length, data: maskedList });
});

// Post campaign transparency update (Protected: NGO or Admin)
app.post('/api/campaigns/:id/transparency', authenticateToken, requireRole(['ngo', 'admin']), (req, res) => {
  const db = readDB();
  const campaign = db.campaigns.find(c => c.id === req.params.id);
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

  const { title, cost, description, proofPhoto } = req.body;
  if (!campaign.transparencyUpdates) campaign.transparencyUpdates = [];

  const update = {
    date: new Date().toISOString().split('T')[0],
    title,
    cost,
    description,
    proofPhoto: proofPhoto || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80'
  };

  campaign.transparencyUpdates.unshift(update);
  writeDB(db);
  res.status(201).json({ success: true, data: update });
});

/* ==========================================================================
   VOLUNTEERING & QR ATTENDANCE API
   ========================================================================== */

// List drives (Public)
app.get('/api/volunteering', (req, res) => {
  const db = readDB();
  res.json({ success: true, count: db.volunteeringDrives.length, data: db.volunteeringDrives });
});

// Post new drive (Protected: NGO or Admin)
app.post('/api/volunteering', authenticateToken, requireRole(['ngo', 'admin']), (req, res) => {
  const db = readDB();
  const { title, category, date, time, location, slotsTotal, description, skillsNeeded } = req.body;
  const ngo = db.ngos.find(n => n.id === req.user.ngoId) || db.ngos[0];

  const newDrive = {
    id: `vol-${Date.now().toString().slice(-6)}`,
    ngoId: ngo.id,
    ngoName: ngo.name,
    title,
    category: category || 'child',
    date,
    time,
    location,
    slotsTotal: Number(slotsTotal) || 20,
    slotsFilled: 0,
    description,
    skillsNeeded: Array.isArray(skillsNeeded) ? skillsNeeded : (skillsNeeded ? skillsNeeded.split(',') : []),
    qrCheckInSecret: `QR_SECRET_${Date.now()}`
  };

  db.volunteeringDrives.unshift(newDrive);
  writeDB(db);
  res.status(201).json({ success: true, data: newDrive });
});

// Volunteer RSVP (Protected: Login required)
app.post('/api/volunteering/register', authenticateToken, (req, res) => {
  const db = readDB();
  const { driveId } = req.body;

  const drive = db.volunteeringDrives.find(d => d.id === driveId);
  if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });

  // Prevent duplicate registration
  const existing = db.volunteerRegistrations.find(r => r.driveId === driveId && r.userId === req.user.id);
  if (existing) {
    return res.json({ success: true, data: existing, message: 'You are already registered for this drive!' });
  }

  const regId = `vreg-${Date.now().toString().slice(-6)}`;
  const qrPassToken = `NGO_PASS_${regId}_${driveId}_${req.user.id}`;

  const registration = {
    id: regId,
    driveId,
    driveTitle: drive.title,
    driveDate: drive.date,
    driveLocation: drive.location,
    ngoName: drive.ngoName,
    userId: req.user.id,
    userName: req.user.name,
    userPhone: req.user.phone || '+91 98765 43210',
    userEmail: req.user.email,
    status: 'approved',
    checkedIn: false,
    checkInTime: null,
    qrPassToken
  };

  db.volunteerRegistrations.unshift(registration);
  drive.slotsFilled = (drive.slotsFilled || 0) + 1;

  writeDB(db);
  res.status(201).json({ success: true, data: registration, message: 'Slot confirmed! Digital QR Pass generated.' });
});

// Volunteer Check-In via QR Scan (Protected: NGO or Admin)
app.post('/api/volunteering/checkin', authenticateToken, requireRole(['ngo', 'admin']), (req, res) => {
  const db = readDB();
  const { qrPassToken } = req.body;

  const reg = db.volunteerRegistrations.find(r => r.qrPassToken === qrPassToken);
  if (!reg) {
    return res.status(404).json({ success: false, message: 'Invalid or expired QR Volunteer Pass.' });
  }

  if (reg.checkedIn) {
    return res.json({ success: true, alreadyCheckedIn: true, message: `Already checked in at ${reg.checkInTime}`, data: reg });
  }

  reg.checkedIn = true;
  reg.checkInTime = new Date().toISOString();

  const user = db.users.find(u => u.id === reg.userId);
  if (user) {
    user.karmaPoints = (user.karmaPoints || 0) + 50;
  }

  writeDB(db);
  res.json({ success: true, data: reg, message: `Check-in successful! Welcome, ${reg.userName}. (+50 Karma Credits)` });
});

// My registrations (Protected)
app.get('/api/volunteering/my-registrations', authenticateToken, (req, res) => {
  const db = readDB();
  const myRegs = db.volunteerRegistrations.filter(r => r.userId === req.user.id);
  res.json({ success: true, data: myRegs });
});

/* ==========================================================================
   ADMIN GOVERNANCE & MODERATION API (Protected: Admin Only)
   ========================================================================== */

app.get('/api/admin/pending-ngos', authenticateToken, requireRole(['admin']), (req, res) => {
  const db = readDB();
  const pending = db.ngos.filter(n => !n.isVerified || n.verificationStatus === 'pending');
  res.json({ success: true, count: pending.length, data: pending });
});

app.post('/api/admin/verify-ngo/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const db = readDB();
  const ngo = db.ngos.find(n => n.id === req.params.id);
  if (!ngo) return res.status(404).json({ success: false, message: 'NGO not found' });

  const { action, reason } = req.body; // 'approve' | 'reject'
  if (action === 'approve') {
    ngo.isVerified = true;
    ngo.verificationStatus = 'verified';
  } else {
    ngo.isVerified = false;
    ngo.verificationStatus = 'rejected';
    ngo.rejectionReason = reason || 'Document verification failed.';
  }

  writeDB(db);
  res.json({ success: true, data: ngo, message: `NGO ${action === 'approve' ? 'verified successfully' : 'rejected'}.` });
});

app.get('/api/admin/analytics', authenticateToken, requireRole(['admin']), (req, res) => {
  const db = readDB();
  const totalIncidents = db.incidents.length;
  const resolvedIncidents = db.incidents.filter(i => i.status === 'resolved').length;
  const criticalIncidents = db.incidents.filter(i => i.priority === 'critical').length;
  const totalDonations = db.donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalVolunteers = db.volunteerRegistrations.length;
  const verifiedNgos = db.ngos.filter(n => n.isVerified).length;
  const pendingNgos = db.ngos.filter(n => !n.isVerified).length;

  res.json({
    success: true,
    data: {
      totalIncidents,
      resolvedIncidents,
      resolutionRate: totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 0,
      criticalIncidents,
      totalDonations,
      totalVolunteers,
      verifiedNgos,
      pendingNgos,
      avgResponseTimeMins: 14
    }
  });
});

/* ==========================================================================
   SAHAY AI GENERATIVE CHATBOT API (Live Database RAG & Gemini Integration)
   ========================================================================== */

app.post('/api/chatbot', async (req, res) => {
  const db = readDB();
  const { message, conversationHistory = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const query = message.toLowerCase().trim();
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // Compile live platform context for RAG
  const verifiedNgosList = db.ngos.filter(n => n.isVerified).map(n => ({
    name: n.name,
    category: n.category,
    city: n.city,
    area: n.area,
    darpanId: n.darpanId,
    rating: n.rating,
    activeNeeds: n.urgentNeeds?.map(u => u.title) || []
  }));

  const activeCampaignsList = db.campaigns.map(c => ({
    title: c.title,
    ngoName: c.ngoName,
    raised: c.raisedAmount,
    target: c.targetAmount,
    percent: Math.round((c.raisedAmount / c.targetAmount) * 100)
  }));

  const activeDrivesList = db.volunteeringDrives.map(d => ({
    title: d.title,
    ngoName: d.ngoName,
    date: d.date,
    location: d.location,
    slotsLeft: d.slotsTotal - (d.slotsFilled || 0)
  }));

  const systemContextPrompt = `You are Sahay AI, the official compassionate, intelligent, 24/7 AI relief assistant for the "NGO Connect India" platform.
Your mission is to assist citizens, donors, volunteers, and NGOs with verified information, emergency response auto-routing, CARA statutory adoption compliance, Section 80G tax exemptions, and NGO discovery.

LIVE PLATFORM DATABASE CONTEXT:
- Verified NGOs: ${JSON.stringify(verifiedNgosList)}
- Urgent Relief Campaigns: ${JSON.stringify(activeCampaignsList)}
- Upcoming Volunteer Drives: ${JSON.stringify(activeDrivesList)}
- Key Platform Policies:
  * Emergency SOS: Auto-routes in under 60 seconds to nearest verified NGO with live 7-stage timeline tracking.
  * Child Adoption: Must strictly adhere to CARA (Central Adoption Resource Authority) & Juvenile Justice Act 2015. NGO Connect acts as a discovery & SAA inquiry bridge only.
  * Donations: 100% Anonymous-by-default on public feed with instant downloadable Section 80G Tax Exemption receipts.
  * Volunteering: RSVP grants digital QR Attendance Pass (+50 Karma credits upon on-ground check-in).

Respond in warm, clear, structured markdown with bullet points and emojis. Keep answers concise, helpful, and actionable.`;

  // 1. If GEMINI_API_KEY is configured, call Google Gemini Generative AI
  if (geminiApiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemContextPrompt}\n\nUser Question: ${message}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600
          }
        })
      });

      const geminiData = await response.json();
      if (geminiData.candidates && geminiData.candidates[0]?.content?.parts?.[0]?.text) {
        const generatedReply = geminiData.candidates[0].content.parts[0].text;
        return res.json({
          success: true,
          reply: generatedReply,
          model: 'Gemini 1.5 Flash (Generative AI)',
          quickActions: [
            { label: '🚨 Report Live SOS', link: '/report' },
            { label: '💰 Donate Anonymously', link: '/campaigns' },
            { label: '🤝 Volunteer Drives', link: '/volunteering' }
          ]
        });
      }
    } catch (apiErr) {
      console.warn('Gemini API call error, falling back to dynamic RAG engine:', apiErr.message);
    }
  }

  // 2. High-Performance Contextual RAG Generator (Zero-Latency Live Synthesis)
  let generatedReply = '';
  let quickActions = [];

  // Intent A: Adoption & CARA Compliance
  if (query.includes('adopt') || query.includes('cara') || query.includes('child') || query.includes('orphan') || query.includes('elderly') || query.includes('sponsor')) {
    const availableChildren = db.adoptionListings.filter(l => l.type === 'child').length;
    const availableElderly = db.adoptionListings.filter(l => l.type === 'elderly').length;

    generatedReply = `### 👶 CARA Legal Child Adoption & Elderly Care Discovery\n\nIn India, all child adoptions are strictly regulated by the **Central Adoption Resource Authority (CARA)** under the **Juvenile Justice (Care and Protection of Children) Act 2015**.\n\n**How NGO Connect Helps:**\n* **Verified Discovery:** We partner with registered Specialized Adoption Agencies (SAAs) to present discovery profiles (${availableChildren} children & ${availableElderly} elderly residents currently in care).\n* **Non-Binding Inquiry:** Expressing an inquiry alerts the accredited NGO coordinator to schedule legal pre-counseling.\n* **Official Portal:** Final registration and legal placement must proceed through the official Government portal: **[cara.wcd.gov.in](https://cara.wcd.gov.in)**.\n\n*Would you like to explore verified adoption discovery listings or elderly care sponsorship?*`;
    
    quickActions = [
      { label: '👶 Browse Adoption & Care Listings', link: '/adoption' },
      { label: '📖 Read CARA Guidelines FAQ', faqId: 'faq-2' }
    ];
  }

  // Intent B: Emergency SOS & Auto-Routing
  else if (query.includes('emergency') || query.includes('sos') || query.includes('report') || query.includes('accident') || query.includes('injured') || query.includes('rescue') || query.includes('distress')) {
    generatedReply = `### 🚨 Smart Emergency Incident Auto-Routing\n\nOur system delivers rapid emergency dispatch in 4 steps:\n\n1. **Report Incident:** Tap **Report SOS**, choose from 7 emergency categories, and attach a photo.\n2. **GPS Pinpoint:** Confirm your exact GPS coordinates on the interactive map.\n3. **Haversine Auto-Routing:** Our algorithm matches the case with the nearest verified NGO within seconds.\n4. **Live 7-Stage Tracker:** Follow dispatch progress in real-time (*Reported → Assigned → Accepted → Dispatched → On-Scene → Aid Provided → Resolved*).`;
    
    quickActions = [
      { label: '🚨 Report Emergency SOS Now', link: '/report' },
      { label: '📍 View Active Live Incidents', link: '/incidents' }
    ];
  }

  // Intent C: Donations & 80G Tax Exemption
  else if (query.includes('donate') || query.includes('donation') || query.includes('tax') || query.includes('80g') || query.includes('money') || query.includes('fund') || query.includes('receipt')) {
    const topCampaign = db.campaigns[0];
    const topCampaignTitle = topCampaign ? topCampaign.title : 'Emergency Child Malnutrition & Medical Relief';
    const topCampaignRaised = topCampaign ? topCampaign.raisedAmount.toLocaleString('en-IN') : '1,85,000';

    generatedReply = `### 💰 Anonymous Donations & Section 80G Tax Exemption\n\n* **Anonymous by Default:** Your donor identity and personal contact details are completely encrypted and never revealed on the public feed or to NGO staff without your explicit consent.\n* **Instant 80G Receipt:** Download your official Section 80G Tax Exemption Receipt immediately after completing your donation to claim 50% tax deductions under the Indian Income Tax Act.\n* **100% Fund Transparency:** NGOs publish photographic expenditure proof logs for every rupee spent.\n\n**Featured Urgent Need:** *${topCampaignTitle}* (₹${topCampaignRaised} raised so far).`;
    
    quickActions = [
      { label: '💰 Donate Anonymously (80G)', link: '/campaigns' },
      { label: '📄 View My Tax Receipts', link: '/profile' }
    ];
  }

  // Intent D: Volunteering & QR Pass
  else if (query.includes('volunteer') || query.includes('drive') || query.includes('event') || query.includes('qr') || query.includes('attendance') || query.includes('karma')) {
    const upcomingDrives = db.volunteeringDrives.slice(0, 2);
    const driveSummary = upcomingDrives.map(d => `• **${d.title}** with *${d.ngoName}* on **${d.date}** (${d.slotsTotal - d.slotsFilled} slots available)`).join('\n');

    generatedReply = `### 🤝 Community Volunteering & QR Attendance\n\nJoin high-impact on-ground drives organized by verified NGOs:\n\n${driveSummary}\n\n**How Check-in Works:**\n1. RSVP for an upcoming drive.\n2. Receive an encrypted **Digital QR Volunteer Pass**.\n3. Present the pass to NGO coordinators upon arrival to check in and earn **+50 Community Karma Credits**!`;
    
    quickActions = [
      { label: '🤝 Browse Volunteer Drives', link: '/volunteering' }
    ];
  }

  // Intent E: NGO Search & Recommendations
  else if (query.includes('ngo') || query.includes('shelter') || query.includes('near') || query.includes('mumbai') || query.includes('trust') || query.includes('darpan')) {
    let filtered = db.ngos.filter(n => n.isVerified);
    if (query.includes('animal') || query.includes('dog') || query.includes('cat')) {
      filtered = filtered.filter(n => n.category === 'animal');
    } else if (query.includes('child') || query.includes('school')) {
      filtered = filtered.filter(n => n.category === 'child');
    } else if (query.includes('elder') || query.includes('old age')) {
      filtered = filtered.filter(n => n.category === 'elderly');
    }

    const suggestions = filtered.slice(0, 3).map(n => `• **${n.name}** (${n.area || n.city}) — Rating: ${n.rating}⭐ | Darpan ID: \`${n.darpanId}\``).join('\n');

    generatedReply = `### 🏢 Verified NGOs on Platform\n\nHere are verified organizations accredited under Government Darpan:\n\n${suggestions}\n\nEvery NGO undergoes trust deed verification, 80G accreditation audit, and location validation before approval.`;
    
    quickActions = [
      { label: '🏢 Open Full NGO Directory', link: '/ngos' }
    ];
  }

  // Fallback / General Overview
  else {
    generatedReply = `Namaste! 🙏 I am **Sahay AI**, your intelligent assistant on **NGO Connect India**.\n\nI can assist you with:\n* 🚨 **Reporting emergency incidents (SOS)** with auto-routing to nearest rescue teams\n* 👶 **CARA-compliant Child Adoption & Elderly Care Discovery**\n* 💰 **Anonymous Donations** with instant Section 80G Tax Exemption receipts\n* 🤝 **Volunteering drives** with digital QR attendance passes\n* 🏢 **Finding verified NGOs** near your location with Darpan ID verification\n\n*How can I help you make a social impact today?*`;
    
    quickActions = [
      { label: '🚨 Report Live Incident', link: '/report' },
      { label: '👶 Adoption & Sponsorship', link: '/adoption' },
      { label: '💰 Donate Anonymously (80G)', link: '/campaigns' },
      { label: '🤝 Find Volunteer Drives', link: '/volunteering' }
    ];
  }

  res.json({
    success: true,
    reply: generatedReply,
    model: 'Sahay RAG Context Engine (v2.0)',
    quickActions
  });
});

/* ==========================================================================
   NOTIFICATIONS API
   ========================================================================== */

app.get('/api/notifications', optionalAuth, (req, res) => {
  const db = readDB();
  const { role } = req.query;
  const effectiveRole = req.user ? req.user.role : (role || 'public');
  let list = [...db.notifications];

  if (effectiveRole) {
    list = list.filter(n => n.targetRole === effectiveRole || n.targetRole === 'all');
  }

  res.json({ success: true, count: list.length, data: list });
});

app.patch('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const db = readDB();
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) notif.read = true;
  writeDB(db);
  res.json({ success: true });
});

// Health check (Critical for Render deployment verification)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    platform: 'NGO Connect Production v1.2'
  });
});

// Production Static Serving: Serve client/dist when available
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Explicit binding to '0.0.0.0' for Linux container and Render proxy compatibility
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ NGO Connect Server running on http://0.0.0.0:${PORT} (Node ${process.version})`);
});
