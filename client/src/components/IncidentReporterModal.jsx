import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Camera,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Send,
  Sparkles,
  Upload,
  CheckCircle2,
  Navigation,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';

const EMERGENCY_CATEGORIES = [
  { id: 'child', label: 'Child in Distress', icon: '👶', desc: 'Homeless child, lost, begging, physical distress' },
  { id: 'elderly', label: 'Elderly Person Needing Help', icon: '👴', desc: 'Disoriented senior, abandoned, unattended medical care' },
  { id: 'homeless', label: 'Homeless Person', icon: '🏠', desc: 'Severe exposure to rain/cold, starvation, critical shelter need' },
  { id: 'medical', label: 'Medical Emergency', icon: '🏥', desc: 'Street trauma, urgent wound care, non-responsive citizen' },
  { id: 'animal', label: 'Animal in Distress', icon: '🐕', desc: 'Injured stray dog/cow/cat, accident trauma, severe illness' },
  { id: 'disability', label: 'Person with Disability', icon: '♿', desc: 'Stuck without mobility assistance, abandoned, needs support' },
  { id: 'other', label: 'Other Urgent Emergency', icon: '🔥', desc: 'Disaster relief, immediate food crisis, public safety' },
];

const PRESET_LOCATIONS = [
  { name: 'Andheri West (Near Metro Station)', lat: 19.1197, lng: 72.8464, city: 'Mumbai' },
  { name: 'Bandra West (Near Talao / SV Road)', lat: 19.0558, lng: 72.8362, city: 'Mumbai' },
  { name: 'Dadar Central (Station Flyover)', lat: 19.0178, lng: 72.8478, city: 'Mumbai' },
  { name: 'Thane West (Station East Exit)', lat: 19.1860, lng: 72.9759, city: 'Mumbai' },
  { name: 'Shivajinagar Bus Terminus', lat: 18.5308, lng: 73.8474, city: 'Pune' },
];

const SAMPLE_PHOTOS = {
  child: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=600&auto=format&fit=crop&q=80',
  elderly: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=600&auto=format&fit=crop&q=80',
  homeless: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&auto=format&fit=crop&q=80',
  medical: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
  animal: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80',
  disability: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&auto=format&fit=crop&q=80',
  other: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&auto=format&fit=crop&q=80'
};

export const IncidentReporterModal = () => {
  const {
    isReportModalOpen,
    setIsReportModalOpen,
    currentUser,
    triggerRefresh,
    setSelectedIncidentForTimeline,
    setActiveTab
  } = useApp();

  const [category, setCategory] = useState('child');
  const [priority, setPriority] = useState('critical');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState(PRESET_LOCATIONS[0].name);
  const [geo, setGeo] = useState({ lat: PRESET_LOCATIONS[0].lat, lng: PRESET_LOCATIONS[0].lng });
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_PHOTOS.child);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsSimulated, setGpsSimulated] = useState(true);

  if (!isReportModalOpen) return null;

  const handleCategorySelect = (catId) => {
    setCategory(catId);
    setPhotoUrl(SAMPLE_PHOTOS[catId] || SAMPLE_PHOTOS.other);
  };

  const handleLocationSelect = (loc) => {
    setAddress(loc.name);
    setGeo({ lat: loc.lat, lng: loc.lng });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please enter a brief description of the incident.');
      return;
    }

    setIsSubmitting(true);
    const selectedCategoryObj = EMERGENCY_CATEGORIES.find(c => c.id === category);

    const payload = {
      category,
      categoryLabel: selectedCategoryObj?.label || category,
      categoryIcon: selectedCategoryObj?.icon || '🚨',
      priority,
      description,
      photoUrl,
      geo,
      address,
      isAnonymous,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterPhone: currentUser.phone
    };

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setIsReportModalOpen(false);
        triggerRefresh();
        // Open the newly created incident timeline tracker directly
        setSelectedIncidentForTimeline(data.data);
        setActiveTab('incidents');
      } else {
        alert(data.message || 'Could not submit report');
      }
    } catch (err) {
      console.error('Error submitting incident:', err);
      alert('Network error while reporting incident.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shadow-inner animate-pulse">
              🚨
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">Smart Emergency Incident System</h3>
              <p className="text-xs text-red-100">Live GPS auto-routing to nearest verified rescue team</p>
            </div>
          </div>
          <button
            onClick={() => setIsReportModalOpen(false)}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              1. What happened? Select Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EMERGENCY_CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-red-500 bg-red-50/70 ring-2 ring-red-500/20 text-red-950 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className="text-xs">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Urgency / Priority Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              2. Priority Level <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'low', label: 'Low', desc: 'Routine shelter' },
                { id: 'medium', label: 'Medium', desc: 'Needs checkup' },
                { id: 'high', label: 'High', desc: 'Urgent attention' },
                { id: 'critical', label: 'Critical', desc: 'Immediate SOS' },
              ].map((p) => {
                const isSelected = priority === p.id;
                const colors = {
                  low: isSelected ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-600',
                  medium: isSelected ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600',
                  high: isSelected ? 'bg-amber-600 text-white border-amber-600' : 'border-slate-200 text-slate-600',
                  critical: isSelected ? 'bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-500/30' : 'border-slate-200 text-slate-600',
                };
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPriority(p.id)}
                    className={`py-2 px-2 rounded-xl border text-center text-xs font-bold uppercase transition-all ${colors[p.id]}`}
                  >
                    {p.id === 'critical' && <span className="mr-1 inline-block animate-ping">●</span>}
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              3. Description / What do you see? <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Unaccompanied 5yo child in torn clothes sitting outside Metro Pillar #42, seems distressed and shivering..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden leading-relaxed"
            />
          </div>

          {/* 4. Live GPS Location & Map Pin */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                4. Location (Auto-Captured GPS) <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Navigation className="w-3 h-3 animate-spin" /> High Precision GPS (±5m)
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs font-medium bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                <span className="text-slate-500 shrink-0">Quick presets:</span>
                {PRESET_LOCATIONS.map((loc, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleLocationSelect(loc)}
                    className="shrink-0 bg-white border border-slate-200 px-2 py-0.5 rounded-md hover:bg-slate-100 text-slate-700"
                  >
                    {loc.name.split('(')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Photo Attachment & Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              5. Incident Photo Evidence
            </label>
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <img
                src={photoUrl}
                alt="Incident preview"
                className="w-24 h-20 rounded-lg object-cover border border-slate-300 shadow-xs"
              />
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Geo-Tagged Visual Evidence</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Simulated live capture. Visual proof enables NGOs to prepare exact medical and relief gear.
                </p>
              </div>
            </div>
          </div>

          {/* 6. Anonymous Report Toggle */}
          <div className="bg-slate-100/80 p-3.5 rounded-xl flex items-center justify-between border border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                <EyeOff className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Submit as Anonymous Report</div>
                <p className="text-[11px] text-slate-500">Your phone number & name won't be shared with the NGO.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Auto-Routing AI Summary Box */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-3.5 rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950">
              <span className="font-bold">Instant Geo-Dispatch:</span> Upon submission, our Haversine engine will match the closest verified NGO in Mumbai matching <span className="font-bold uppercase">{category}</span>, notifying their 24/7 on-ground ambulance unit.
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-red-500/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Navigation className="w-4 h-4 animate-spin" />
                  <span>Routing to Nearest NGO...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Dispatch Live SOS Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
