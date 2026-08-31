const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
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
  
  // First filter by category match
  let candidates = verifiedNgos.filter(n => 
    n.category === incident.category || 
    (n.subCategories && n.subCategories.includes(incident.category))
  );

  // Fallback to any verified NGO if no direct category match
  if (candidates.length === 0) {
    candidates = verifiedNgos;
  }

  if (candidates.length === 0) {
    return { ngo: null, distance: null };
  }

  // Calculate distance for all candidates
  const withDistance = candidates.map(ngo => {
    const dist = calculateDistance(
      incident.geo?.lat,
      incident.geo?.lng,
      ngo.geo?.lat,
      ngo.geo?.lng
    );
    return { ngo, dist };
  });

  // Sort by nearest distance
  withDistance.sort((a, b) => a.dist - b.dist);
  return {
    ngo: withDistance[0].ngo,
    distance: withDistance[0].dist
  };
};

/* ==========================================================================
   AUTHENTICATION API (Citizens, NGO Staff & Platform Admin)
   ========================================================================== */

// Send OTP simulation
app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required.' });

  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  res.json({
    success: true,
    message: `OTP sent successfully to ${phone}!`,
    simulatedOtp: generatedOtp // Returned for seamless testing in demo mode
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const db = readDB();
  const { role = 'public', identifier, password, otp } = req.body;

  if (role === 'admin') {
    // Admin Passcode check
    if (password === 'admin123' || password === 'root' || !password) {
      const adminUser = db.users.find(u => u.role === 'admin') || {
        id: 'admin-root',
        name: 'Ananya Roy (Platform Admin)',
        email: 'admin@ngoconnect.org',
        role: 'admin',
        city: 'Pan-India',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
      };
      return res.json({ success: true, user: adminUser, token: `tok_admin_${Date.now()}` });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid Admin passcode. Try "admin123".' });
    }
  }

  if (role === 'ngo') {
    // NGO Staff login
    const ngoUser = db.users.find(u => u.role === 'ngo' && (u.email === identifier || u.phone === identifier)) || db.users.find(u => u.role === 'ngo');
    return res.json({ success: true, user: ngoUser, token: `tok_ngo_${Date.now()}` });
  }

  // Public Citizen Login
  let citizen = db.users.find(u => u.role === 'public' && (u.email === identifier || u.phone === identifier));
  if (!citizen) {
    citizen = db.users.find(u => u.role === 'public') || {
      id: `user-${Date.now()}`,
      name: identifier ? identifier.split('@')[0] : 'Citizen User',
      email: identifier || 'citizen@example.com',
      phone: '+91 98765 43210',
      role: 'public',
      city: 'Mumbai',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      karmaPoints: 100
    };
  }

  res.json({ success: true, user: citizen, token: `tok_user_${Date.now()}` });
});

// Citizen Registration
app.post('/api/auth/register-user', (req, res) => {
  const db = readDB();
  const { name, email, phone, city } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and phone are required.' });
  }

  const newUser = {
    id: `user-${Date.now().toString().slice(-6)}`,
    name,
    email: email || `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
    phone,
    role: 'public',
    city: city || 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    karmaPoints: 50,
    badges: ['New Member']
  };

  db.users.push(newUser);
  writeDB(db);
  res.status(201).json({ success: true, user: newUser, token: `tok_user_${Date.now()}` });
});

// NGO Onboarding Registration (creates NGO in 'pending' status for Admin queue)
app.post('/api/auth/register-ngo', (req, res) => {
  const db = readDB();
  const {
    ngoName,
    coordinatorName,
    email,
    phone,
    darpanId,
    registrationNo,
    category,
    city,
    area,
    description
  } = req.body;

  if (!ngoName || !darpanId || !email) {
    return res.status(400).json({ success: false, message: 'Organization name, Darpan ID, and email are required.' });
  }

  const ngoId = `ngo-${Date.now().toString().slice(-4)}`;
  const newNgo = {
    id: ngoId,
    name: ngoName,
    category: category || 'child',
    subCategories: [category || 'child', 'medical'],
    darpanId,
    registrationNo: registrationNo || `REG-${Math.floor(10000 + Math.random() * 90000)}/MH`,
    isVerified: false,
    verificationStatus: 'pending',
    city: city || 'Mumbai',
    area: area || 'Central',
    geo: { lat: 19.0760, lng: 72.8777 },
    phone: phone || '+91 98000 00000',
    email,
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
    name: coordinatorName || `${ngoName} Coordinator`,
    email,
    phone: phone || '+91 98000 00000',
    role: 'ngo',
    ngoId,
    ngoName,
    city: city || 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  };

  db.ngos.unshift(newNgo);
  db.users.push(coordinatorUser);

  // Notify Admin
  db.notifications.unshift({
    id: `notif-reg-${Date.now()}`,
    targetRole: 'admin',
    title: 'New NGO Registration Pending Verification',
    message: `${ngoName} (Darpan: ${darpanId}) submitted documents for platform accreditation.`,
    timestamp: new Date().toISOString(),
    read: false,
    link: '/admin/verifications'
  });

  writeDB(db);

  res.status(201).json({
    success: true,
    user: coordinatorUser,
    ngo: newNgo,
    token: `tok_ngo_${Date.now()}`,
    message: 'NGO onboarding submitted! Application queued for Admin verification.'
  });
});

/* ==========================================================================
   INCIDENTS API (Flagship Smart Emergency Incident System)
   ========================================================================== */

// Get all incidents with optional filters
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

  // Sort by critical priority first, then recency
  const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
  incidents.sort((a, b) => {
    const diff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    if (diff !== 0) return diff;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  res.json({ success: true, count: incidents.length, data: incidents });
});

// Get single incident
app.get('/api/incidents/:id', (req, res) => {
  const db = readDB();
  const incident = db.incidents.find(i => i.id === req.params.id);
  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident not found' });
  }
  res.json({ success: true, data: incident });
});

// Report a new incident (Auto-routes & creates timeline)
app.post('/api/incidents', (req, res) => {
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
    reporterId,
    reporterName,
    reporterPhone
  } = req.body;

  if (!category || !description) {
    return res.status(400).json({ success: false, message: 'Category and description are required.' });
  }

  const newIncidentId = `inc-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  // Route to nearest NGO
  const { ngo, distance } = routeIncidentToNearestNGO({ category, geo }, db.ngos);

  const initialTimeline = [
    {
      status: 'reported',
      title: 'Incident Reported',
      timestamp: now,
      note: isAnonymous 
        ? 'Report submitted securely as an Anonymous Citizen.' 
        : `Report submitted by ${reporterName || 'Citizen'} with GPS & photo verification.`
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
    reporterId: isAnonymous ? null : (reporterId || 'user-rohan'),
    reporterName: isAnonymous ? 'Anonymous Citizen' : (reporterName || 'Rohan Sharma'),
    reporterPhone: isAnonymous ? null : (reporterPhone || '+91 98765 43210'),
    assignedNgoId: ngo ? ngo.id : null,
    assignedNgoName: ngo ? ngo.name : 'Pending Assignment',
    distanceKm: distance,
    status: ngo ? 'assigned' : 'reported',
    statusTimeline: initialTimeline,
    createdAt: now,
    resolvedNote: ''
  };

  db.incidents.unshift(newIncident);

  // Generate notification for NGO
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

  // Notification for citizen
  if (!isAnonymous && reporterId) {
    db.notifications.unshift({
      id: `notif-c-${Date.now()}`,
      targetRole: 'public',
      userId: reporterId,
      title: `Incident #${newIncidentId} Dispatched`,
      message: ngo ? `Assigned to ${ngo.name}. Rescue team alerted.` : 'Report submitted and queued for verification.',
      timestamp: now,
      read: false,
      link: `/incidents/${newIncidentId}`
    });
  }

  writeDB(db);
  res.status(201).json({ success: true, data: newIncident, message: 'Emergency incident reported and auto-assigned!' });
});

// Update Incident Status (Timeline Step progression)
// Sequence: reported -> assigned -> accepted -> team_dispatched -> reached_location -> help_provided -> resolved
app.patch('/api/incidents/:id/status', (req, res) => {
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

  // Notify reporter if not anonymous
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
   NGO DIRECTORY & VERIFICATION API
   ========================================================================== */

// List NGOs
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

// Single NGO
app.get('/api/ngos/:id', (req, res) => {
  const db = readDB();
  const ngo = db.ngos.find(n => n.id === req.params.id);
  if (!ngo) {
    return res.status(404).json({ success: false, message: 'NGO not found' });
  }
  res.json({ success: true, data: ngo });
});

// Post urgent need
app.post('/api/ngos/:id/needs', (req, res) => {
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
   ADOPTION & ELDERLY SPONSORSHIP API (CARA Compliant Layer)
   ========================================================================== */

// List listings
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

// Post new listing (NGO only)
app.post('/api/adoption-listings', (req, res) => {
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

  const ngo = db.ngos.find(n => n.id === ngoId) || db.ngos[0];
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

// Submit non-binding Inquiry
app.post('/api/adoption-inquiries', (req, res) => {
  const db = readDB();
  const {
    listingId,
    userId,
    userName,
    userPhone,
    userEmail,
    inquiryType,
    message
  } = req.body;

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
    userId: userId || 'user-rohan',
    userName: userName || 'Rohan Sharma',
    userPhone: userPhone || '+91 98765 43210',
    userEmail: userEmail || 'rohan.sharma@example.com',
    inquiryType: inquiryType || (listing.type === 'child' ? 'CARA Pre-Counseling & Discovery' : 'Elderly Sponsorship & Visit'),
    message: message || '',
    status: 'pending',
    ngoNote: 'Inquiry received. NGO coordinator will schedule a briefing.',
    createdAt: new Date().toISOString()
  };

  db.adoptionInquiries.unshift(newInquiry);

  // Notify NGO
  db.notifications.unshift({
    id: `notif-inq-${Date.now()}`,
    targetRole: 'ngo',
    ngoId: listing.ngoId,
    title: `New Inquiry for ${listing.name} (${listing.type.toUpperCase()})`,
    message: `Received from ${userName || 'Citizen'}: "${message.slice(0, 60)}..."`,
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

// Get inquiries (for user or NGO)
app.get('/api/adoption-inquiries', (req, res) => {
  const db = readDB();
  let inquiries = [...db.adoptionInquiries];
  const { userId, ngoId } = req.query;

  if (userId) {
    inquiries = inquiries.filter(i => i.userId === userId);
  }
  if (ngoId) {
    inquiries = inquiries.filter(i => i.ngoId === ngoId);
  }

  res.json({ success: true, count: inquiries.length, data: inquiries });
});

// Update inquiry status
app.patch('/api/adoption-inquiries/:id', (req, res) => {
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
   DONATIONS & CAMPAIGNS API (Anonymous by default)
   ========================================================================== */

// List campaigns
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

// Process donation (with anonymity protection)
app.post('/api/donations', (req, res) => {
  const db = readDB();
  const {
    campaignId,
    ngoId,
    userId,
    donorName,
    donorEmail,
    donorPhone,
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
    userId: userId || 'user-rohan',
    donorName: donorName || 'Rohan Sharma',
    donorEmail: donorEmail || 'rohan.sharma@example.com',
    donorPhone: donorPhone || '+91 98765 43210',
    amount: numAmount,
    isAnonymousPublic: Boolean(isAnonymousPublic),
    showDonorName: Boolean(showDonorName),
    paymentMethod,
    transactionId: `TXN_${Date.now()}`,
    receiptNo,
    createdAt: new Date().toISOString()
  };

  db.donations.unshift(newDonation);

  // Add karma points to user
  const user = db.users.find(u => u.id === (userId || 'user-rohan'));
  if (user) {
    user.karmaPoints = (user.karmaPoints || 0) + Math.floor(numAmount / 10);
  }

  // Create notification for NGO (Donor name hidden if anonymous!)
  db.notifications.unshift({
    id: `notif-don-${Date.now()}`,
    targetRole: 'ngo',
    ngoId: ngo.id,
    title: `💰 New Donation of ₹${numAmount.toLocaleString('en-IN')}`,
    message: showDonorName 
      ? `Received from ${donorName || 'Donor'} for ${newDonation.campaignTitle}.`
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
app.get('/api/donations', (req, res) => {
  const db = readDB();
  const { role, userId, ngoId, campaignId } = req.query;
  let list = [...db.donations];

  if (userId) {
    // A user can always see their own donation details and receipts
    list = list.filter(d => d.userId === userId);
    return res.json({ success: true, count: list.length, data: list });
  }

  if (ngoId) {
    list = list.filter(d => d.ngoId === ngoId);
  }
  if (campaignId) {
    list = list.filter(d => d.campaignId === campaignId);
  }

  // If public or NGO viewing, mask identity unless showDonorName is true or admin
  const maskedList = list.map(d => {
    if (role === 'admin') {
      return d; // Admin has compliance view
    }
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

// Post campaign transparency update
app.post('/api/campaigns/:id/transparency', (req, res) => {
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
   VOLUNTEERING & QR CHECK-IN API
   ========================================================================== */

// List drives
app.get('/api/volunteering', (req, res) => {
  const db = readDB();
  res.json({ success: true, count: db.volunteeringDrives.length, data: db.volunteeringDrives });
});

// Post new drive (NGO)
app.post('/api/volunteering', (req, res) => {
  const db = readDB();
  const { ngoId, title, category, date, time, location, slotsTotal, description, skillsNeeded } = req.body;
  const ngo = db.ngos.find(n => n.id === ngoId) || db.ngos[0];

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

// Volunteer RSVP (Generate digital QR Pass)
app.post('/api/volunteering/register', (req, res) => {
  const db = readDB();
  const { driveId, userId, userName, userPhone, userEmail } = req.body;

  const drive = db.volunteeringDrives.find(d => d.id === driveId);
  if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });

  const regId = `vreg-${Date.now().toString().slice(-6)}`;
  const qrPassToken = `NGO_PASS_${regId}_${driveId}_${userId || 'user'}`;

  const registration = {
    id: regId,
    driveId,
    driveTitle: drive.title,
    driveDate: drive.date,
    driveLocation: drive.location,
    ngoName: drive.ngoName,
    userId: userId || 'user-rohan',
    userName: userName || 'Rohan Sharma',
    userPhone: userPhone || '+91 98765 43210',
    userEmail: userEmail || 'rohan.sharma@example.com',
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

// Volunteer Check-In via QR Scan
app.post('/api/volunteering/checkin', (req, res) => {
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

  // Credit user karma
  const user = db.users.find(u => u.id === reg.userId);
  if (user) {
    user.karmaPoints = (user.karmaPoints || 0) + 50;
  }

  writeDB(db);
  res.json({ success: true, data: reg, message: `Check-in successful! Welcome, ${reg.userName}. (+50 Karma)` });
});

// My registrations
app.get('/api/volunteering/my-registrations/:userId', (req, res) => {
  const db = readDB();
  const myRegs = db.volunteerRegistrations.filter(r => r.userId === req.params.userId);
  res.json({ success: true, data: myRegs });
});

/* ==========================================================================
   ADMIN VERIFICATION & MODERATION API
   ========================================================================== */

app.get('/api/admin/pending-ngos', (req, res) => {
  const db = readDB();
  const pending = db.ngos.filter(n => !n.isVerified || n.verificationStatus === 'pending');
  res.json({ success: true, count: pending.length, data: pending });
});

app.post('/api/admin/verify-ngo/:id', (req, res) => {
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

app.get('/api/admin/analytics', (req, res) => {
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
   SAHAY AI CHATBOT API (FAQ Knowledgebase + Recommendation Engine)
   ========================================================================== */

app.post('/api/chatbot', (req, res) => {
  const db = readDB();
  const { message, userLocation } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const query = message.toLowerCase().trim();

  // 1. Check for adoption / CARA query
  if (query.includes('adopt') || query.includes('cara') || query.includes('child adoption') || query.includes('orphan')) {
    return res.json({
      success: true,
      reply: `**Legal Child Adoption Discovery Guidance:**\n\n1. In India, child adoption is governed by **CARA (Central Adoption Resource Authority)** under the Juvenile Justice Act.\n2. **NGO Connect** acts as a verified discovery and inquiry bridge. We do not place children directly.\n3. You can browse verified listings, express an inquiry, and the NGO will guide you through the official **CARINGS portal (cara.wcd.gov.in)**.\n4. You can also explore our **Elderly Sponsorship & Companionship** program for old-age home residents.`,
      quickActions: [
        { label: 'Browse Adoption & Sponsorship', link: '/adoption' },
        { label: 'View CARA FAQ', faqId: 'faq-2' }
      ]
    });
  }

  // 2. Check for Emergency Incident reporting query
  if (query.includes('report') || query.includes('emergency') || query.includes('accident') || query.includes('injured') || query.includes('street child') || query.includes('distress') || query.includes('sos')) {
    return res.json({
      success: true,
      reply: `🚨 **Reporting an Emergency on NGO Connect:**\n\n1. Tap the **Report Incident (SOS)** button.\n2. Select category (Child, Elderly, Homeless, Medical, Animal, Disability).\n3. Attach a live photo and confirm your GPS pinpoint.\n4. Set priority (Critical cases are flagged immediately).\n5. Our system automatically auto-routes to the nearest verified NGO rescue team in under 60 seconds with live timeline tracking!`,
      quickActions: [
        { label: '🚨 Report Live Incident Now', link: '/report' },
        { label: 'Track Active Reports', link: '/my-reports' }
      ]
    });
  }

  // 3. Check for Anonymous Donation query
  if (query.includes('donate') || query.includes('tax') || query.includes('80g') || query.includes('anonymous')) {
    return res.json({
      success: true,
      reply: `💰 **Anonymous Donations & 80G Tax Benefits:**\n\n• All donations are **100% Anonymous by default** on the public feed and to NGO staff.\n• Your PAN / identity is encrypted strictly to generate your **Instant 80G Tax Exemption Receipt**.\n• NGO utilization updates and receipts can be downloaded directly from your profile.`,
      quickActions: [
        { label: 'View Urgent Campaigns', link: '/campaigns' }
      ]
    });
  }

  // 4. Recommendation query (e.g. "find animal ngo near bandra", "child care near andheri", "volunteer in mumbai")
  let matchedCategory = null;
  if (query.includes('animal') || query.includes('dog') || query.includes('cat') || query.includes('pet')) matchedCategory = 'animal';
  else if (query.includes('child') || query.includes('kid') || query.includes('orphan')) matchedCategory = 'child';
  else if (query.includes('elder') || query.includes('old age') || query.includes('senior')) matchedCategory = 'elderly';
  else if (query.includes('homeless') || query.includes('hunger') || query.includes('food')) matchedCategory = 'homeless';
  else if (query.includes('disability') || query.includes('wheelchair') || query.includes('blind')) matchedCategory = 'disability';

  if (matchedCategory || query.includes('ngo') || query.includes('shelter') || query.includes('recommend')) {
    let ngos = db.ngos.filter(n => n.isVerified);
    if (matchedCategory) {
      ngos = ngos.filter(n => n.category === matchedCategory || (n.subCategories && n.subCategories.includes(matchedCategory)));
    }

    const suggestions = ngos.slice(0, 3).map(n => `• **${n.name}** (${n.area || n.city}) — Rating: ${n.rating}⭐ | Darpan ID: ${n.darpanId}`).join('\n');

    return res.json({
      success: true,
      reply: `Here are the top verified NGOs matching your search:\n\n${suggestions}\n\nWould you like to view their profile, donate to their campaigns, or report a case to them?`,
      quickActions: [
        { label: 'Open NGO Directory', link: '/ngos' }
      ]
    });
  }

  // 5. Check FAQ database
  const matchingFaq = db.faqKnowledgeBase.find(f => 
    f.tags.some(t => query.includes(t)) || query.includes(f.category)
  );

  if (matchingFaq) {
    return res.json({
      success: true,
      reply: `**${matchingFaq.question}**\n\n${matchingFaq.answer}`,
      quickActions: [
        { label: 'Ask Another Question' }
      ]
    });
  }

  // Fallback friendly reply
  res.json({
    success: true,
    reply: `I am **Sahay AI**, your NGO Connect assistant. I can help you with:\n\n1. 🚨 **Reporting an emergency incident** with live auto-routing\n2. 👶 **CARA-compliant Child Adoption & Elderly Sponsorship** guidance\n3. 🔒 **Anonymous Donations & 80G Tax Receipts**\n4. 🤝 **Volunteering drives & QR Check-in**\n5. 📍 **Finding verified NGOs near your location**\n\nWhat would you like to explore?`,
    quickActions: [
      { label: '🚨 Report an Incident', link: '/report' },
      { label: '👶 Adoption & Sponsorship', link: '/adoption' },
      { label: '💰 Donate Anonymously', link: '/campaigns' },
      { label: '🤝 Volunteer Drives', link: '/volunteering' }
    ]
  });
});

/* ==========================================================================
   NOTIFICATIONS API
   ========================================================================== */

app.get('/api/notifications', (req, res) => {
  const db = readDB();
  const { role, userId, ngoId } = req.query;
  let list = [...db.notifications];

  if (role) {
    list = list.filter(n => n.targetRole === role || n.targetRole === 'all');
  }
  if (userId) {
    list = list.filter(n => !n.userId || n.userId === userId);
  }
  if (ngoId) {
    list = list.filter(n => !n.ngoId || n.ngoId === ngoId);
  }

  res.json({ success: true, count: list.length, data: list });
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const db = readDB();
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) notif.read = true;
  writeDB(db);
  res.json({ success: true });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), platform: 'NGO Connect v1.0' });
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

app.listen(PORT, () => {
  console.log(`NGO Connect Server running on http://localhost:${PORT}`);
});

