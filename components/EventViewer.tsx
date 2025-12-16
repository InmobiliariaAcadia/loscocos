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
  Edit3
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

  // Reconstruct the mapping of guests to tables based on the saved snapshot
  const guestsByTable = useMemo(() => {
    const map: Record<string, Guest[]> = {};
    event.tables.forEach(t => map[t.id] = []);
    
    // We filter only invited guests for this event
    const invitedGuests = event.guests.filter(g => g.isInvited);
    
    invitedGuests.forEach(g => {
      if (g.assignedTableId && map[g.assignedTableId]) {
        map[g.assignedTableId].push(g);
      }
    });
    return map;
  }, [event]);

  // Derived Stats
  const invitedGuests = useMemo(() => event.guests.filter(g => g.isInvited), [event.guests]);
  const seatedCount = invitedGuests.filter(g => g.assignedTableId).length;
  const tableCount = event.tables.length;
  const utilization = tableCount > 0 ? Math.round((seatedCount / (event.tables.reduce((acc, t) => acc + t.capacity, 0))) * 100) : 0;

  const handleDownloadTable = async (tableId: string, tableName: string) => {
      const element = document.getElementById(`table-zone-${tableId}`);
      if (!element) return;
      
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          ignoreElements: (element: Element) => element.hasAttribute('data-html2canvas-ignore')
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
      } catch (err) {
        console.error("Download failed", err);
      }
    };

    const handleDownloadAll = async () => {
        setIsDownloading(true);
        try {
          for (const table of event.tables) {
            await handleDownloadTable(table.id, table.name);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } finally {
            setIsDownloading(false);
        }
    };

  // --- RENDER HELPERS ---

  const renderDashboard = () => (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="text-center mb-8">
         <h2 className="text-3xl font-bold text-slate-800 mb-2">{localEventName}</h2>
         <p className="text-slate-500 flex items-center justify-center gap-2">
            <Calendar size={16} /> {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
         </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="bg-primary/10 p-3 rounded-full mb-2">
               <Users size={24} className="text-primary" />
            </div>
            <div className="text-2xl font-bold text-slate-800">{invitedGuests.length}</div>
            <div className="text-xs uppercase font-bold text-slate-400">Total Guests</div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="bg-secondary/10 p-3 rounded-full mb-2">
               <LayoutGrid size={24} className="text-secondary" />
            </div>
            <div className="text-2xl font-bold text-slate-800">{tableCount}</div>
            <div className="text-xs uppercase font-bold text-slate-400">Tables</div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="bg-emerald-100 p-3 rounded-full mb-2">
               <CheckCircle size={24} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-800">{seatedCount}</div>
            <div className="text-xs uppercase font-bold text-slate-400">Seated</div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="bg-orange-100 p-3 rounded-full mb-2">
               <Armchair size={24} className="text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-slate-800">{utilization}%</div>
            <div className="text-xs uppercase font-bold text-slate-400">Capacity Used</div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <button 
           onClick={() => setActiveTab('seating')}
           className="group relative bg-white border border-slate-200 hover:border-primary/50 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all text-left overflow-hidden"
         >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <LayoutGrid size={120} className="text-primary" />
            </div>
            <div className="relative z-10">
               <div className="bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <Armchair size={24} />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-1">Seating Chart</h3>
               <p className="text-slate-500 text-sm">View visual arrangement of tables and seats.</p>
            </div>
         </button>

         <button 
           onClick={() => setActiveTab('guests')}
           className="group relative bg-white border border-slate-200 hover:border-secondary/50 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all text-left overflow-hidden"
         >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <List size={120} className="text-secondary" />
            </div>
            <div className="relative z-10">
               <div className="bg-secondary text-white w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <List size={24} />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-1">Guest List</h3>
               <p className="text-slate-500 text-sm">View full list of attendees and assignments.</p>
            </div>
         </button>
      </div>
    </div>
  );

  const renderGuestList = () => {
    const filtered = invitedGuests.filter(g => 
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        g.group.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto w-full h-full flex flex-col pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                   <h2 className="text-2xl font-bold text-slate-800">Guest List</h2>
                   <p className="text-slate-500 text-sm">Attendees for this event</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                       type="text" 
                       placeholder="Search guests..." 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary/20 outline-none w-full md:w-64"
                    />
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">Guest</th>
                                <th className="px-6 py-4">Group</th>
                                <th className="px-6 py-4">Seated At</th>
                                <th className="px-6 py-4 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map(guest => {
                                const table = event.tables.find(t => t.id === guest.assignedTableId);
                                return (
                                    <tr key={guest.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                    {guest.name.charAt(0)}
                                                </div>
                                                <div className="font-medium text-slate-800">{guest.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-slate-600">{guest.group}</td>
                                        <td className="px-6 py-3">
                                            {table ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                    <Armchair size={10} /> {table.name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Not Seated</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-right text-sm text-slate-400">
                                            {guest.classification} • {guest.gender}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                                        No guests found matching search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
  };

  const renderSeatingChart = () => (
    <div className="flex-1 overflow-auto p-4 md:p-8 h-full pb-24">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Seating Chart</h2>
            <button 
                onClick={handleDownloadAll} 
                disabled={isDownloading}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm shadow hover:opacity-90"
            >
                <Share2 size={16} /> {isDownloading ? 'Saving...' : 'Share Images'}
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
            {event.tables.map(table => (
                <div key={table.id}>
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
                        // Read Only
                    />
                </div>
            ))}
            {event.tables.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                    <p>No tables found for this event.</p>
                </div>
            )}
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 z-20 shadow-sm sticky top-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button onClick={() => activeTab === 'dashboard' ? onBack() : setActiveTab('dashboard')} className="p-2 hover:bg-slate-50 rounded-full text-slate-500 transition-colors shrink-0">
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex-1 min-w-0">
             {isEditingTitle ? (
                <input 
                  ref={titleInputRef}
                  value={localEventName}
                  onChange={(e) => setLocalEventName(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                  className="font-bold text-lg text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-0.5 w-full max-w-[200px] focus:ring-2 focus:ring-primary/20 outline-none"
                />
              ) : (
                <div 
                  onClick={() => setIsEditingTitle(true)}
                  className="font-bold text-lg text-slate-800 flex items-center gap-2 cursor-pointer hover:bg-slate-50 px-2 py-0.5 rounded transition-colors truncate max-w-[200px]"
                >
                  <span className="truncate">{localEventName}</span> <Edit3 size={14} className="text-slate-400 shrink-0" />
                </div>
              )}
            <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap overflow-x-auto no-scrollbar">
               <span className={`px-1.5 py-0.5 rounded uppercase text-[10px] font-bold shrink-0 ${event.status === 'past' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                 {event.status}
               </span>
               {activeTab !== 'dashboard' && <span className="text-slate-300">|</span>}
               {activeTab === 'seating' && <span className="text-primary font-medium">Seating Chart</span>}
               {activeTab === 'guests' && <span className="text-secondary font-medium">Guest List</span>}
            </div>
          </div>
        </div>
        
        {/* Simple Tabs on Desktop Header */}
        <div className="hidden md:flex bg-slate-100 p-1 rounded-lg shrink-0">
           <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'dashboard' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Overview</button>
           <button onClick={() => setActiveTab('seating')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'seating' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Seating</button>
           <button onClick={() => setActiveTab('guests')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'guests' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Guests</button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
         {activeTab === 'dashboard' && renderDashboard()}
         {activeTab === 'guests' && renderGuestList()}
         {activeTab === 'seating' && renderSeatingChart()}
      </div>

      {/* Mobile Bottom Navigation for Viewer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex justify-around p-2 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
         <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'dashboard' ? 'text-primary' : 'text-slate-400'}`}>
            <LayoutGrid size={20} />
            <span className="text-[10px] font-medium mt-1">Overview</span>
         </button>
         <button onClick={() => setActiveTab('seating')} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'seating' ? 'text-primary' : 'text-slate-400'}`}>
            <Armchair size={20} />
            <span className="text-[10px] font-medium mt-1">Seating</span>
         </button>
         <button onClick={() => setActiveTab('guests')} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'guests' ? 'text-primary' : 'text-slate-400'}`}>
            <List size={20} />
            <span className="text-[10px] font-medium mt-1">Guests</span>
         </button>
      </div>
    </div>
  );
};