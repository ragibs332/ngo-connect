import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Baby,
  Heart,
  ShieldCheck,
  Scale,
  Send,
  Sparkles,
  Info,
  Calendar,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdoptionModal = () => {
  const {
    selectedAdoptionForInquiry,
    setSelectedAdoptionForInquiry,
    currentUser,
    triggerRefresh,
    apiFetch
  } = useApp();

  const [message, setMessage] = useState('');
  const [inquiryType, setInquiryType] = useState('visit');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedAdoptionForInquiry) return null;
  const item = selectedAdoptionForInquiry;
  const isChild = item.type === 'child';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await apiFetch('/api/adoption-inquiries', {
        method: 'POST',
        body: JSON.stringify({
          listingId: item.id,
          inquiryType: isChild
            ? 'CARA Pre-Counseling & Official Discovery'
            : (inquiryType === 'visit' ? 'Weekend Companion Visit' : 'Monthly Healthcare Sponsorship'),
          message
        })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        alert(data.message);
        setSelectedAdoptionForInquiry(null);
        triggerRefresh();
      }
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      alert('Network error while submitting inquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between ${
          isChild ? 'bg-gradient-to-r from-blue-700 to-indigo-700' : 'bg-gradient-to-r from-amber-700 to-rose-700'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              {isChild ? '👶' : '👴'}
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                {isChild ? 'Child Adoption Discovery & Inquiry' : 'Elderly Sponsorship & Visits'}
              </h3>
              <p className="text-xs text-white/80">Connecting with {item.ngoName}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedAdoptionForInquiry(null)}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Profile Overview */}
          <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <img
              src={item.photo}
              alt={item.name}
              className="w-20 h-20 rounded-xl object-cover shadow-xs shrink-0"
            />
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900">{item.name}</span>
                <span className="bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full text-[11px]">
                  {item.age} • {item.gender}
                </span>
              </div>
              <p className="text-slate-600 font-medium">{item.backgroundNote}</p>
              <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified by {item.ngoName}</span>
              </div>
            </div>
          </div>

          {/* CRITICAL: CARA & JJ ACT COMPLIANCE NOTICE */}
          {isChild ? (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <Scale className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="uppercase tracking-wider">CARA & JJ Act Statutory Notice</span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                In India, all child adoptions are legally regulated by the <strong>Central Adoption Resource Authority (CARA)</strong> under the Juvenile Justice (Care and Protection of Children) Act 2015.
              </p>
              <p className="text-amber-800 leading-relaxed">
                <strong>NGO Connect is a non-binding discovery layer</strong>. This inquiry initiates authorized pre-counseling with the verified Specialised Adoption Agency (SAA), who will guide you to register officially on the government portal <code>cara.wcd.gov.in</code>.
              </p>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 space-y-2 text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-bold">
                <Heart className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Elderly Sponsorship & Companionship Guidelines</span>
              </div>
              <p className="text-emerald-800">
                You can support {item.name} through regular weekend visits, festive companionship, or by sponsoring essential geriatric medication (₹1,500 - ₹3,000 / month).
              </p>
            </div>
          )}

          {/* Inquiry Options for Elderly */}
          {!isChild && (
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Select Your Type of Engagement
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setInquiryType('sponsor')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    inquiryType === 'sponsor'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="font-bold">💊 Monthly Care Sponsor</div>
                  <div className="text-[11px] text-slate-500 mt-1">₹2,500/month for medicine & nutrition</div>
                </button>

                <button
                  type="button"
                  onClick={() => setInquiryType('visit')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    inquiryType === 'visit'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="font-bold">🤝 Weekend Companion</div>
                  <div className="text-[11px] text-slate-500 mt-1">Visit for conversations, chess & tea</div>
                </button>
              </div>
            </div>
          )}

          {/* Inquiry Message */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Your Inquiry & Family Background Note <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isChild
                  ? "Describe your family motivation, city of residence, and any existing CARINGS registration status..."
                  : "Share a little about yourself and when you'd like to visit or begin monthly support..."
              }
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden leading-relaxed"
            />
          </div>

          {/* Submitter Details */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between text-slate-600">
            <div>
              <span>Submitting as: <strong>{currentUser.name}</strong></span>
              <span className="ml-2 text-slate-400">({currentUser.phone})</span>
            </div>
            <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-semibold">
              Verified Citizen
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSelectedAdoptionForInquiry(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl shadow-lg transition-all disabled:opacity-50 ${
                isChild ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30'
              }`}
            >
              {isSubmitting ? (
                <span>Submitting Inquiry...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Formal Inquiry</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
