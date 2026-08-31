import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Baby,
  Heart,
  Scale,
  ShieldCheck,
  Calendar,
  Send,
  Sparkles,
  Info,
  ExternalLink,
  Users,
  CheckCircle2
} from 'lucide-react';

export const AdoptionPage = () => {
  const { setSelectedAdoptionForInquiry, currentUser, refreshKey } = useApp();
  const [tab, setTab] = useState('child'); // 'child' | 'elderly' | 'my-inquiries'
  const [listings, setListings] = useState([]);
  const [myInquiries, setMyInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch listings
    fetch('/api/adoption-listings')
      .then(res => res.json())
      .then(data => {
        if (data.success) setListings(data.data);
        setLoading(false);
      });

    // Fetch user inquiries
    fetch(`/api/adoption-inquiries?userId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setMyInquiries(data.data);
      });
  }, [refreshKey, currentUser]);

  const filteredListings = listings.filter(l => l.type === tab);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
          <Baby className="w-3.5 h-3.5" /> Compassionate Discovery Network
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Adoption Discovery & Elderly Care Hub
        </h1>
        <p className="text-xs text-indigo-200 max-w-2xl leading-relaxed font-medium">
          Connecting prospective parents with verified Specialised Adoption Agencies (CARA compliant), and supporting senior citizens with monthly healthcare stipends and companion visits.
        </p>
      </div>

      {/* STATUTORY CARA LEGAL COMPLIANCE BANNER */}
      <div className="bg-amber-50 border-2 border-amber-300/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-200/60 text-amber-900 flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-950">
                Statutory Notice: CARA & Juvenile Justice Act Compliance
              </h3>
              <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-sm">
                GOVT OF INDIA
              </span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed max-w-3xl">
              Under Indian law, all child adoptions are administered exclusively by the <strong>Central Adoption Resource Authority (CARA)</strong>. <strong>NGO Connect operates strictly as a verified discovery and inquiry facilitation bridge</strong> to help citizens connect with licensed Specialised Adoption Agencies (SAAs). Direct placement is strictly prohibited.
            </p>
          </div>
        </div>

        <a
          href="http://cara.wcd.gov.in"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 bg-amber-900 hover:bg-amber-950 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
        >
          <span>Visit CARINGS Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab('child')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
            tab === 'child'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Baby className="w-4 h-4" />
          <span>Child Adoption Discovery (CARA)</span>
        </button>

        <button
          onClick={() => setTab('elderly')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
            tab === 'elderly'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Elderly Sponsorship & Visits</span>
        </button>

        <button
          onClick={() => setTab('my-inquiries')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
            tab === 'my-inquiries'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>My Inquiries ({myInquiries.length})</span>
        </button>
      </div>

      {/* Listings / Inquiries View */}
      {tab === 'my-inquiries' ? (
        <div className="space-y-3">
          {myInquiries.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <h3 className="text-sm font-bold text-slate-700">No Inquiries Submitted Yet</h3>
              <p className="text-xs text-slate-500 mt-1">Browse children or elderly profiles to express formal inquiry.</p>
            </div>
          ) : (
            myInquiries.map((inq) => (
              <div key={inq.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{inq.type === 'child' ? '👶' : '👴'}</span>
                    <h4 className="text-xs font-extrabold text-slate-900">Inquiry for {inq.personName}</h4>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded-md">
                      #{inq.id}
                    </span>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    inq.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {inq.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">"{inq.message}"</p>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>NGO: <strong>{inq.ngoName}</strong></span>
                  <span className="text-emerald-700 font-semibold">{inq.ngoNote}</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredListings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative h-56">
                <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-extrabold px-3 py-1 rounded-lg">
                  {item.age} • {item.gender}
                </div>
                <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs uppercase">
                  {item.status.replace('_', ' ')}
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-slate-900">{item.name}</h3>
                    <span className="text-[11px] font-bold text-slate-500">{item.healthStatus}</span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {item.backgroundNote}
                  </p>

                  {item.interests && (
                    <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong>Interests & Hobbies:</strong> {item.interests}
                    </div>
                  )}

                  {/* CARA Notice Pill */}
                  <div className="text-[11px] text-slate-500 bg-slate-100/80 p-2 rounded-xl flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                    <span>{item.caraNote}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    Facilitated by: <strong className="text-slate-800">{item.ngoName}</strong>
                  </div>

                  <button
                    onClick={() => setSelectedAdoptionForInquiry(item)}
                    className={`text-xs font-extrabold px-5 py-2.5 rounded-xl text-white transition-all shadow-md flex items-center gap-1.5 ${
                      item.type === 'child'
                        ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{item.type === 'child' ? 'Express CARA Inquiry' : 'Sponsor / Book Visit'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
