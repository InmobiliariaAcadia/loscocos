import React, { useState, useMemo } from 'react';
import { Guest, AgeGroup, Classification } from '../types';
import { Search, UserPlus, ArrowRight, Check, X, Users, Trash2, Edit2, ArrowLeft, Save, Palmtree, Filter, XCircle, Download } from 'lucide-react';

interface GuestManagerProps {
  guests: Guest[];
  onUpdateGuest: (guest: Guest) => void;
  onAddGuest: () => void;
  onEditGuest: (guest: Guest) => void;
  onDeleteGuest: (guestId: string) => void;
  onProceed: () => void;
  onBack: () => void;
  onSave: () => void;
}

export const GuestManager: React.FC<GuestManagerProps> = ({
  guests,
  onUpdateGuest,
  onAddGuest,
  onEditGuest,
  onDeleteGuest,
  onProceed,
  onBack,
  onSave
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'invited' | 'not-invited'>('all');
  
  const [showFilters, setShowFilters] = useState(false);
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [classificationFilter, setClassificationFilter] = useState<'all' | Classification>('all');
  const [ageFilter, setAgeFilter] = useState<'all' | AgeGroup>('all');

  const uniqueGroups = useMemo(() => {
    const groups = new Set(guests.map(g => g.group).filter(Boolean));
    return Array.from(groups).sort();
  }, [guests]);

  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          g.group.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    if (filter === 'invited' && !g.isInvited) return false;
    if (filter === 'not-invited' && g.isInvited) return false;

    if (groupFilter !== 'all' && g.group !== groupFilter) return false;
    if (classificationFilter !== 'all' && g.classification !== classificationFilter) return false;
    if (ageFilter !== 'all' && g.ageGroup !== ageFilter) return false;

    return true;
  });

  const clearAdvancedFilters = () => {
    setGroupFilter('all');
    setClassificationFilter('all');
    setAgeFilter('all');
  };

  const hasActiveAdvancedFilters = groupFilter !== 'all' || classificationFilter !== 'all' || ageFilter !== 'all';

  const toggleInvited = (e: React.MouseEvent, guest: Guest) => {
    e.stopPropagation();
    onUpdateGuest({ ...guest, isInvited: !guest.isInvited });
  };

  const handleExportCSV = () => {
    const headers = ['Full Name', 'Seating Name', 'Group (Invited By)', 'Classification', 'Invited?', 'Gender', 'Age Group', 'Is Couple', 'Partner Name', 'Seat Together', 'Tags'];
    const csvRows = filteredGuests.map(g => {
      const partner = guests.find(p => p.id === g.partnerId);
      const safe = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
      return [
        safe(g.name),
        safe(g.seatingName || ''),
        safe(g.group),
        safe(g.classification),
        g.isInvited ? 'Yes' : 'No',
        safe(g.gender),
        safe(g.ageGroup),
        g.isCouple ? 'Yes' : 'No',
        safe(partner ? partner.name : ''),
        g.isCouple ? (g.seatTogether ? 'Yes' : 'No') : '',
        safe(g.tags.join(', '))
      ].join(',');
    });
    const csvContent = '\uFEFF' + [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Registro_Invitados_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const invitedCount = guests.filter(g => g.isInvited).length;

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      
      {/* Ribbon Superior Fijo */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 z-40 shrink-0 sticky top-0 pt-safe shadow-sm">
        
        {/* Cabecera Principal */}
        <div className="px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2.5 -ml-2 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-xl active:scale-90 transition-all">
                <ArrowLeft size={22} strokeWidth={2.5} />
              </button>
              <div className="flex items-center gap-3">
                <div className="hidden md:block bg-rose-50 p-2 rounded-2xl ring-1 ring-primary/20">
                    <Palmtree size={24} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Registro</h1>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Base de Datos</p>
                    </div>
                </div>
              </div>
            </div>

            {/* Acciones Ribbon (Escritorio) */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={handleExportCSV} 
                className="text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 border border-slate-200"
              >
                  <Download size={18} /> Exportar
              </button>
              
              <button onClick={onSave} className="text-primary hover:bg-rose-50 px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95">
                  <Save size={18} /> Guardar
              </button>
              
              <div className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black flex items-center gap-2 shadow-lg">
                  <Users size={18} /> <span>{invitedCount} Invitados</span>
              </div>
              
              <button onClick={onProceed} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  Mesas <ArrowRight size={18} />
              </button>
            </div>

            {/* Acciones Ribbon (Móvil) */}
            <div className="md:hidden flex items-center gap-2">
                <div className="bg-slate-900 text-white px-3 py-1.5 rounded-full text-[10px] font-black tracking-tighter shadow-md border border-slate-800 flex items-center gap-1.5">
                    <Users size={14} strokeWidth={3} /> {invitedCount}
                </div>
                <button onClick={onSave} className="p-3 text-primary bg-rose-50 rounded-2xl active:scale-90 shadow-sm ring-1 ring-primary/10">
                    <Save size={20} strokeWidth={2.5} />
                </button>
            </div>
        </div>

        {/* Toolbar de Filtros y Búsqueda */}
        <div className="px-4 md:px-8 pb-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={2.5} />
              <input 
                type="text" 
                placeholder="Buscar por nombre o grupo..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-100 md:bg-white border-2 border-transparent md:border-slate-200 rounded-2xl focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none text-base font-medium transition-all"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
               <button 
                  onClick={() => setShowFilters(!showFilters)} 
                  className={`px-4 py-3 rounded-2xl border-2 flex items-center gap-2 text-sm font-black transition-all shrink-0 active:scale-95 ${hasActiveAdvancedFilters || showFilters ? 'bg-primary/10 border-primary/30 text-primary shadow-sm' : 'bg-slate-100 border-transparent text-slate-600'}`}
                >
                  <Filter size={20} strokeWidth={2.5} /> <span>Filtros</span>
                  {hasActiveAdvancedFilters && <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(238,108,77,0.5)]"></span>}
               </button>

               <div className="flex bg-slate-100 md:bg-white rounded-2xl p-1.5 border-2 border-transparent md:border-slate-200 shrink-0 shadow-sm">
                <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filter === 'all' ? 'bg-white md:bg-slate-100 shadow-sm text-slate-900' : 'text-slate-400'}`}>Todos</button>
                <button onClick={() => setFilter('invited')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filter === 'invited' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400'}`}>Sí</button>
                <button onClick={() => setFilter('not-invited')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filter === 'not-invited' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400'}`}>No</button>
              </div>
              
              <button onClick={onAddGuest} className="ml-auto flex items-center gap-2 bg-slate-900 text-white font-black px-5 py-3 rounded-2xl text-sm whitespace-nowrap shrink-0 active:scale-95 shadow-xl transition-all border border-slate-700">
                <UserPlus size={18} strokeWidth={2.5} /> <span className="hidden md:inline">Registrar Nuevo</span><span className="md:hidden">Añadir</span>
              </button>
            </div>
          </div>

          {/* Panel de Filtros Avanzados Ribbon */}
          {showFilters && (
            <div className="animate-in fade-in slide-in-from-top-4 pt-4 border-t-2 border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Grupo (Invitado Por)</label>
                    <select 
                        className="bg-white border-2 border-slate-200 text-slate-700 text-sm font-bold rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary/30 block w-full p-3 transition-all outline-none appearance-none"
                        value={groupFilter}
                        onChange={(e) => setGroupFilter(e.target.value)}
                    >
                        <option value="all">Cualquier Grupo</option>
                        {uniqueGroups.map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Clasificación</label>
                    <select 
                        className="bg-white border-2 border-slate-200 text-slate-700 text-sm font-bold rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary/30 block w-full p-3 transition-all outline-none appearance-none"
                        value={classificationFilter}
                        onChange={(e) => setClassificationFilter(e.target.value as any)}
                    >
                        <option value="all">Todas</option>
                        <option value="A">A - Imprescindibles</option>
                        <option value="B">B - Ocasionales</option>
                        <option value="C">C - Recientes</option>
                        <option value="D">D - Primera vez</option>
                    </select>
                  </div>

                  <div className="relative">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Rango de Edad</label>
                    <select 
                        className="bg-white border-2 border-slate-200 text-slate-700 text-sm font-bold rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary/30 block w-full p-3 transition-all outline-none appearance-none"
                        value={ageFilter}
                        onChange={(e) => setAgeFilter(e.target.value as any)}
                    >
                        <option value="all">Cualquier edad</option>
                        <option value="Adult">Adulto</option>
                        <option value="Child">Niño</option>
                        <option value="Teen">Adolescente</option>
                        <option value="Senior">Senior</option>
                    </select>
                    {hasActiveAdvancedFilters && (
                      <button onClick={clearAdvancedFilters} className="absolute -bottom-6 right-0 text-[10px] font-black text-rose-500 flex items-center gap-1 hover:underline p-1">
                        <XCircle size={10} /> LIMPIAR FILTROS
                      </button>
                    )}
                  </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido Scrolleable con Padding Inferior para Ribbon Fijo */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 pt-4 scroll-smooth">
        
        {/* Vista Móvil: Tarjetas más grandes */}
        <div className="md:hidden space-y-4">
          {filteredGuests.map(guest => (
             <div 
               key={guest.id}
               onClick={() => onEditGuest(guest)}
               className={`bg-white rounded-3xl p-5 shadow-sm border-2 transition-all flex items-center gap-4 active:scale-95 ${guest.isInvited ? 'border-primary/10 ring-1 ring-primary/5 shadow-primary/5' : 'border-slate-100 opacity-60 grayscale-[0.3]'}`}
             >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 shadow-sm ${guest.isInvited ? 'bg-primary/10 text-primary border border-primary/10' : 'bg-slate-100 text-slate-400'}`}>
                  {guest.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-900 text-lg truncate tracking-tight">{guest.name}</h3>
                      {guest.isCouple && <span className="text-red-500 animate-pulse">♥</span>}
                   </div>
                   <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2 mt-1 uppercase tracking-widest">
                      <span className="bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">{guest.group}</span>
                      <span>Clase {guest.classification}</span>
                   </div>
                </div>
                <div onClick={(e) => toggleInvited(e, guest)} className={`h-9 w-16 rounded-full p-1.5 transition-all flex items-center cursor-pointer shadow-inner ${guest.isInvited ? 'bg-emerald-500 ring-4 ring-emerald-500/10' : 'bg-slate-200'}`}>
                    <div className={`bg-white w-6 h-6 rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center ${guest.isInvited ? 'translate-x-7 rotate-0' : 'translate-x-0 rotate-180'}`}>
                      {guest.isInvited ? <Check size={14} strokeWidth={4} className="text-emerald-500" /> : <X size={14} strokeWidth={4} className="text-slate-300" />}
                    </div>
                </div>
             </div>
          ))}
          {filteredGuests.length === 0 && (
            <div className="text-center py-20 animate-in fade-in zoom-in">
              <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-300">
                <Users size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold tracking-tight">No se encontraron invitados.</p>
            </div>
          )}
        </div>

        {/* Desktop Table: Ribbon-like columns */}
        <div className="hidden md:block bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden mb-12">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b-2 border-slate-100 text-[10px] uppercase text-slate-400 font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Nombre Invitado</th>
                <th className="px-8 py-5">Grupo / Anfitrión</th>
                <th className="px-8 py-5">Frecuencia</th>
                <th className="px-8 py-5 text-center">Invitado</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {filteredGuests.map(guest => (
                <tr key={guest.id} className={`hover:bg-slate-50/50 transition-all group ${guest.isInvited ? '' : 'opacity-40'}`}>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-transform group-hover:scale-110 ${guest.isInvited ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-200 text-slate-500'}`}>{guest.name.charAt(0)}</div>
                      <div>
                        <div className="font-black text-slate-800 tracking-tight">{guest.name}</div>
                        {guest.isCouple && <div className="text-[10px] font-black text-rose-500 uppercase tracking-tighter">Pareja vinculada</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-tighter border border-slate-200">{guest.group}</span>
                  </td>
                  <td className="px-8 py-4 font-black text-slate-500 text-xs">Clase {guest.classification}</td>
                  <td className="px-8 py-4 text-center">
                    <button onClick={(e) => toggleInvited(e, guest)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all shadow-inner border-2 ${guest.isInvited ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-300 border-slate-200'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all ${guest.isInvited ? 'translate-x-6' : 'translate-x-1.5'}`} />
                    </button>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => onEditGuest(guest)} className="p-2 text-slate-300 hover:text-primary transition-colors"><Edit2 size={18} /></button>
                      <button onClick={() => onDeleteGuest(guest.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={20} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ribbon Móvil Inferior (Floating) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t-2 border-slate-100 p-5 z-40 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.1)]">
        <button 
          onClick={onProceed} 
          className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4.5 rounded-[2rem] font-black text-lg shadow-2xl shadow-slate-900/30 hover:scale-[1.02] active:scale-95 transition-all"
        >
          Continuar a Mesas <ArrowRight size={22} strokeWidth={3} />
        </button>
      </div>

    </div>
  );
};