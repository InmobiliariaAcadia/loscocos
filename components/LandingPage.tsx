import React, { useState, useRef, useEffect } from 'react';
import { Table, Guest, PastEvent } from '../types';
// Added missing 'Users' import from lucide-react
import { Calendar, Table as TableIcon, ArrowRight, Clock, CalendarDays, PlusCircle, Upload, Palmtree, RefreshCw, Lock, Copy, Trash2, RotateCcw, Edit2, Users } from 'lucide-react';
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
  tables, 
  guests,
  eventDate,
  setEventDate,
  pastEvents = [],
  onImport,
  onDeleteEvent,
  onRestoreEvent,
  onEditEvent
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
    <div className="relative w-full h-full bg-slate-900 overflow-y-auto overflow-x-hidden scroll-smooth">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1501139083538-0139583c61df?q=80&w=2070&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-slate-900/40"></div>
      </div>

      {/* Ribbon de Estado Mejorado para Móvil */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 shadow-2xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
        <div className={`w-2.5 h-2.5 rounded-full ${hasKey ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]'}`} />
        <span className="text-[11px] font-bold text-white uppercase tracking-widest">
           {hasKey ? 'IA: Sistema Listo' : 'IA: Falta API Key'}
        </span>
      </div>

      <div className="relative z-10 min-h-[100dvh] flex flex-col items-center p-4 py-12 md:p-8 gap-8">
        
        <div className="text-center text-white mb-4 animate-in fade-in slide-in-from-top-4 duration-700 flex flex-col items-center">
          <div className="inline-flex items-center justify-center p-5 bg-primary/30 rounded-full mb-6 shadow-2xl ring-2 ring-primary/50 backdrop-blur-md">
            <Palmtree className="text-rose-100" size={56} strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-2 drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-rose-200">
            Los Cocos
          </h1>
          <p className="text-rose-100/80 text-lg md:text-2xl font-light tracking-[0.2em] uppercase">
            Gestión de Eventos
          </p>
        </div>

        <div className="w-full max-w-lg space-y-10 pb-24">
          
          {/* Ribbon Superior de Acción: Nuevo Evento */}
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 ring-1 ring-white/5">
            <div className="bg-gradient-to-r from-primary/80 to-orange-500/80 p-5 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-3">
                 <div className="bg-white/20 p-2 rounded-xl">
                   <PlusCircle className="text-white" size={24} />
                 </div>
                 <h2 className="text-white font-black text-xl tracking-tight">Nuevo Evento</h2>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-black uppercase tracking-wider bg-white/20 hover:bg-white/40 text-white px-3 py-2 rounded-full transition-all border border-white/20 active:scale-90"
              >
                <Upload size={14} className="inline mr-1 mb-0.5" /> Importar
              </button>
              <input 
                 type="file" 
                 accept=".json,.xlsx,.xls,.csv" 
                 ref={fileInputRef} 
                 className="hidden" 
                 onChange={onImport}
              />
            </div>

            <div className="p-8 space-y-6 bg-white/95">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  <Calendar size={14} className="text-primary" /> Fecha de Inicio
                </label>
                <input 
                  type="date" 
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-100 border-2 border-transparent focus:border-primary/20 rounded-2xl text-xl font-black text-slate-800 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  <Copy size={14} className="text-primary" /> Usar Plantilla
                </label>
                <div className="relative">
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-100 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-primary/10 outline-none appearance-none"
                  >
                    <option value="">Ninguna (Desde cero)</option>
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
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ArrowRight size={16} className="rotate-90" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-800">{registeredCount}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Registrados</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center">
                   <span className="text-2xl font-black text-slate-800">
                     {selectedTemplateId 
                        ? (pastEvents.find(e => e.id === selectedTemplateId)?.tables.length || 0)
                        : Math.ceil(registeredCount / 10)}
                   </span>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                     Mesas Est.
                   </span>
                </div>
              </div>

              <button 
                onClick={() => onStart(1, selectedTemplateId || undefined)}
                className="w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-br from-primary to-orange-600 text-white text-xl font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {selectedTemplateId ? 'Duplicar y Planear' : 'Comenzar Plan'} <ArrowRight size={22} />
              </button>
            </div>
          </div>

          {/* Ribbon: Próximos Eventos */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-xl">
             <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/20">
                <h3 className="text-white font-black flex items-center gap-2 tracking-tight">
                   <CalendarDays size={20} className="text-primary" /> Próximos Eventos
                </h3>
                <span className="bg-primary/20 text-primary-foreground text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ring-1 ring-primary/30">{upcomingEvents.length}</span>
             </div>
             
             {upcomingEvents.length > 0 ? (
               <div className="p-4 space-y-4">
                  {upcomingEvents.map(evt => (
                    <div key={evt.id} className="bg-white/95 rounded-2xl p-5 flex flex-col gap-4 shadow-xl border border-white">
                        <div className="flex justify-between items-start">
                           <div className="max-w-[70%]">
                              <div className="font-black text-slate-900 text-xl leading-tight truncate">
                                {evt.name}
                              </div>
                              <div className="text-slate-400 text-xs font-bold mt-1 flex items-center gap-1.5">
                                 <Clock size={12} className="text-primary" /> {new Date(evt.date).toLocaleDateString()}
                              </div>
                           </div>
                           <div className="flex items-center gap-2 shrink-0">
                              {onDeleteEvent && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onDeleteEvent(evt.id); }}
                                  className="text-slate-300 hover:text-rose-500 p-2.5 rounded-xl hover:bg-rose-50 transition-all active:scale-90"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                              <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-[10px] font-black tracking-tighter border border-emerald-200">ACTIVO</div>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 p-3 rounded-xl border border-slate-100">
                           <div className="flex items-center gap-1.5"><TableIcon size={14} className="text-primary"/> {evt.tables.length} Mesas</div>
                           {/* Fixed: Added Users icon usage which was previously missing its import */}
                           <div className="flex items-center gap-1.5"><Users size={14} className="text-primary"/> {evt.guests.filter(g => g.isInvited).length} Pax</div>
                        </div>

                        <button 
                          onClick={() => onViewEvent(evt)}
                          className="w-full py-4 font-black rounded-xl bg-slate-900 text-white hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg"
                        >
                          {evt.accessLevel === 'viewer' ? 'Ver Evento' : 'Abrir y Editar'} <RefreshCw size={18} />
                        </button>
                    </div>
                  ))}
               </div>
             ) : (
               <div className="p-10 text-center">
                  <p className="text-rose-100/40 text-sm italic font-medium tracking-wide">No hay eventos pendientes</p>
               </div>
             )}
          </div>

          {/* Ribbon: Historial */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-xl">
             <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/20">
                <h3 className="text-white/80 font-black flex items-center gap-2 text-sm uppercase tracking-widest">
                   <Clock size={18} /> Historial
                </h3>
             </div>
             <div className="divide-y divide-white/5">
                {historyEvents.length === 0 ? (
                  <div className="p-10 text-center">
                     <p className="text-rose-100/30 text-xs italic">Vacío</p>
                  </div>
                ) : (
                  historyEvents.map(evt => (
                    <div 
                        key={evt.id} 
                        className="p-5 hover:bg-white/5 transition-colors flex items-center justify-between group cursor-pointer"
                        onClick={() => onViewEvent(evt)}
                    >
                       <div className="min-w-0 flex-1">
                          <div className="text-white font-black text-base truncate pr-4">{evt.name}</div>
                          <div className="text-rose-200/50 text-[10px] font-bold mt-0.5 tracking-wider uppercase">{new Date(evt.date).toLocaleDateString()}</div>
                       </div>
                       <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                             <div className="text-white font-black text-xs">{evt.guests.length} Pax</div>
                             <div className="text-rose-200/40 text-[9px] font-bold tracking-tighter uppercase">{evt.tables.length} Mesas</div>
                          </div>
                          <ArrowRight size={18} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>

          {/* Ribbon: Basurero */}
          {deletedEvents.length > 0 && (
            <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-lg opacity-70">
               <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-white/60 font-black flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
                     <Trash2 size={14} /> Papelera
                  </h3>
               </div>
               <div className="divide-y divide-white/5">
                  {deletedEvents.map(evt => (
                    <div key={evt.id} className="p-4 flex items-center justify-between">
                       <div className="min-w-0 flex-1">
                          <div className="text-white/50 font-bold text-xs truncate line-through">{evt.name}</div>
                       </div>
                       {onRestoreEvent && (
                         <button 
                           onClick={() => onRestoreEvent(evt.id)}
                           className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all active:scale-90"
                         >
                           <RotateCcw size={10} /> Restaurar
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
  );
};