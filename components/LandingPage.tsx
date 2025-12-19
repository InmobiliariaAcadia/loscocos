
import React, { useState, useRef, useEffect } from 'react';
import { Table, Guest, PastEvent } from '../types';
import { 
  Calendar, 
  Table as TableIcon, 
  ArrowRight, 
  Clock, 
  CalendarDays, 
  PlusCircle, 
  Upload, 
  Palmtree, 
  RefreshCw, 
  Copy, 
  Trash2, 
  RotateCcw, 
  Users 
} from 'lucide-react';
import { isConfigured } from '../services/geminiService';

interface LandingPageProps {
  onStart: (initialTableCount: number, templateEventId?: string) => void;
  onViewEvent: (event: PastEvent) => void;
  tables: Table[];
  guests: Guest[];
  eventDate: string;
  setEventDate: (date: string) => void;
  pastEvents?: PastEvent[];
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteEvent?: (eventId: string) => void;
  onRestoreEvent?: (eventId: string) => void;
  onEditEvent?: (event: PastEvent) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onStart, 
  onViewEvent,
  guests,
  eventDate,
  setEventDate,
  pastEvents = [],
  onImport,
  onDeleteEvent,
  onRestoreEvent
}) => {
  const registeredCount = guests.length;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasKey, setHasKey] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  useEffect(() => {
    setHasKey(isConfigured());
  }, []);

  const upcomingEvents = pastEvents.filter(e => e.status === 'upcoming' && !e.deletedAt);
  const historyEvents = pastEvents.filter(e => e.status === 'past' && !e.deletedAt);
  const deletedEvents = pastEvents.filter(e => e.deletedAt);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-y-auto overflow-x-hidden scroll-smooth">
      {/* Fresher, Cooler Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/60"></div>
      </div>

      {/* Floating Status Indicator */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white/10 backdrop-blur-2xl px-4 py-2 rounded-full border border-white/10 shadow-2xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
        <div className={`w-2 h-2 rounded-full ${hasKey ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`} />
        <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-90">
           {hasKey ? 'IA READY' : 'IA OFFLINE'}
        </span>
      </div>

      <div className="relative z-10 min-h-[100dvh] flex flex-col items-center p-4 py-16 md:p-8 gap-10">
        
        <div className="text-center text-white mb-2 animate-in fade-in slide-in-from-top-4 duration-1000 flex flex-col items-center">
          <div className="inline-flex items-center justify-center p-6 bg-white/5 rounded-full mb-8 shadow-2xl ring-1 ring-white/20 backdrop-blur-xl group">
            <Palmtree className="text-primary transition-transform group-hover:rotate-12" size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-3 drop-shadow-2xl text-white">
            Los Cocos
          </h1>
          <p className="text-primary text-sm md:text-lg font-black tracking-[0.4em] uppercase opacity-90">
            Intelligent Seating
          </p>
        </div>

        <div className="w-full max-w-xl space-y-12 pb-32">
          
          {/* Main Action Card */}
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-700">
            <div className="bg-white/5 p-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                 <div className="bg-primary/20 p-2.5 rounded-2xl">
                   <PlusCircle className="text-primary" size={20} />
                 </div>
                 <h2 className="text-white font-bold text-lg tracking-tight">Nuevo Evento</h2>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all border border-white/5 active:scale-90"
              >
                <Upload size={14} className="inline mr-1.5" /> Importar
              </button>
              <input 
                 type="file" 
                 accept=".json,.xlsx,.xls,.csv" 
                 ref={fileInputRef} 
                 className="hidden" 
                 onChange={onImport}
              />
            </div>

            <div className="p-8 space-y-8 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Calendar size={12} className="text-primary" /> Fecha
                  </label>
                  <input 
                    type="date" 
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base font-bold text-slate-800 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Copy size={12} className="text-primary" /> Plantilla
                  </label>
                  <div className="relative">
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-600 focus:ring-4 focus:ring-primary/5 outline-none appearance-none"
                    >
                      <option value="">Ninguna</option>
                      {upcomingEvents.length > 0 && <optgroup label="Próximos">
                        {upcomingEvents.map(evt => (
                          <option key={evt.id} value={evt.id}>{evt.name}</option>
                        ))}
                      </optgroup>}
                      {historyEvents.length > 0 && <optgroup label="Pasados">
                        {historyEvents.map(evt => (
                          <option key={evt.id} value={evt.id}>{evt.name}</option>
                        ))}
                      </optgroup>}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invitados Totales</span>
                  <span className="text-2xl font-black text-slate-900">{registeredCount}</span>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mesas Sugeridas</span>
                  <span className="text-2xl font-black text-slate-900">
                    {selectedTemplateId 
                        ? (pastEvents.find(e => e.id === selectedTemplateId)?.tables.length || 0)
                        : Math.ceil(registeredCount / 10)}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => onStart(1, selectedTemplateId || undefined)}
                className="w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-primary to-rose-500 text-white text-lg font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {selectedTemplateId ? 'Duplicar y Planear' : 'Crear Evento'} <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Active Events Section */}
          {upcomingEvents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-white font-black text-sm uppercase tracking-[0.3em] flex items-center gap-3 px-2">
                <CalendarDays size={16} className="text-primary" /> Próximos
              </h3>
              <div className="grid gap-4">
                {upcomingEvents.map(evt => (
                  <div 
                    key={evt.id} 
                    onClick={() => onViewEvent(evt)}
                    className="group bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 transition-all cursor-pointer flex items-center justify-between shadow-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-white font-bold text-lg truncate group-hover:text-primary transition-colors">{evt.name}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1">
                          <Clock size={12} /> {new Date(evt.date).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                          <Users size={12} /> {evt.guests.filter(g => g.isInvited).length} Pax
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {onDeleteEvent && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteEvent(evt.id); }}
                          className="p-3 text-white/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      <div className="bg-white/10 p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Smaller History / Trash Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                <Clock size={14} /> Pasados
              </h4>
              <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/5 divide-y divide-white/5">
                {historyEvents.length === 0 ? (
                  <div className="p-8 text-center text-white/20 text-[10px] uppercase font-black tracking-widest">Sin historial</div>
                ) : (
                  historyEvents.slice(0, 3).map(evt => (
                    <div 
                      key={evt.id} 
                      onClick={() => onViewEvent(evt)}
                      className="p-4 hover:bg-white/5 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <span className="text-white/60 font-bold text-xs truncate max-w-[120px]">{evt.name}</span>
                      <ArrowRight size={14} className="text-white/20" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {deletedEvents.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                  <Trash2 size={14} /> Papelera
                </h4>
                <div className="bg-black/20 backdrop-blur-md rounded-3xl border border-white/5 divide-y divide-white/5">
                  {deletedEvents.slice(0, 3).map(evt => (
                    <div key={evt.id} className="p-4 flex items-center justify-between">
                      <span className="text-white/30 font-bold text-xs truncate line-through max-w-[100px]">{evt.name}</span>
                      {onRestoreEvent && (
                        <button onClick={() => onRestoreEvent(evt.id)} className="text-emerald-500 hover:text-emerald-400">
                          <RotateCcw size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
