# NGO Connect — Community Emergency Relief & Social Impact Platform

An end-to-end community relief, emergency response, and verified social impact platform connecting citizens, verified NGOs/orphanages, and platform administrators.

---

## 🌟 Flagship & Core Modules

### 1. 🚨 Smart Emergency Incident System (Flagship Feature)
- **7 Emergency Categories**:
  - 👶 Child in Distress (homeless child, lost, begging, distress)
  - 👴 Elderly Person Needing Help (disoriented, abandoned, unattended medical care)
  - 🏠 Homeless Person (severe exposure, hunger, shelter need)
  - 🏥 Medical Emergency (street trauma, urgent wound care)
  - 🐕 Animal in Distress (injured stray, hit-and-run, distress)
  - ♿ Person with Disability (mobility support, abandoned)
  - 🔥 Other Emergency (relief, disaster, food crisis)
- **Priority Ranking**: `Low` $\rightarrow$ `Medium` $\rightarrow$ `High` $\rightarrow$ `Critical` (Critical cases pulse with urgent alert priority).
- **Haversine Geo-Dispatch Engine**: Automatically calculates distance and routes to the closest verified NGO in the area in $< 60$ seconds.
- **7-Stage Live Timeline Tracking**:
  $$\text{Reported} \longrightarrow \text{NGO Assigned} \longrightarrow \text{NGO Accepted} \longrightarrow \text{Team Dispatched} \longrightarrow \text{Reached Location} \longrightarrow \text{Help Provided} \longrightarrow \text{Resolved}$$
- **Anonymous Reporting**: Citizens can report incidents without exposing personal info to NGOs.

---

### 2. 👶 Adoption Discovery & Elderly Care Hub
- **CARA & Juvenile Justice Act Statutory Compliance**:
  - Direct placement of children is legally governed by the **Central Adoption Resource Authority (CARA)**.
  - NGO Connect functions as a **verified discovery and inquiry bridge** connecting prospective parents to authorized Specialised Adoption Agencies (SAAs) and the government **CARINGS** portal (`cara.wcd.gov.in`).
- **Elderly Sponsorship & Companionship**:
  - Monthly geriatric healthcare & medicine stipends (₹1,500 - ₹3,000/mo).
  - Weekend companion visits & cultural storytelling sessions.

---

### 3. 🔒 Anonymous-by-Default Donations & 80G Receipts
- **Privacy by Default**: Donor personal identity is encrypted and hidden from NGO staff and public feeds.
- **Optional Recognition**: Donors can toggle *"Show my name publicly"*.
- **Instant 80G Tax Exemption Receipts**: Printable and downloadable PDF receipts with official statutory stamps.
- **Transparency Logs**: NGOs publish invoice and photo proofs of fund utilization.

---

### 4. 🤝 Volunteering & Digital QR Attendance
- Discover weekend drives (Street food drives, animal shelter grooming, senior citizen music evenings).
- **1-Tap RSVP** with instant **Digital QR Attendance Pass**.
- **NGO QR Scanner**: Organizers scan volunteer passes to instantly verify presence and award **Community Karma Credits**.

---

### 5. 🤖 Sahay AI Chatbot Assistant
- Floating 24/7 AI assistant accessible anywhere in the app.
- Dual Mode:
  1. **Knowledgebase Q&A**: Answers CARA legal questions, 80G tax rules, and SOS steps.
  2. **Intelligent NGO Recommendation**: Matches user location and cause to verified shelters.

---

### 6. 🛡️ Admin Governance & Verification
- NGO Verification Queue for inspecting Darpan IDs, 12A/80G certificates, and FCRA clearances.
- Incident audit and moderation.
- Platform analytics (Response time, total donations, resolution rate).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18 or newer
- **npm**: v9 or newer

### Installation & Run

1. **Install and start the Backend Server**:
   ```bash
   cd server
   npm install
   npm start
   ```
   *Runs on `http://localhost:5000`*

2. **Install and start the Frontend Client**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:3000`*

3. **Or double-click `start.bat` on Windows** to launch both automatically!

---

## 🎭 1-Click Interactive Role Switcher
In the app header, use the quick role switcher to test all roles:
- 👤 **Public User (Rohan Sharma)**
- 🏢 **NGO Coordinator (Priya Deshmukh @ Hope Horizon)**
- 🛡️ **Platform Admin (Ananya Roy)**
