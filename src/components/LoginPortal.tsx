import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, User, Shield, HelpCircle, ArrowRight, Sparkles, MapPin } from 'lucide-react';

interface LoginPortalProps {
  onLogin: (name: string, email: string, role: 'citizen' | 'admin', city: string) => void;
}

export default function LoginPortal({ onLogin }: LoginPortalProps) {
  const [activeTab, setActiveTab] = useState<'citizen' | 'admin'>('citizen');
  
  // Custom Citizen Form State
  const [citizenName, setCitizenName] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [citizenCity, setCitizenCity] = useState('Bengaluru');

  // Predefined Municipal Admins list for easy sandbox login
  const ADMIN_PROFILES = [
    {
      name: 'Priya Sharma (Ward Officer)',
      email: 'priya.sharma@bbmp.gov.in',
      role: 'admin' as const,
      city: 'Bengaluru',
      designation: 'BBMP Ward Commissioner',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-150',
    },
    {
      name: 'Rohan Deshmukh (Inspector)',
      email: 'rohan.deshmukh@bmc.gov.in',
      role: 'admin' as const,
      city: 'Mumbai',
      designation: 'BMC Chief Sanitation Inspector',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-150',
    },
    {
      name: 'Amit Verma (PWD Engineer)',
      email: 'amit.verma@pmc.gov.in',
      role: 'admin' as const,
      city: 'Pune',
      designation: 'PMC PWD Senior Engineer',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-150',
    }
  ];

  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim() || !citizenEmail.trim()) return;
    onLogin(citizenName, citizenEmail, 'citizen', citizenCity);
  };

  const handleAdminLogin = (profile: typeof ADMIN_PROFILES[number]) => {
    onLogin(profile.name, profile.email, 'admin', profile.city);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-200 selection:text-blue-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex w-14 h-14 rounded-2xl bg-blue-700 items-center justify-center font-black text-white shadow-md font-display text-2xl tracking-tighter mx-auto border-2 border-white"
        >
          CC
        </motion.div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 font-display">
            Nagarik Seva Portal
          </h2>
          <p className="mt-1.5 text-xs text-slate-550 max-w-sm mx-auto font-medium">
            India's Collaborative Crowdsourced Civic Network for Smart Ward Monitoring and Local Resolution
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white py-8 px-4 shadow-xl rounded-3xl border border-slate-150 sm:px-10 space-y-6"
        >
          {/* Custom Multi-tabs selector */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('citizen')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'citizen'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-150'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4 text-blue-700" />
              Citizen Login (Nagarik)
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-150'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield className="w-4 h-4 text-blue-700" />
              Municipal Officer Login
            </button>
          </div>

          {activeTab === 'citizen' ? (
            <form onSubmit={handleCitizenSubmit} className="space-y-4">
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-blue-800 font-display">Join the Clean Ward Initiative</h4>
                  <p className="text-[11px] text-blue-650 leading-normal">
                    Report potholes, waste dumps, or power hazards. Earn community civic points & build your prestige tier!
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="name" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    required
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                    placeholder="e.g. Prabhansh Shrivastava"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={citizenEmail}
                  onChange={(e) => setCitizenEmail(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  placeholder="e.g. prabhansh0125@gmail.com"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="city" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-600" />
                  Your City / Zone
                </label>
                <select
                  id="city"
                  value={citizenCity}
                  onChange={(e) => setCitizenCity(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition cursor-pointer"
                >
                  <option value="Bengaluru">Bengaluru (BBMP Ward)</option>
                  <option value="Mumbai">Mumbai (BMC Zone)</option>
                  <option value="New Delhi">New Delhi (NDMC Zone)</option>
                  <option value="Pune">Pune (PMC Ward)</option>
                  <option value="Hyderabad">Hyderabad (GHMC Ward)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Enter Civic Network
                <ArrowRight className="w-4 h-4 text-blue-200" />
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-indigo-800 font-display">Administrative Officer Dashboard</h4>
                  <p className="text-[11px] text-indigo-650 leading-normal">
                    Sign in as a verified ward officer or engineer to dispatch crews, resolve reports, and write official responses.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Select Administrative Profile
                </label>

                <div className="space-y-2">
                  {ADMIN_PROFILES.map((profile) => (
                    <div
                      key={profile.email}
                      onClick={() => handleAdminLogin(profile)}
                      className="p-3 bg-slate-50 hover:bg-slate-100/90 border border-slate-150 rounded-2xl flex items-center justify-between gap-3 transition cursor-pointer group hover:border-slate-300"
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition">
                          {profile.name}
                        </h4>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${profile.badgeColor}`}>
                            📍 {profile.city}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {profile.designation}
                          </span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-2xs shrink-0 group-hover:bg-blue-700 transition">
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400 max-w-md mx-auto space-y-1">
        <p>© 2026 National Civic Technology Network. All rights reserved.</p>
        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" /> For administrative assist or ward credentials setup, reach out to helpdesk@gov.in
        </p>
      </div>
    </div>
  );
}
