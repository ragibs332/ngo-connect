import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Gift,
  ShieldCheck,
  EyeOff,
  Eye,
  CheckCircle,
  CreditCard,
  Smartphone,
  Lock,
  Receipt,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export const DonationModal = () => {
  const {
    selectedCampaignForDonation,
    setSelectedCampaignForDonation,
    currentUser,
    setActiveReceiptData,
    triggerRefresh,
    apiFetch
  } = useApp();

  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [showDonorName, setShowDonorName] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI (Simulation)');
  const [panNumber, setPanNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!selectedCampaignForDonation) return null;

  const campaign = selectedCampaignForDonation;
  const finalAmount = customAmount ? Number(customAmount) : selectedAmount;

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!finalAmount || finalAmount < 50) {
      alert('Minimum donation amount is ₹50');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await apiFetch('/api/donations', {
        method: 'POST',
        body: JSON.stringify({
          campaignId: campaign.id,
          ngoId: campaign.ngoId,
          amount: finalAmount,
          isAnonymousPublic: !showDonorName,
          showDonorName,
          paymentMethod
        })
      });
      const data = await res.json();

      if (data.success) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        setSelectedCampaignForDonation(null);
        triggerRefresh();
        // Automatically open the 80G receipt
        setActiveReceiptData(data.data);
      } else {
        alert(data.message || 'Donation failed.');
      }
    } catch (err) {
      console.error('Donation error:', err);
      alert('Network error while processing payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              💚
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Support Campaign with 80G Benefit</h3>
              <p className="text-xs text-emerald-100">100% Secure & Anonymous by Default</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedCampaignForDonation(null)}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleDonate} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Campaign Brief */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3">
            <img
              src={campaign.banner}
              alt={campaign.title}
              className="w-16 h-16 rounded-xl object-cover shrink-0"
            />
            <div className="text-xs space-y-0.5">
              <h4 className="font-bold text-slate-900 line-clamp-1">{campaign.title}</h4>
              <p className="text-slate-500 font-medium">{campaign.ngoName}</p>
              <div className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified 80G Tax-Deductible Campaign</span>
              </div>
            </div>
          </div>

          {/* Amount Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Select Donation Amount (₹ INR)
            </label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {PRESET_AMOUNTS.map((amt) => {
                const isSelected = !customAmount && amount === amt;
                return (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => {
                      setAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2.5 rounded-xl border text-center text-xs font-extrabold transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
              <input
                type="number"
                placeholder="Or enter custom amount in Rupees..."
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full text-xs pl-7 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
              />
            </div>
          </div>

          {/* CRITICAL: ANONYMOUS DONATION PRIVACY CONTROLS */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Donor Privacy Protection
                </span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                Strict Default
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your donation is <strong>Anonymous by default</strong>. The NGO coordinators and public feeds will only see the amount, date, and purpose. Your identity is strictly encrypted to generate your 80G tax receipt.
            </p>

            <div className="bg-slate-800/90 p-3 rounded-xl flex items-center justify-between border border-slate-700">
              <div className="text-xs">
                <div className="font-bold text-slate-100">Show my name publicly on feed</div>
                <div className="text-[11px] text-slate-400">Optional: Turn ON if you want public donor recognition</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDonorName}
                  onChange={(e) => setShowDonorName(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Payment Gateway (Instant 80G Simulation)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'UPI (Google Pay / PhonePe)', icon: Smartphone, label: 'Instant UPI / QR' },
                { id: 'Credit / Debit Card', icon: CreditCard, label: 'Debit / Credit Card' },
              ].map((m) => {
                const isSelected = paymentMethod === m.id;
                const Icon = m.icon;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-600" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary & Submit */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-bold">Total Contribution</div>
              <div className="text-lg font-extrabold text-slate-900">
                ₹{finalAmount.toLocaleString('en-IN')}
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Processing Payment...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Donate ₹{finalAmount.toLocaleString()} Securely</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
