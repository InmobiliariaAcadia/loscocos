
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { PastEvent, Guest } from '../types';
import { TableZone } from './TableZone';
import { 
  ArrowLeft, 
  Calendar, 
  Share2, 
  Users, 
  Armchair, 
  List, 
  LayoutGrid, 
  Search,
  CheckCircle,
  Clock,
  Edit3,
  Download
} from 'lucide-react';
// @ts-ignore
import html2canvas from 'html2canvas';

interface EventViewerProps {
  event: PastEvent;
  onBack: () => void;
  onUpdateEvent: (event: PastEvent) => void;
}

type Tab = 'dashboard' | 'seating' | 'guests';

export const EventViewer: React.FC<EventViewerProps> = ({ event, onBack, onUpdateEvent }) => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [localEventName, setLocalEventName] = useState(event.name);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalEventName(event.name);
  }, [event]);

  useEffect(() => {
      if (isEditingTitle && titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }, [isEditingTitle]);

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    if (localEventName.trim() && localEventName !== event.name) {
        onUpdateEvent({ ...event, name: localEventName, updatedAt: new Date().toISOString() });
    } else {
        setLocalEventName(event.name);
    }
  };

  const guestsByTable = useMemo(() => {
    const map: Record<string, Guest[]> = {};
    event.tables.forEach(t => map[t.id] = []);
    const invitedGuests = event.guests.filter(g => g.isInvited);
    invitedGuests.forEach(g => {
      if (g.assignedTableId && map[g.assignedTableId]) {
        map[g.assignedTableId].push(g);
      }
    });
    return map;
  }, [event]);

  const invitedGuests = useMemo(() => event.guests.filter(g => g.isInvited), [event.guests]);
  const seatedCount = invitedGuests.filter(g => g.assignedTableId).length;
  const tableCount = event.tables.length;
  
  // Fix: Safe utilization calculation to avoid Infinity or NaN
  const totalCapacity = event.tables.reduce((acc, t) => acc + t.capacity, 0);
  const utilization = totalCapacity > 0 ? Math.round((seatedCount / totalCapacity) * 100) : 0;

  const handleDownloadTable = async (tableId: string, tableName: string) => {
      const element = document.getElementById(`table-zone-${tableId}`);
      if (!element) return;
      try {
        const canvas = await html2canvas(element, { 
          scale: 2, 
          backgroundColor: '#ffffff', 
          useCORS: true, 
          ignoreElements: (el: Element) => el.hasAttribute('data-html2canvas-ignore') 
        });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = image;
        const safeName = tableName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const safeEvent = localEventName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${safeEvent}_${safeName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) { console.error("Download failed", err); }
    };

    const handleDownloadAll = async () => {
        // If we're not on the seating tab, switch to it first so elements are in DOM
        if (activeTab !== 'seating') {
          setActiveTab('seating');
          // Wait for render
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        setIsDownloading(true);
        try {
          for (const table of event.tables) {
            await handleDownloadTable(table.id, table.name);
            await new Promise(resolve => setTimeout(resolve, 600)); // slightly more delay for reliability
          }
        } finally { setIsDownloading(false); }
    };

  const renderDashboard = () => (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="text-center mb-10 pt-4">
         <div className="inline-block bg-white px-4 py-1.5 rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 shadow-sm">
           Resumen de Evento
         </div>
         <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tighter leading-none">{localEventName}</h2>
         <div className="flex items-center justify-center gap-4 text-slate-500 font-bold bg-slate-100/50 w-fit mx-auto px-6 py-2 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
            <Calendar size={18} className="text-primary" /> 
            <span className="text-sm">
              {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
         </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
         <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col items-center group transition-all hover:scale-105 active:scale-95">
            <div className="bg-primary/10 p-4 rounded-2xl mb-3 group-hover:bg-primary group-hover:text-white transition-all">
               <Users size={28} className="transition-colors" />
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">{invitedGuests.length}</div>
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1">Invitados</div>
         </div>
         <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col items-center group transition-all hover:scale-105 active:scale-95">
            <div className="bg-slate-900 p-4 rounded-2xl mb-3 group-hover:bg-primary group-hover:text-white transition-all text-white">
               <LayoutGrid size={28} className="transition-colors" />
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">{tableCount}</div>
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1">Mesas</div>
         </div>
         <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col items-center group transition-all hover:scale-105 active:scale-95">
            <div className="bg-emerald-100 p-4 rounded-2xl mb-3 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
               <CheckCircle size={28} />
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">{seatedCount}</div>
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1">Sentados</div>
         </div>
         <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col items-center group transition-all hover:scale-105 active:scale-95">
            <div className="bg-orange-100 p-4 rounded-2xl mb-3 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all">
               <Armchair size={28} />
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">{utilization}%</div>
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1">Capacidad</div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <button 
           onClick={() => setActiveTab('seating')}
           className="group relative bg-white border-2 border-slate-100 hover:border-primary/40 p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all text-left overflow-hidden active:scale-95"
         >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <LayoutGrid size={160} className="text-primary" />
            </div>
            <div className="relative z-10">
               <div className="bg-primary text-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:rotate-6 transition-all ring-4 ring-primary/20">
                  <Armchair size={28} strokeWidth={2.5} />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Plano de Mesas</h3>
               <p className="text-slate-500 text-sm font-medium leading-relaxed">Visualiza la distribución física de todos los invitados y mesas.</p>
            </div>
         </button>

         <button 
           onClick={() => setActiveTab('guests')}
           className="group relative bg-white border-2 border-slate-100 hover:border-slate-900/20 p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all text-left overflow-hidden active:scale-95"
         >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <List size={160} className="text-slate-900" />
            </div>
            <div className="relative z-10">
               <div className="bg-slate-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:rotate-6 transition-all ring-4 ring-slate-900/20">
                  <List size={28} strokeWidth={2.5} />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Lista Detallada</h3>
               <p className="text-slate-500 text-sm font-medium leading-relaxed">Listado completo de invitados con su mesa y detalles específicos.</p>
            </div>
         </button>
      </div>
      
      {/* Quick Actions Footer for Dashboard */}
      <div className="mt-12 flex flex-col items-center">
         <button 
            onClick={handleDownloadAll}
            disabled={isDownloading}
            className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-2xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
         >
            <Download size={20} /> {isDownloading ? 'Generando Archivos...' : 'Descargar Todas las Mesas'}
         </button>
      </div>
    </div>
  );

  const renderGuestList = () => {
    const filtered = invitedGuests.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.group.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto w-full h-full flex flex-col pb-32">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
                <div>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Invitados</h2>
                   <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{filtered.length} Registrados para este evento</p>
                   </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} strokeWidth={2.5} />
                    <input 
                       type="text" 
                       placeholder="Buscar invitados..." 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="pl-12 pr-4 py-4 border-2 border-slate-100 bg-white rounded-2xl focus:border-primary/30 focus:ring-4 focus:ring-primary/10 outline-none w-full md:w-80 shadow-sm font-medium transition-all"
                    />
                </div>
            </div>

            <div className="bg-white border-2 border-slate-100 rounded-[2rem] shadow-2xl overflow-hidden flex-1 flex flex-col">
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/80 backdrop-blur-md border-b-2 border-slate-100 text-[10px] uppercase text-slate-400 font-black tracking-[0.2em] sticky top-0 z-10">
                            <tr>
                                <th className="px-8 py-5">Invitado</th>
                                <th className="px-8 py-5">Grupo</th>
                                <th className="px-8 py-5">Mesa Asignada</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-50">
                            {filtered.map(guest => {
                                const table = event.tables.find(t => t.id === guest.assignedTableId);
                                return (
                                    <tr key={guest.id} className="hover:bg-slate-50 transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-black text-slate-500 group-hover:bg-primary group-hover:text-white transition-all">
                                                    {guest.name.charAt(0)}
                                                </div>
                                                <div className="font-black text-slate-800 tracking-tight">{guest.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-black text-slate-400 uppercase tracking-tighter">{guest.group}</td>
                                        <td className="px-8 py-5">
                                            {table ? (
                                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm">
                                                    <Armchair size={14} strokeWidth={3} /> {table.name}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Sin Asignar</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
  };

  const renderSeatingChart = () => (
    <div className="flex-1 overflow-auto p-4 md:p-8 h-full pb-32 scroll-smooth">
        <div className="flex justify-between items-center mb-8 pt-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Plano de Mesas</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Disposición Visual</p>
            </div>
            <button 
                onClick={handleDownloadAll} 
                disabled={isDownloading}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
                <Share2 size={18} strokeWidth={2.5} /> {isDownloading ? 'Guardando...' : 'Exportar Fotos'}
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pb-20">
            {event.tables.map(table => (
                <div key={table.id} className="animate-in fade-in slide-in-from-bottom-6 duration-500">
                    <TableZone 
                        table={table}
                        assignedGuests={guestsByTable[table.id] || []}
                        onDrop={() => {}} 
                        onDragStart={() => {}} 
                        onRemoveGuest={() => {}} 
                        onDeleteTable={() => {}} 
                        onEdit={() => {}} 
                        onDownload={handleDownloadTable} 
                        onGuestClick={() => {}} 
                    />
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Ribbon Superior Visor */}
      <header className="bg-white/80 backdrop-blur-2xl border-b-2 border-slate-100 px-4 py-4 flex items-center justify-between shrink-0 z-40 shadow-sm pt-safe">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button onClick={() => activeTab === 'dashboard' ? onBack() : setActiveTab('dashboard')} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-500 transition-all active:scale-90">
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
          
          <div className="flex-1 min-w-0">
             {isEditingTitle ? (
                <input 
                  ref={titleInputRef}
                  value={localEventName}
                  onChange={(e) => setLocalEventName(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                  className="font-black text-xl text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-1 w-full max-w-[240px] focus:border-primary outline-none"
                />
              ) : (
                <div 
                  onClick={() => setIsEditingTitle(true)}
                  className="font-black text-xl text-slate-900 flex items-center gap-2 cursor-pointer hover:bg-slate-50 px-3 py-1 rounded-xl transition-all truncate max-w-[240px]"
                >
                  <span className="truncate">{localEventName}</span> <Edit3 size={16} className="text-slate-300 shrink-0" />
                </div>
              )}
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3">
               <span className={`px-2 py-0.5 rounded-lg border ${event.status === 'past' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                 {event.status === 'past' ? 'Archivado' : 'Activo'}
               </span>
               <span className="hidden sm:inline opacity-30">/</span>
               <span className="hidden sm:inline">{activeTab === 'dashboard' ? 'Overview' : activeTab === 'seating' ? 'Plano' : 'Lista'}</span>
            </div>
          </div>
        </div>
        
        {/* Ribbon Tabs Desktop */}
        <div className="hidden md:flex bg-slate-100 p-1.5 rounded-2xl shrink-0 border border-slate-200">
           <button onClick={() => setActiveTab('dashboard')} className={`px-5 py-2 text-xs font-black rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Resumen</button>
           <button onClick={() => setActiveTab('seating')} className={`px-5 py-2 text-xs font-black rounded-xl transition-all ${activeTab === 'seating' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Distribución</button>
           <button onClick={() => setActiveTab('guests')} className={`px-5 py-2 text-xs font-black rounded-xl transition-all ${activeTab === 'guests' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Invitados</button>
        </div>
      </header>

      {/* Area Central Scrolleable */}
      <div className="flex-1 overflow-hidden relative">
         {activeTab === 'dashboard' && renderDashboard()}
         {activeTab === 'guests' && renderGuestList()}
         {activeTab === 'seating' && renderSeatingChart()}
      </div>

      {/* Ribbon Navegación Inferior Móvil */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-3xl border-t-2 border-slate-100 flex justify-around p-3 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
         <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center px-6 py-2 rounded-2xl transition-all active:scale-90 ${activeTab === 'dashboard' ? 'text-primary bg-primary/5' : 'text-slate-400'}`}>
            <LayoutGrid size={24} strokeWidth={activeTab === 'dashboard' ? 3 : 2} />
            <span className="text-[10px] font-black mt-1.5 uppercase tracking-tighter">Inicio</span>
         </button>
         <button onClick={() => setActiveTab('seating')} className={`flex flex-col items-center px-6 py-2 rounded-2xl transition-all active:scale-90 ${activeTab === 'seating' ? 'text-primary bg-primary/5' : 'text-slate-400'}`}>
            <Armchair size={24} strokeWidth={activeTab === 'seating' ? 3 : 2} />
            <span className="text-[10px] font-black mt-1.5 uppercase tracking-tighter">Mesas</span>
         </button>
         <button onClick={() => setActiveTab('guests')} className={`flex flex-col items-center px-6 py-2 rounded-2xl transition-all active:scale-90 ${activeTab === 'guests' ? 'text-primary bg-primary/5' : 'text-slate-400'}`}>
            <List size={24} strokeWidth={activeTab === 'guests' ? 3 : 2} />
            <span className="text-[10px] font-black mt-1.5 uppercase tracking-tighter">Pax</span>
         </button>
      </div>
    </div>
  );
};
