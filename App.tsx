import React, { useState, useMemo } from 'react';
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
  Palmtree
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
  const [draggedGuestId, setDraggedGuestId] = useState<string | null>(null);
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
  // Only consider INVITED guests for the seating chart
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

  const handleStart = (tableCount: number) => {
    if (tables.length === 0) {
      const newTables: Table[] = Array.from({ length: tableCount }).map((_, i) => ({
        id: `t${Date.now()}-${i}`,
        name: `Table ${i + 1}`,
        capacity: 12,
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
      alert(`Event saved successfully! \nLast saved: ${new Date().toLocaleTimeString()}`);
    } catch (e) {
      alert('Failed to save event. Local storage might be full.');
    }
  };

  const handleDragStart = (e: React.DragEvent, guestId: string) => {
    setDraggedGuestId(guestId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDropOnTable = (e: React.DragEvent, tableId: string, targetSeatIndex?: number) => {
    e.preventDefault();
    if (!draggedGuestId) return;

    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const currentAssigned = activeGuests.filter(g => g.assignedTableId === tableId);
    const draggedGuest = activeGuests.find(g => g.id === draggedGuestId);
    
    if (!draggedGuest) return;

    // Check if table is full (unless we are just moving someone already at the table)
    if (draggedGuest.assignedTableId !== tableId && currentAssigned.length >= table.capacity) {
      alert("Table is full!");
      setDraggedGuestId(null);
      return;
    }

    // Determine final seat index
    let finalIndex = targetSeatIndex;

    // If no specific slot was dropped on, find the first available slot
    if (finalIndex === undefined) {
      const occupiedIndices = new Set(currentAssigned.map(g => g.seatIndex));
      for (let i = 0; i < table.capacity; i++) {
        if (!occupiedIndices.has(i)) {
          finalIndex = i;
          break;
        }
      }
      // If still undefined (shouldn't happen if check capacity passes), just set to 0 or push to end
      if (finalIndex === undefined) finalIndex = 0; 
    }

    // Check if someone is already sitting there
    const existingGuestAtSeat = currentAssigned.find(g => g.seatIndex === finalIndex);

    setGuests(prev => prev.map(g => {
      // 1. If this is the dragged guest
      if (g.id === draggedGuestId) {
        return { ...g, assignedTableId: tableId, seatIndex: finalIndex };
      }
      // 2. If this is the person we landed on (Swap logic)
      if (existingGuestAtSeat && g.id === existingGuestAtSeat.id) {
         // Swap them to the dragged guest's old seat? 
         // Or if dragged guest came from sidebar, move existing to next available?
         // Simplest: If dragged guest was at same table, swap indices.
         if (draggedGuest.assignedTableId === tableId && draggedGuest.seatIndex !== undefined) {
             return { ...g, seatIndex: draggedGuest.seatIndex };
         } else {
             // If dragged from sidebar or other table, displace existing guest to null index (or find next empty)
             // For now, let's just null their index so they appear in list view of table or next open slot
             return { ...g, seatIndex: undefined }; 
         }
      }
      return g;
    }));

    setDraggedGuestId(null);
  };

  const handleUnassignGuest = (guestId: string) => {
    setGuests(prev => prev.map(g => 
      g.id === guestId ? { ...g, assignedTableId: null, seatIndex: undefined } : g
    ));
  };

  const onConfirmAutoArrange = async (options: { alternateGender: boolean; separateCouples: boolean; extraConstraints: string }) => {
    setIsGenerating(true);
    setAiConstraints(options.extraConstraints); // Update state for persistence

    try {
      const plan = await generateSeatingPlan(activeGuests, tables, options.extraConstraints, {
        alternateGender: options.alternateGender,
        separateCouples: options.separateCouples
      });
      
      const newGuests = [...guests];
      // Reset assignments for invited guests only
      newGuests.forEach(g => {
        if(g.isInvited) {
          g.assignedTableId = null;
          g.seatIndex = undefined;
        }
      });

      // Apply assignments (no specific seat index from AI yet, just table)
      plan.assignments.forEach(assign => {
        const guestIndex = newGuests.findIndex(g => g.id === assign.guestId);
        if (guestIndex !== -1) {
          newGuests[guestIndex].assignedTableId = assign.tableId;
          // Find next available seat index
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
      // Create canvas from the specific table element
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        backgroundColor: '#ffffff', // Force white background
        useCORS: true,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      // Sanitize filename
      const safeName = tableName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `Seating_${safeName}_${eventDate}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed for table " + tableName, err);
    }
  };

  const handleDownloadAllTables = async () => {
    setIsDownloading(true);
    try {
      // Download all tables sequentially
      for (const table of tables) {
        await handleDownloadTable(table.id, table.name);
        // Small delay to prevent browser throttling downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) {
      alert("Could not complete all downloads.");
    } finally {
      setIsDownloading(false);
    }
  };

  // --- Table Management Handlers ---

  const openAddTableModal = () => {
    setEditingTable(null);
    setShowTableModal(true);
  };

  const openEditTableModal = (table: Table) => {
    setEditingTable(table);
    setShowTableModal(true);
  };

  const handleSaveTable = (tableData: { name: string; capacity: number; shape: Table['shape']; id?: string }) => {
    if (tableData.id) {
      // Edit existing
      setTables(prev => prev.map(t => 
        t.id === tableData.id 
          ? { ...t, name: tableData.name, capacity: tableData.capacity, shape: tableData.shape }
          : t
      ));
    } else {
      // Add new
      const newId = `t${Date.now()}`;
      setTables(prev => [...prev, { 
        id: newId, 
        name: tableData.name, 
        capacity: tableData.capacity, 
        shape: tableData.shape 
      }]);
    }
    setShowTableModal(false);
    setEditingTable(null);
  };

  const handleDeleteTable = (tableId: string) => {
    setGuests(prev => prev.map(g => 
      g.assignedTableId === tableId ? { ...g, assignedTableId: null, seatIndex: undefined } : g
    ));
    setTables(prev => prev.filter(t => t.id !== tableId));
  };

  const handleClearAssignments = () => {
    if(window.confirm("Remove all guests from tables?")) {
      setGuests(prev => prev.map(g => ({ ...g, assignedTableId: null, seatIndex: undefined })));
    }
  };

  // --- Guest Management Handlers ---
  const openAddGuestModal = () => {
    setEditingGuest(null);
    setShowGuestModal(true);
  };

  const openEditGuestModal = (guest: Guest) => {
    setEditingGuest(guest);
    setShowGuestModal(true);
  };

  const handleSaveGuest = (guestData: Guest) => {
    if (guests.some(g => g.id === guestData.id)) {
      // Edit
      setGuests(prev => prev.map(g => g.id === guestData.id ? guestData : g));
    } else {
      // Add
      setGuests(prev => [...prev, guestData]);
    }
  };
  
  const handleDeleteGuest = (guestId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this guest from the registry? This action cannot be undone.")) {
      setGuests(prev => {
        const remainingGuests = prev.filter(g => g.id !== guestId);
        return remainingGuests.map(g => {
          if (g.partnerId === guestId) {
            return { ...g, isCouple: false, partnerId: undefined, seatTogether: false };
          }
          return g;
        });
      });
    }
  };

  // --- View Rendering ---

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
          onProceed={() => setCurrentView('seating')}
          onBack={() => setCurrentView('landing')}
          onSave={handleSaveEvent}
        />
      </>
    );
  }

  // Seating View (Main App Logic)
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

      {/* Sidebar: Guest List */}
      <aside className="hidden md:flex w-80 bg-white border-r border-slate-200 flex-col shadow-sm z-10 shrink-0">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary">
              <button onClick={() => setCurrentView('landing')} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                <Home size={20} />
              </button>
              <Palmtree size={24} />
              <h1 className="text-xl font-bold tracking-tight text-slate-800">Los Cosos</h1>
            </div>
            <button 
              onClick={() => setCurrentView('guests')}
              className="text-xs text-primary font-medium hover:underline"
            >
              Manage Registry
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search invited guests..." 
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Invited & Unseated ({unassignedGuests.length})
            </h2>
            <button 
              onClick={openAddGuestModal}
              className="p-1 hover:bg-slate-100 rounded text-primary transition-colors flex items-center gap-1 text-xs font-medium"
              title="Add Guest"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          
          <div className="space-y-2 min-h-[200px]" 
               onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
               onDrop={(e) => {
                 e.preventDefault();
                 if (draggedGuestId) handleUnassignGuest(draggedGuestId);
                 setDraggedGuestId(null);
               }}
          >
            {unassignedGuests.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8 italic">
                All invited guests seated!<br/>
              </p>
            ) : (
              unassignedGuests.map(guest => (
                <GuestCard 
                  key={guest.id} 
                  guest={guest} 
                  onDragStart={handleDragStart} 
                  onClick={() => openEditGuestModal(guest)}
                />
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Progress</span>
            <span>{Math.round((1 - unassignedGuests.length / (activeGuests.length || 1)) * 100)}% Seated</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" 
              style={{ width: `${(1 - unassignedGuests.length / (activeGuests.length || 1)) * 100}%` }}
            />
          </div>
        </div>
      </aside>

      {/* Main Content: Table Layout */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background relative">
        {/* Toolbar */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-2 md:gap-4">
             <button 
              onClick={() => setCurrentView('guests')}
              className="md:hidden flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              Registry
            </button>
            <button 
              onClick={openAddTableModal}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors"
            >
              <LayoutGrid size={16} />
              <span className="hidden md:inline">Add Table</span>
              <span className="md:hidden">Add</span>
            </button>
            <div className="hidden md:block h-6 w-px bg-slate-200"></div>
            <button 
              onClick={handleClearAssignments}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setShowAutoArrangeModal(true)}
              disabled={isGenerating}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-white font-medium shadow-md transition-all text-sm
                ${isGenerating 
                  ? 'bg-slate-400 cursor-wait' 
                  : 'bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:opacity-90 active:scale-95'}
              `}
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="animate-spin" size={16} />
                  <span className="hidden md:inline">Thinking...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span className="hidden md:inline">Auto-Arrange</span>
                  <span className="md:hidden">Auto</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleSaveEvent}
              className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-primary border border-rose-200 rounded-lg font-medium hover:bg-rose-100 active:scale-95 transition-all text-sm"
              title="Save current progress"
            >
              <Save size={16} />
              <span className="hidden md:inline">Save</span>
            </button>

            <button
              onClick={handleDownloadAllTables}
              disabled={isDownloading}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg font-medium shadow-md hover:bg-slate-700 active:scale-95 transition-all text-sm"
              title="Download separate images for all tables"
            >
                {isDownloading ? (
                   <span className="animate-pulse">Saving...</span>
                ) : (
                   <>
                     <Share2 size={16} />
                     <span className="hidden md:inline">Share</span>
                   </>
                )}
            </button>
          </div>
        </header>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mb-6 flex flex-col items-center">
             <h2 className="text-2xl font-bold text-slate-700">Seating Plan</h2>
             <p className="text-slate-500">{new Date(eventDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-32">
            {tables.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-slate-400 mt-20">
                    <p>No tables yet.</p>
                    <button onClick={openAddTableModal} className="text-primary hover:underline">Add your first table</button>
                </div>
            )}
            {tables.map(table => (
              <TableZone
                key={table.id}
                table={table}
                assignedGuests={guestsByTable[table.id] || []}
                onDrop={handleDropOnTable}
                onDragStart={handleDragStart}
                onRemoveGuest={handleUnassignGuest}
                onDeleteTable={handleDeleteTable}
                onEdit={openEditTableModal}
                onDownload={handleDownloadTable}
                onGuestClick={openEditGuestModal}
              />
            ))}
            
            {tables.length > 0 && (
                <button 
                onClick={openAddTableModal}
                className="flex flex-col items-center justify-center min-h-[380px] rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all gap-2 group print:hidden"
                >
                <Plus size={32} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">Add Another Table</span>
                </button>
            )}
          </div>
        </div>

        {/* Mobile Dock for Unassigned Guests */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Unseated Guests ({unassignedGuests.length})</span>
            <button onClick={() => setCurrentView('landing')} className="p-1"><Home size={16} className="text-slate-400" /></button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
             {unassignedGuests.map(guest => (
                <div key={guest.id} className="snap-start min-w-[150px]">
                   <GuestCard 
                      guest={guest} 
                      onDragStart={handleDragStart} 
                      onClick={() => openEditGuestModal(guest)}
                      variant="compact"
                    />
                </div>
             ))}
             {unassignedGuests.length === 0 && (
               <div className="text-xs text-slate-400 py-2 w-full text-center italic">All guests seated</div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;