import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Printer, CheckCircle, ShieldCheck, HeartHandshake, Download } from 'lucide-react';

export const ReceiptModal = () => {
  const { activeReceiptData, setActiveReceiptData } = useApp();

  if (!activeReceiptData) return null;
  const d = activeReceiptData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-extrabold tracking-wide uppercase">Official 80G Tax Exemption Receipt</h3>
          </div>
          <button
            onClick={() => setActiveReceiptData(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 bg-white" id="printable-receipt">
          {/* Org & Govt Stamp */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-600" />
                <span className="font-extrabold text-base tracking-tight text-slate-900">NGO CONNECT INDIA</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Platform Beneficiary: {d.ngoName}</p>
            </div>
            <div className="text-right">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                80G Verified
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Receipt: {d.receiptNo}</p>
            </div>
          </div>

          {/* Success Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <div className="font-extrabold text-emerald-950">Contribution Recorded Successfully</div>
              <div className="text-emerald-800 font-medium">Eligible for 50% Tax Deduction under Section 80G of Income Tax Act.</div>
            </div>
          </div>

          {/* Receipt Details Table */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2.5">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Donor Name:</span>
              <span className="font-bold text-slate-900">{d.donorName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Public Display:</span>
              <span className="font-bold text-slate-900">
                {d.showDonorName ? 'Public Recognition' : 'Anonymous Citizen (Identity Protected)'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Campaign / Purpose:</span>
              <span className="font-bold text-slate-900 text-right max-w-[240px] truncate">{d.campaignTitle}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-bold text-slate-900">{d.paymentMethod}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Transaction Ref:</span>
              <span className="font-mono text-slate-700">{d.transactionId}</span>
            </div>
            <div className="flex justify-between py-1 pt-2 items-center">
              <span className="text-sm font-extrabold text-slate-900 uppercase">Donation Amount:</span>
              <span className="text-lg font-black text-emerald-700">₹{d.amount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center italic">
            This is a computer-generated tax receipt authorized by NGO Connect Digital Trust Network.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save Receipt PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveReceiptData(null)}
              className="w-full text-xs font-bold text-slate-600 hover:bg-slate-100 py-2.5 rounded-xl border border-slate-200"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
