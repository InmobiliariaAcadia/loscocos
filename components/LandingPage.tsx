
import React, { useState, useRef } from 'react';
import { Table, Guest, PastEvent } from '../types';
import { Calendar, Table as TableIcon, ArrowRight, Clock, CalendarDays, PlusCircle, Save, Palmtree, RefreshCw, Upload, Download, Lock } from 'lucide-react';

interface LandingPageProps {
  onStart: (initialTableCount: number) => void;
  onViewEvent: (event: PastEvent) => void;
  tables: Table[];
  guests: Guest[];
  eventDate: string;
  setEventDate: (date: string) => void;
  pastEvents?: PastEvent[];
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onStart, 
  onViewEvent,
  tables, 
  guests,
  eventDate,
  setEventDate,
  pastEvents = [],
  onImport
}) => {
  const registeredCount = guests.length;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Separate events
  const upcomingEvents = pastEvents.filter(e => e.status === 'upcoming');
  const historyEvents = pastEvents.filter(e => e.status === 'past');

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-y-auto overflow-x-hidden scroll-smooth">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1501139083538-0139583c61df?q=80&w=2070&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-slate-900/40"></div>
      </div>

      <div className="relative z-10 min-h-[100dvh] flex flex-col items-center p-4 py-12 md:p-8 gap-8">
        
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

        <div className="w-full max-w-lg space-y-8 pb-12">
          
          {/* NEW EVENT & IMPORT */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
            <div className="bg-gradient-to-r from-primary to-orange-400 p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <PlusCircle className="text-white" size={20} />
                 <h2 className="text-white font-bold text-lg">New Event</h2>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors"
              >
                <Upload size={12} /> Import File
              </button>
              <input 
                 type="file" 
                 accept=".json" 
                 ref={fileInputRef} 
                 className="hidden" 
                 onChange={onImport}
              />
            </div>

            <div className="p-6 md:p-8 space-y-6 bg-white/95">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide">
                  <Calendar size={16} className="text-primary" /> Start Date
                </label>
                <input 
                  type="date" 
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-medium text-slate-800 focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold text-slate-800">{registeredCount}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1">Guest DB</span>
                </div>
                <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                   <span className="text-xl font-bold text-slate-800">{Math.ceil(registeredCount / 10)}</span>
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1">Est. Tables</span>
                </div>
              </div>

              <button 
                onClick={() => onStart(1)}
                className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-primary to-rose-400 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Start Planning <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* UPCOMING EVENTS */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-lg">
             <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2">
                   <CalendarDays size={18} /> Future Events
                </h3>
                <span className="bg-white/10 text-white text-xs px-2 py-0.5 rounded-full">{upcomingEvents.length} Upcoming</span>
             </div>
             
             {upcomingEvents.length > 0 ? (
               <div className="p-4 space-y-3">
                  {upcomingEvents.map(evt => (
                    <div key={evt.id} className="bg-white/95 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
                        <div className="flex justify-between items-start">
                           <div>
                              <div className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                {evt.name}
                                {evt.accessLevel === 'viewer' && <Lock size={14} className="text-slate-400" />}
                              </div>
                              <div className="text-slate-500 text-sm flex items-center gap-1">
                                 <Clock size={12} /> {new Date(evt.date).toLocaleDateString()}
                              </div>
                           </div>
                           <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">PLANNED</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 my-1">
                           <div className="flex items-center gap-2"><TableIcon size={14}/> {evt.tables.length} Tables</div>
                        </div>

                        <button 
                          onClick={() => onViewEvent(evt)}
                          className={`w-full py-2.5 font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${evt.accessLevel === 'viewer' ? 'bg-slate-200 text-slate-600' : 'bg-secondary text-white'}`}
                        >
                          {evt.accessLevel === 'viewer' ? 'View Only' : 'Open & Edit'} <RefreshCw size={16} />
                        </button>
                    </div>
                  ))}
               </div>
             ) : (
               <div className="p-8 text-center">
                  <p className="text-rose-100/60 text-sm italic">No upcoming events scheduled.</p>
               </div>
             )}
          </div>

          {/* PAST EVENTS */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-lg">
             <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2">
                   <Clock size={18} /> Past Events
                </h3>
                <span className="bg-white/10 text-white text-xs px-2 py-0.5 rounded-full">{historyEvents.length} Archived</span>
             </div>
             <div className="divide-y divide-white/10">
                {historyEvents.length === 0 ? (
                  <div className="p-8 text-center">
                     <p className="text-rose-100/60 text-sm italic">No past events found.</p>
                  </div>
                ) : (
                  historyEvents.map(evt => (
                    <div 
                        key={evt.id} 
                        onClick={() => onViewEvent(evt)}
                        className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                       <div>
                          <div className="text-white font-bold text-sm">{evt.name}</div>
                          <div className="text-rose-200/60 text-xs mt-0.5">{new Date(evt.date).toLocaleDateString()}</div>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="text-right">
                             <div className="text-white font-bold text-xs">{evt.guests.length} Guests</div>
                             <div className="text-rose-200/60 text-[10px]">{evt.tables.length} Tables</div>
                          </div>
                          <ArrowRight size={16} className="text-white/30 group-hover:text-white transition-colors" />
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
