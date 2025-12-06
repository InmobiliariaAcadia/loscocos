import React, { useState, useMemo, useEffect } from 'react';
import { Guest, Table, PastEvent } from './types';
import { GuestCard } from './components/GuestCard';
import { TableZone } from './components/TableZone';
import { TableModal } from './components/TableModal';
import { GuestModal } from './components/GuestModal';
import { AutoArrangeModal } from './components/AutoArrangeModal';
import { LandingPage } from './components/LandingPage';
import { GuestManager } from './components/GuestManager';
import { generateSeatingPlan } from './services/geminiService';
// @ts-ignore
import html2canvas from 'html2canvas';
import { 
  Plus, 
  Sparkles, 
  RotateCcw, 
  LayoutGrid, 
  Search,
  Trash2,
  ArrowLeft,
  Home,
  Share2,
  Save,
  Palmtree,
  XCircle,
  Check
} from 'lucide-react';

const INITIAL_GUESTS: Guest[] = [
  { id: 'g1', name: 'Alice Johnson', seatingName: 'Alice', group: 'Doña Laura', tags: ['Veg'], assignedTableId: null, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g2', seatTogether: true, classification: 'A', isInvited: true },
  { id: 'g2', name: 'Bob Smith', seatingName: 'Uncle Bob', group: 'Doña Laura', tags: [], assignedTableId: null, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g1', seatTogether: true, classification: 'A', isInvited: true },
  { id: 'g3', name: 'Charlie Brown', seatingName: 'Charlie', group: 'Alejandra', tags: ['Kid'], assignedTableId: null, gender: 'Male', ageGroup: 'Child', isCouple: false, seatTogether: false, classification: 'B', isInvited: true },
  { id: 'g4', name: 'Diana Prince', group: 'Don Luis', tags: [], assignedTableId: null, gender: 'Female', ageGroup: 'Adult', isCouple: false, seatTogether: false, classification: 'B', isInvited: true },
  { id: 'g5', name: 'Evan Wright', group: 'Luison', tags: [], assignedTableId: null, gender: 'Male', ageGroup: 'Senior', isCouple: false, seatTogether: false, classification: 'A', isInvited: false },
  { id: 'g6', name: 'Fiona Green', group: 'Luison', tags: [], assignedTableId: null, gender: 'Female', ageGroup: 'Senior', isCouple: false, seatTogether: false, classification: 'A', isInvited: false },
  { id: 'g7', name: 'George Hall', group: 'Laurita', tags: [], assignedTableId: null, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g8', seatTogether: true, classification: 'C', isInvited: true },
  { id: 'g8', name: 'Hannah Lee', group: 'Laurita', tags: [], assignedTableId: null, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g7', seatTogether: true, classification: 'C', isInvited: true },
];

const MOCK_PAST_EVENTS: PastEvent[] = [
  {
    id: 'evt_001',
    date: '2023-12-24',
    name: 'Christmas Eve Dinner',
    guests: [
      { id: 'g1', name: 'Alice Johnson', classification: 'A' },
      { id: 'g2', name: 'Bob Smith', classification: 'A' },
      { id: 'g5', name: 'Evan Wright', classification: 'A' }
    ],
    assignments: [
      { guestId: 'g1', tableId: 't1', tableName: 'Main Table' },
      { guestId: 'g2', tableId: 't1', tableName: 'Main Table' },
      { guestId: 'g5', tableId: 't2', tableName: 'Elders Table' }
    ]
  },
  {
    id: 'evt_002',
    date: '2023-06-15',
    name: 'Summer BBQ',
    guests: [
      { id: 'g1', name: 'Alice Johnson', classification: 'A' },
      { id: 'g3', name: 'Charlie Brown', classification: 'C' } // Charlie was New back then
    ],
    assignments: [
      { guestId: 'g1', tableId: 't1', tableName: 'Patio' },
      { guestId: 'g3', tableId: 't2', tableName: 'Kids Table' }
    ]
  }
];

type ViewState = 'landing' | 'guests' | 'seating';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [tables, setTables] = useState<Table[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Interaction State
  const [draggedGuestId, setDraggedGuestId] = useState<string | null>(null);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  
  const [sidebarSearch, setSidebarSearch] = useState('');
  
  // Modals state
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const [showAutoArrangeModal, setShowAutoArrangeModal] = useState(false);
  const [aiConstraints, setAiConstraints] = useState("Mix groups slightly but keep families together.");

  // Check for saved draft
  const getSavedDraft = () => {
    try {
      const saved = localStorage.getItem('los_cosos_draft');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  };

  const savedDraft = getSavedDraft();

  // --- Derived State ---
  const activeGuests = useMemo(() => guests.filter(g => g.isInvited), [guests]);
  
  const unassignedGuests = useMemo(() => 
    activeGuests.filter(g => g.assignedTableId === null && g.name.toLowerCase().includes(sidebarSearch.toLowerCase())), 
    [activeGuests, sidebarSearch]
  );

  const guestsByTable = useMemo(() => {
    const map: Record<string, Guest[]> = {};
    tables.forEach(t => map[t.id] = []);
    activeGuests.forEach(g => {
      if (g.assignedTableId && map[g.assignedTableId]) {
        map[g.assignedTableId].push(g);
      }
    });
    return map;
  }, [activeGuests, tables]);

  // --- Handlers ---

  const handleStart = (initialTableCount: number) => {
    // If we have no tables, calculate needed tables or use input
    if (tables.length === 0) {
      // Auto-calculate: 1 table for every 10 guests roughly
      const neededTables = Math.ceil(activeGuests.length / 10) || initialTableCount;
      const countToCreate = Math.max(neededTables, 1);
      
      const newTables: Table[] = Array.from({ length: countToCreate }).map((_, i) => ({
        id: `t${Date.now()}-${i}`,
        name: `Table ${i + 1}`,
        capacity: 10, // Default to 10 for better auto-fit
        shape: 'circle'
      }));
      setTables(newTables);
    }
    setCurrentView('guests');
  };

  const handleResumeEvent = () => {
    if (savedDraft) {
      setEventDate(savedDraft.eventDate);
      setGuests(savedDraft.guests);
      setTables(savedDraft.tables);
      if (savedDraft.aiConstraints) setAiConstraints(savedDraft.aiConstraints);
      setCurrentView('seating');
    }
  };

  const handleSaveEvent = () => {
    const draft = {
      updatedAt: new Date().toISOString(),
      eventDate,
      guests,
      tables,
      aiConstraints
    };
    try {
      localStorage.setItem('los_cosos_draft', JSON.stringify(draft));
      // Force update of landing page if we went back
    } catch (e) {
      alert('Failed to save event. Local storage might be full.');
    }
  };

  // --- Interaction Logic (Drag & Tap) ---

  const handleGuestSelect = (guestId: string) => {
    // If clicking same guest, deselect. Else select.
    if (selectedGuestId === guestId) {
      setSelectedGuestId(null);
    } else {
      setSelectedGuestId(guestId);
    }
  };

  const assignGuestToTable = (guestId: string, tableId: string, seatIndex?: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const currentAssigned = activeGuests.filter(g => g.assignedTableId === tableId);
    const guestToMove = activeGuests.find(g => g.id === guestId);
    
    if (!guestToMove) return;

    // Check capacity (unless moving within same table)
    if (guestToMove.assignedTableId !== tableId && currentAssigned.length >= table.capacity) {
      alert("Table is full!");
      return;
    }

    // Determine final seat
    let finalIndex = seatIndex;
    if (finalIndex === undefined) {
      const occupiedIndices = new Set(currentAssigned.map(g => g.seatIndex));
      for (let i = 0; i < table.capacity; i++) {
        if (!occupiedIndices.has(i)) {
          finalIndex = i;
          break;
        }
      }
      if (finalIndex === undefined) finalIndex = 0;
    }

    // Check collision
    const existingGuest = currentAssigned.find(g => g.seatIndex === finalIndex);

    setGuests(prev => prev.map(g => {
      // Move target guest
      if (g.id === guestId) {
        return { ...g, assignedTableId: tableId, seatIndex: finalIndex };
      }
      // Swap or displace existing
      if (existingGuest && g.id === existingGuest.id) {
         if (guestToMove.assignedTableId === tableId && guestToMove.seatIndex !== undefined) {
             return { ...g, seatIndex: guestToMove.seatIndex }; // Swap
         } else {
             return { ...g, seatIndex: undefined }; // Displace
         }
      }
      return g;
    }));
  };

  const handleTableClick = (tableId: string, seatIndex?: number) => {
    if (selectedGuestId) {
      assignGuestToTable(selectedGuestId, tableId, seatIndex);
      setSelectedGuestId(null); // Clear selection after move
    }
  };

  // Legacy Drag Handlers
  const handleDragStart = (e: React.DragEvent, guestId: string) => {
    setDraggedGuestId(guestId);
    // Also select on drag start for hybrid feel
    setSelectedGuestId(guestId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDropOnTable = (e: React.DragEvent, tableId: string, targetSeatIndex?: number) => {
    e.preventDefault();
    if (draggedGuestId) {
      assignGuestToTable(draggedGuestId, tableId, targetSeatIndex);
      setDraggedGuestId(null);
      setSelectedGuestId(null);
    }
  };

  const handleUnassignGuest = (guestId: string) => {
    setGuests(prev => prev.map(g => 
      g.id === guestId ? { ...g, assignedTableId: null, seatIndex: undefined } : g
    ));
    if (selectedGuestId === guestId) setSelectedGuestId(null);
  };

  // --- AI & Tools ---

  const onConfirmAutoArrange = async (options: { alternateGender: boolean; separateCouples: boolean; extraConstraints: string }) => {
    setIsGenerating(true);
    setAiConstraints(options.extraConstraints);

    try {
      const plan = await generateSeatingPlan(activeGuests, tables, options.extraConstraints, {
        alternateGender: options.alternateGender,
        separateCouples: options.separateCouples
      });
      
      const newGuests = [...guests];
      // Reset assignments for invited
      newGuests.forEach(g => {
        if(g.isInvited) {
          g.assignedTableId = null;
          g.seatIndex = undefined;
        }
      });

      // Apply assignments
      plan.assignments.forEach(assign => {
        const guestIndex = newGuests.findIndex(g => g.id === assign.guestId);
        if (guestIndex !== -1) {
          newGuests[guestIndex].assignedTableId = assign.tableId;
          const tableGuests = newGuests.filter(ng => ng.assignedTableId === assign.tableId);
          newGuests[guestIndex].seatIndex = tableGuests.length; 
        }
      });
      setGuests(newGuests);
    } catch (error) {
      alert("Failed to generate seating plan. Please check your API Key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadTable = async (tableId: string, tableName: string) => {
    const element = document.getElementById(`table-zone-${tableId}`);
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      const safeName = tableName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `Seating_${safeName}_${eventDate}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const handleDownloadAllTables = async () => {
    setIsDownloading(true);
    try {
      for (const table of tables) {
        await handleDownloadTable(table.id, table.name);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) {
      alert("Could not complete all downloads.");
    } finally {
      setIsDownloading(false);
    }
  };

  // --- CRUD Handlers ---

  const openAddTableModal = () => { setEditingTable(null); setShowTableModal(true); };
  const openEditTableModal = (table: Table) => { setEditingTable(table); setShowTableModal(true); };

  const handleSaveTable = (tableData: any) => {
    if (tableData.id) {
      setTables(prev => prev.map(t => t.id === tableData.id ? { ...t, ...tableData } : t));
    } else {
      setTables(prev => [...prev, { id: `t${Date.now()}`, ...tableData }]);
    }
    setShowTableModal(false);
    setEditingTable(null);
  };

  const handleDeleteTable = (tableId: string) => {
    setGuests(prev => prev.map(g => g.assignedTableId === tableId ? { ...g, assignedTableId: null, seatIndex: undefined } : g));
    setTables(prev => prev.filter(t => t.id !== tableId));
  };

  const handleClearAssignments = () => {
    if(window.confirm("Remove all guests from tables?")) {
      setGuests(prev => prev.map(g => ({ ...g, assignedTableId: null, seatIndex: undefined })));
    }
  };

  const openAddGuestModal = () => { setEditingGuest(null); setShowGuestModal(true); };
  const openEditGuestModal = (guest: Guest) => { setEditingGuest(guest); setShowGuestModal(true); };

  const handleSaveGuest = (guestData: Guest) => {
    if (guests.some(g => g.id === guestData.id)) {
      setGuests(prev => prev.map(g => g.id === guestData.id ? guestData : g));
    } else {
      setGuests(prev => [...prev, guestData]);
    }
  };
  
  const handleDeleteGuest = (guestId: string) => {
    if (window.confirm("Permanently delete guest?")) {
      setGuests(prev => {
        const remaining = prev.filter(g => g.id !== guestId);
        return remaining.map(g => g.partnerId === guestId ? { ...g, isCouple: false, partnerId: undefined } : g);
      });
    }
  };

  // --- Views ---

  if (currentView === 'landing') {
    return (
      <LandingPage 
        onStart={handleStart}
        onResume={handleResumeEvent}
        savedDraft={savedDraft}
        tables={tables}
        guests={guests}
        eventDate={eventDate}
        setEventDate={setEventDate}
        pastEvents={MOCK_PAST_EVENTS}
      />
    );
  }

  if (currentView === 'guests') {
    return (
      <>
        <GuestModal 
          isOpen={showGuestModal}
          onClose={() => setShowGuestModal(false)}
          onSave={handleSaveGuest}
          editingGuest={editingGuest}
          allGuests={guests}
          pastEvents={MOCK_PAST_EVENTS}
        />
        <GuestManager 
          guests={guests}
          onUpdateGuest={handleSaveGuest}
          onAddGuest={openAddGuestModal}
          onEditGuest={openEditGuestModal}
          onDeleteGuest={handleDeleteGuest}
          onProceed={() => {
            handleSaveEvent(); // Auto-save when moving forward
            setCurrentView('seating');
          }}
          onBack={() => setCurrentView('landing')}
          onSave={handleSaveEvent}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-background text-slate-800 font-sans overflow-hidden">
      
      <GuestModal 
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onSave={handleSaveGuest}
        editingGuest={editingGuest}
        allGuests={guests}
        pastEvents={MOCK_PAST_EVENTS}
      />
      
      <TableModal 
        isOpen={showTableModal} 
        onClose={() => setShowTableModal(false)} 
        onSave={handleSaveTable}
        editingTable={editingTable}
      />

      <AutoArrangeModal 
        isOpen={showAutoArrangeModal}
        onClose={() => setShowAutoArrangeModal(false)}
        onConfirm={onConfirmAutoArrange}
        initialConstraints={aiConstraints}
      />

      {/* Sidebar: Guest List (Desktop) */}
      <aside className="hidden md:flex w-80 bg-white border-r border-slate-200 flex-col shadow-sm z-10 shrink-0">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary">
              <button onClick={() => setCurrentView('landing')} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                <Home size={20} />
              </button>
              <Palmtree size={24} />
              <h1 className="text-xl font-bold tracking-tight text-slate-800">Los Cocos</h1>
            </div>
            <button 
              onClick={() => setCurrentView('guests')}
              className="text-xs text-primary font-medium hover:underline"
            >
              Registry
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Unseated ({unassignedGuests.length})
            </h2>
            <button onClick={openAddGuestModal} className="text-primary text-xs font-medium flex items-center gap-1">
              <Plus size={14} /> Add
            </button>
          </div>
          
          <div className="space-y-2 min-h-[200px]" 
               onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
               onDrop={(e) => { e.preventDefault(); if (draggedGuestId) handleUnassignGuest(draggedGuestId); }}
          >
            {unassignedGuests.map(guest => (
              <GuestCard 
                key={guest.id} 
                guest={guest} 
                onDragStart={handleDragStart} 
                onClick={() => handleGuestSelect(guest.id)}
                onEdit={() => openEditGuestModal(guest)}
                isSelected={selectedGuestId === guest.id}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background relative">
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-2 md:gap-4">
             <button 
              onClick={() => setCurrentView('guests')}
              className="md:hidden flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium"
            >
              <ArrowLeft size={16} /> Registry
            </button>
            <button 
              onClick={openAddTableModal}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium"
            >
              <LayoutGrid size={16} /> Add Table
            </button>
            <button 
              onClick={handleClearAssignments}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
            >
              <Trash2 size={16} /> Clear
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setShowAutoArrangeModal(true)}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-white font-medium shadow-md transition-all text-sm ${isGenerating ? 'bg-slate-400' : 'bg-gradient-to-r from-primary to-secondary'}`}
            >
              <Sparkles size={16} /> <span className="hidden md:inline">Auto-Arrange</span>
            </button>
            
            <button onClick={handleSaveEvent} className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-primary border border-rose-200 rounded-lg font-medium text-sm">
              <Save size={16} /> <span className="hidden md:inline">Save</span>
            </button>

            <button onClick={handleDownloadAllTables} disabled={isDownloading} className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg font-medium text-sm">
              <Share2 size={16} /> <span className="hidden md:inline">Share</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8" onClick={() => setSelectedGuestId(null)}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-48">
            {tables.map(table => (
              <div key={table.id} onClick={(e) => e.stopPropagation()}>
                <TableZone
                  table={table}
                  assignedGuests={guestsByTable[table.id] || []}
                  onDrop={handleDropOnTable}
                  onDragStart={handleDragStart}
                  onRemoveGuest={handleUnassignGuest}
                  onDeleteTable={handleDeleteTable}
                  onEdit={openEditTableModal}
                  onDownload={handleDownloadTable}
                  onGuestClick={(g) => handleGuestSelect(g.id)}
                  onTableClick={handleTableClick}
                  selectedGuestId={selectedGuestId}
                />
              </div>
            ))}
            
            {tables.length > 0 && (
                <button 
                  onClick={openAddTableModal}
                  className="flex flex-col items-center justify-center min-h-[380px] rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all gap-2"
                >
                <Plus size={32} />
                <span className="font-medium">Add Table</span>
                </button>
            )}
          </div>
        </div>

        {/* Mobile Dock for Unseated Guests - Enhanced */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] pb-safe transition-transform duration-300">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Tap guest to place ({unassignedGuests.length})
            </span>
            {selectedGuestId && (
              <button onClick={() => setSelectedGuestId(null)} className="text-xs text-rose-500 font-bold flex items-center gap-1">
                <XCircle size={14} /> Cancel Selection
              </button>
            )}
          </div>
          
          <div className="flex gap-3 overflow-x-auto p-3 snap-x no-scrollbar">
             {unassignedGuests.map(guest => (
                <div key={guest.id} className="snap-start min-w-[140px] shrink-0">
                   <GuestCard 
                      guest={guest} 
                      onDragStart={handleDragStart} 
                      onClick={() => handleGuestSelect(guest.id)}
                      onEdit={() => openEditGuestModal(guest)}
                      variant="compact"
                      isSelected={selectedGuestId === guest.id}
                    />
                </div>
             ))}
             {unassignedGuests.length === 0 && (
               <div className="text-sm text-slate-400 py-4 w-full text-center italic flex items-center justify-center gap-2">
                 <Check size={16} /> All guests seated
               </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;