import React, { useState } from 'react';
import { Table, Guest, PastEvent } from '../types';
import { Calendar, Users, LayoutGrid, ArrowRight, Table as TableIcon, Sparkles, Clock, CalendarDays, PlusCircle, Save, Palmtree } from 'lucide-react';

interface LandingPageProps {
  onStart: (initialTableCount: number) => void;
  onResume?: () => void;
  savedDraft?: any;
  tables: Table[];
  guests: Guest[];
  eventDate: string;
  setEventDate: (date: string) => void;
  pastEvents?: PastEvent[];
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onStart, 
  onResume,
  savedDraft,
  tables, 
  guests,
  eventDate,
  setEventDate,
  pastEvents = []
}) => {
  const registeredCount = guests.length;
  const [tableCount, setTableCount] = useState(1);

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-y-auto overflow-x-hidden scroll-smooth">
      {/* Background Image - Fixed position */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1501139083538-0139583c61df?q=80&w=2070&auto=format&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-slate-900/40"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 min-h-[100dvh] flex flex-col items-center p-4 py-12 md:p-8 gap-8">
        
        {/* Header Section */}
        <div className="text-center text-white mb-4 animate-in fade-in slide-in-from-top-4 duration-700 flex flex-col items-center">
          <div className="inline-flex items-center justify-center p-4 bg-primary/20 rounded-full mb-4 shadow-xl ring-1 ring-primary/50 backdrop-blur-md">
            <Palmtree className="text-rose-100" size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-2 drop-shadow-xl text-transparent bg-clip-text bg-gradient-to-b from-white to-rose-100">
            Los Cocos
          </h1>
          <p className="text-rose-100/90 text-lg md:text-xl font-medium tracking-wide">
            Asignación de mesas
          </p>
        </div>

        {/* Content Grid */}
        <div className="w-full max-w-lg space-y-8 pb-12">

          {/* SECTION 0: RESUME DRAFT (If exists) */}
          {savedDraft && onResume && (
            <div className="bg-gradient-to-r from-secondary/90 to-slate-800/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
               <div className="p-6 md:p-8 flex flex-col items-center text-center text-white">
                  <div className="bg-white/20 p-3 rounded-full mb-3">
                    <Save size={24} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-1">Continue Planning</h2>
                  <p className="text-white/80 text-sm mb-6">
                    Resume event from {new Date(savedDraft.updatedAt).toLocaleDateString()} at {new Date(savedDraft.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  
                  <button 
                    onClick={onResume}
                    className="w-full py-3 bg-white text-secondary font-bold rounded-xl shadow-lg hover:bg-slate-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    Resume Draft <ArrowRight size={18} />
                  </button>
               </div>
            </div>
          )}
          
          {/* SECTION 1: NEW EVENT */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
            <div className="bg-gradient-to-r from-primary to-orange-400 p-4 border-b border-white/10 flex items-center gap-2">
              <PlusCircle className="text-white" size={20} />
              <h2 className="text-white font-bold text-lg">New Event</h2>
            </div>

            <div className="p-6 md:p-8 space-y-6 bg-white/95">
              
              {/* Date Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide">
                  <Calendar size={16} className="text-primary" />
                  Event Date
                </label>
                <input 
                  type="date" 
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-medium text-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none shadow-sm transition-all appearance-none"
                />
              </div>

              {/* Table Count Input */}
              <div className="space-y-2">
                 <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide">
                   <TableIcon size={16} className="text-secondary" />
                   Initial Tables
                 </label>
                 <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        value={tableCount}
                        onChange={(e) => setTableCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-medium text-slate-800 focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none shadow-sm text-center"
                      />
                    </div>
                    <div className="text-xs text-slate-400 font-medium w-24 leading-tight">
                      Default: Round (12 seats)
                    </div>
                 </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold text-primary">{tables.length > 0 ? tables.length : tableCount}</span>
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide mt-1">Active Tables</span>
                </div>
                <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold text-slate-800">{registeredCount}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1">Guest DB</span>
                </div>
              </div>

              {/* CTA Button */}
              <button 
                onClick={() => onStart(tableCount)}
                className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-primary to-rose-400 text-white text-lg font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mt-2"
              >
                Plan Event
                <ArrowRight size={20} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* SECTION 2: FUTURE EVENTS (Placeholder) */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-lg">
             <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2">
                   <CalendarDays size={18} /> Future Events
                </h3>
                <span className="bg-white/10 text-white text-xs px-2 py-0.5 rounded-full">0 Upcoming</span>
             </div>
             <div className="p-8 text-center">
                <p className="text-rose-100/60 text-sm italic">No upcoming events scheduled.</p>
             </div>
          </div>

          {/* SECTION 3: PAST EVENTS */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-lg">
             <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2">
                   <Clock size={18} /> Past Events
                </h3>
                <span className="bg-white/10 text-white text-xs px-2 py-0.5 rounded-full">{pastEvents.length} Archived</span>
             </div>
             <div className="divide-y divide-white/10">
                {pastEvents.length === 0 ? (
                  <div className="p-8 text-center">
                     <p className="text-rose-100/60 text-sm italic">No past events found.</p>
                  </div>
                ) : (
                  pastEvents.map(evt => (
                    <div key={evt.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group cursor-pointer">
                       <div>
                          <div className="text-white font-bold text-sm">{evt.name}</div>
                          <div className="text-rose-200/60 text-xs mt-0.5">{new Date(evt.date).toLocaleDateString()}</div>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="text-right">
                             <div className="text-white font-bold text-xs">{evt.guests.length} Guests</div>
                             <div className="text-rose-200/60 text-[10px]">{evt.assignments.length} Seated</div>
                          </div>
                          <ArrowRight size={16} className="text-white/30 group-hover:text-white transition-colors" />
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
          
          {/* Footer Decoration */}
          <div className="text-center">
             <p className="text-xs text-white/30 font-medium flex items-center justify-center gap-1">
               <Palmtree size={12} /> Designed for Los Cocos
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};