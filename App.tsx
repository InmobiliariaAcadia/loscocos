
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Guest, Table, PastEvent } from './types';
import { GuestCard } from './components/GuestCard';
import { TableZone } from './components/TableZone';
import { TableModal } from './components/TableModal';
import { GuestModal } from './components/GuestModal';
import { AutoArrangeModal } from './components/AutoArrangeModal';
import { LandingPage } from './components/LandingPage';
import { GuestManager } from './components/GuestManager';
import { EventViewer } from './components/EventViewer';
import { generateSeatingPlan } from './services/geminiService';
import { getGuests, saveGuests, getEvents, saveEvent } from './services/storage';
// @ts-ignore
import html2canvas from 'html2canvas';
import { 
  Plus, 
  Sparkles, 
  LayoutGrid, 
  Search,
  Trash2,
  ArrowLeft,
  Home,
  Share2,
  Save,
  Palmtree,
  XCircle,
  Check,
  CalendarCheck,
  Edit3
} from 'lucide-react';

type ViewState = 'landing' | 'guests' | 'seating' | 'view_event';

function App() {
  console.log("App v0.2.2 - View Only Sharing");
  
  // --- Helpers ---
  const getNextSaturday = () => {
    const d = new Date();
    d.setDate(d.getDate() + (6 - d.getDay() + 7) % 7);
    return d.toISOString().split('T')[0];
  };

  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [eventDate, setEventDate] = useState(getNextSaturday());
  const [eventName, setEventName] = useState('New Event');
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  
  // Data State
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [allEvents, setAllEvents] = useState<PastEvent[]>([]);
  const [viewingEvent, setViewingEvent] = useState<PastEvent | null>(null);

  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [draggedGuestId, setDraggedGuestId] = useState<string | null>(null);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Modals
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [showAutoArrangeModal, setShowAutoArrangeModal] = useState(false);
  const [aiConstraints, setAiConstraints] = useState("Mix groups slightly but keep families together.");

  // --- Initialization ---
  useEffect(() => {
    const loadedGuests = getGuests();
    const loadedEvents = getEvents();
    setGuests(loadedGuests);
    setAllEvents(loadedEvents);
  }, []);

  // Fix: Clear search when entering seating view so guests aren't hidden
  useEffect(() => {
    if (currentView === 'seating') {
      setSidebarSearch('');
    }
  }, [currentView]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

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

  // --- Navigation Handlers ---

  const handleStartNewEvent = () => {
    setCurrentEventId(null);
    setTables([]); 
    setEventDate(getNextSaturday());
    setEventName('New Event');
    setCurrentView('guests');
  };

  const handleViewEvent = (event: PastEvent) => {
    // If it's a VIEWER-ONLY event, force view mode regardless of status
    if (event.accessLevel === 'viewer') {
      setViewingEvent(event);
      setCurrentView('view_event');
      return;
    }

    if (event.status === 'upcoming') {
      // Edit mode for Owners
      setCurrentEventId(event.id);
      setEventDate(event.date);
      setEventName(event.name);
      setTables(event.tables);
      
      // Merge guests
      const eventGuestIds = new Set(event.guests.filter(g => g.isInvited).map(g => g.id));
      const mergedGuests = guests.map(masterGuest => {
        const eventSnapshot = event.guests.find(g => g.id === masterGuest.id);
        if (eventSnapshot) {
             return { ...masterGuest, ...eventSnapshot, isInvited: eventSnapshot.isInvited };
        }
        return { ...masterGuest, isInvited: false, assignedTableId: null, seatIndex: undefined };
      });
      
      setGuests(mergedGuests);
      setCurrentView('seating');
    } else {
      // Read-only mode for Past Events
      setViewingEvent(event);
      setCurrentView('view_event');
    }
  };

  const handleProceedFromRegistry = () => {
    const invitedCount = activeGuests.length;
    let newTables: Table[] = [...tables];
    
    // Only auto-generate if we have NO tables
    if (newTables.length === 0) {
        if (invitedCount === 0) {
           newTables = [{ id: 't1', name: 'Table 1', capacity: 8, shape: 'circle' }];
        } else if (invitedCount <= 16) {
          const existingId = `t-${Date.now()}`;
          newTables = [{
            id: existingId,
            name: 'Main Table',
            capacity: invitedCount, 
            shape: 'circle'
          }];
        } else {
          const maxPerTable = 16;
          const numTables = Math.ceil(invitedCount / maxPerTable);
          // Distribute evenly
          const baseCapacity = Math.floor(invitedCount / numTables);
          const remainder = invitedCount % numTables;

          newTables = Array.from({ length: numTables }).map((_, i) => ({
             id: `t-${Date.now()}-${i}`,
             name: `Table ${i + 1}`,
             capacity: i < remainder ? baseCapacity + 1 : baseCapacity,
             shape: 'circle'
          }));
        }
    }

    setTables(newTables);
    setCurrentView('seating');
    handleSetEvent('upcoming');
  };

  const handleSetEvent = (status: 'upcoming' | 'past' = 'upcoming') => {
      const id = currentEventId || `evt_${Date.now()}`;
      
      const eventSnapshot: PastEvent = {
          id,
          date: eventDate,
          name: eventName,
          status,
          updatedAt: new Date().toISOString(),
          tables,
          guests: guests, // Save full state
          accessLevel: 'owner'
      };

      const updatedEvents = saveEvent(eventSnapshot);
      setAllEvents(updatedEvents);
      setCurrentEventId(id);
      
      if (status === 'past') {
          alert("Event archived to Past Events!");
          setCurrentView('landing');
      }
  };

  // --- Collaboration Handlers ---

  const handleExportEvent = () => {
    if (!currentEventId) {
       handleSetEvent('upcoming'); // Save first
    }
    
    // Ask for export mode
    const isViewerOnly = window.confirm(
      "How do you want to share this file?\n\n" +
      "OK = Read-Only (Viewer Mode)\n" +
      "Cancel = Editable (Collaborator Mode)"
    );

    const eventData: PastEvent = {
        id: currentEventId || `evt_${Date.now()}`,
        date: eventDate,
        name: eventName,
        status: 'upcoming',
        updatedAt: new Date().toISOString(),
        tables,
        guests,
        accessLevel: isViewerOnly ? 'viewer' : 'owner'
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(eventData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const suffix = isViewerOnly ? 'VIEWER' : 'EDIT';
    downloadAnchorNode.setAttribute("download", `${eventName.replace(/\s+/g, '_')}_${suffix}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          if (event.target?.result) {
            const importedEvent = JSON.parse(event.target.result as string) as PastEvent;
            
            // If the file is locked as Viewer Only
            if (importedEvent.accessLevel === 'viewer') {
                alert(`Imported "${importedEvent.name}" in Read-Only Mode.`);
                
                // Save it to list so they can open it later
                const updatedEvents = saveEvent(importedEvent);
                setAllEvents(updatedEvents);
                
                // Open directly
                setViewingEvent(importedEvent);
                setCurrentView('view_event');
                return;
            }

            // If it is editable
            if (window.confirm(`Import "${importedEvent.name}" for Editing?`)) {
               // Edit Mode
               setEventName(importedEvent.name);
               setEventDate(importedEvent.date);
               setTables(importedEvent.tables);
               setGuests(importedEvent.guests); // Replace current guest state
               setCurrentEventId(null); // Import as new copy to avoid ID conflicts
               
               // Save immediately so it's in their list
               const newId = `evt_${Date.now()}`;
               importedEvent.id = newId;
               saveEvent({ ...importedEvent, id: newId });
               setCurrentEventId(newId);

               setCurrentView('seating');
            }
          }
        } catch (error) {
          alert("Invalid file format.");
        }
      };
    }
  };

  // --- Interaction Logic ---

  const handleGuestSelect = (guestId: string) => {
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

    if (guestToMove.assignedTableId !== tableId && currentAssigned.length >= table.capacity) {
      alert("Table is full!");
      return;
    }

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

    const existingGuest = currentAssigned.find(g => g.seatIndex === finalIndex);

    setGuests(prev => {
        const next = prev.map(g => {
            if (g.id === guestId) return { ...g, assignedTableId: tableId, seatIndex: finalIndex };
            if (existingGuest && g.id === existingGuest.id) {
                if (guestToMove.assignedTableId === tableId && guestToMove.seatIndex !== undefined) {
                    return { ...g, seatIndex: guestToMove.seatIndex }; // Swap
                } else {
                    return { ...g, seatIndex: undefined }; // Displace
                }
            }
            return g;
        });
        saveGuests(next);
        return next;
    });
  };

  const handleTableClick = (tableId: string, seatIndex?: number) => {
    if (selectedGuestId) {
      assignGuestToTable(selectedGuestId, tableId, seatIndex);
      setSelectedGuestId(null); 
    }
  };

  const handleTouchDrop = (guestId: string, tableId: string, seatIndex?: number) => {
    assignGuestToTable(guestId, tableId, seatIndex);
    setSelectedGuestId(null);
    setDraggedGuestId(null);
  };

  const handleDragStart = (e: React.DragEvent | null, guestId: string) => {
    setDraggedGuestId(guestId);
    setSelectedGuestId(guestId);
    if (e && e.dataTransfer) e.dataTransfer.effectAllowed = "move";
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
    setGuests(prev => {
        const next = prev.map(g => g.id === guestId ? { ...g, assignedTableId: null, seatIndex: undefined } : g);
        saveGuests(next);
        return next;
    });
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
      newGuests.forEach(g => {
        if(g.isInvited) {
          g.assignedTableId = null;
          g.seatIndex = undefined;
        }
      });

      plan.assignments.forEach(assign => {
        const guestIndex = newGuests.findIndex(g => g.id === assign.guestId);
        if (guestIndex !== -1) {
          newGuests[guestIndex].assignedTableId = assign.tableId;
          const tableGuests = newGuests.filter(ng => ng.assignedTableId === assign.tableId);
          newGuests[guestIndex].seatIndex = tableGuests.length; 
        }
      });
      setGuests(newGuests);
      saveGuests(newGuests);
    } catch (error) {
      alert("Failed to generate seating plan. Check API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadTable = async (tableId: string, tableName: string) => {
    const element = document.getElementById(`table-zone-${tableId}`);
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      const safeName = tableName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `Seating_${safeName}_${eventDate}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) { console.error("Download failed", err); }
  };

  const handleDownloadAllTables = async () => {
    setIsDownloading(true);
    try {
      for (const table of tables) {
        await handleDownloadTable(table.id, table.name);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) { alert("Could not complete downloads."); } finally { setIsDownloading(false); }
  };

  // --- CRUD Handlers ---

  const handleSaveTable = (tableData: any) => {
    let newTabs = [];
    if (tableData.id) {
      newTabs = tables.map(t => t.id === tableData.id ? { ...t, ...tableData } : t);
    } else {
      newTabs = [...tables, { id: `t${Date.now()}`, ...tableData }];
    }
    setTables(newTabs);
    setShowTableModal(false);
    setEditingTable(null);
    handleSetEvent('upcoming');
  };

  const handleDeleteTable = (tableId: string) => {
    setGuests(prev => {
        const next = prev.map(g => g.assignedTableId === tableId ? { ...g, assignedTableId: null, seatIndex: undefined } : g);
        saveGuests(next);
        return next;
    });
    setTables(prev => {
        const next = prev.filter(t => t.id !== tableId);
        return next;
    });
    handleSetEvent('upcoming');
  };

  const handleClearAssignments = () => {
    if(window.confirm("Remove all guests from tables?")) {
      setGuests(prev => {
          const next = prev.map(g => ({ ...g, assignedTableId: null, seatIndex: undefined }));
          saveGuests(next);
          return next;
      });
    }
  };

  const handleSaveGuest = (guestData: Guest) => {
    let newGuests = [];
    if (guests.some(g => g.id === guestData.id)) {
      newGuests = guests.map(g => g.id === guestData.id ? guestData : g);
    } else {
      newGuests = [...guests, guestData];
    }
    setGuests(newGuests);
    saveGuests(newGuests);
  };
  
  const handleDeleteGuest = (guestId: string) => {
    if (window.confirm("Permanently delete guest from DB?")) {
      setGuests(prev => {
        const remaining = prev.filter(g => g.id !== guestId);
        const cleaned = remaining.map(g => g.partnerId === guestId ? { ...g, isCouple: false, partnerId: undefined } : g);
        saveGuests(cleaned);
        return cleaned;
      });
    }
  };

  // --- Render ---

  if (currentView === 'view_event' && viewingEvent) {
      return <EventViewer event={viewingEvent} onBack={() => setCurrentView('landing')} />;
  }

  if (currentView === 'landing') {
    return (
      <LandingPage 
        onStart={handleStartNewEvent}
        onViewEvent={handleViewEvent}
        tables={tables}
        guests={guests}
        eventDate={eventDate}
        setEventDate={setEventDate}
        pastEvents={allEvents}
        onImport={handleImportEvent}
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
          pastEvents={allEvents}
        />
        <GuestManager 
          guests={guests}
          onUpdateGuest={handleSaveGuest}
          onAddGuest={() => { setEditingGuest(null); setShowGuestModal(true); }}
          onEditGuest={(g) => { setEditingGuest(g); setShowGuestModal(true); }}
          onDeleteGuest={handleDeleteGuest}
          onProceed={handleProceedFromRegistry}
          onBack={() => setCurrentView('landing')}
          onSave={() => handleSetEvent('upcoming')}
        />
      </>
    );
  }

  // Seating View
  return (
    <div className="flex h-screen bg-background text-slate-800 font-sans overflow-hidden">
      
      <GuestModal 
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onSave={handleSaveGuest}
        editingGuest={editingGuest}
        allGuests={guests}
        pastEvents={allEvents}
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

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-80 bg-white border-r border-slate-200 flex-col shadow-sm z-10 shrink-0">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary">
              <button onClick={() => handleSetEvent('upcoming')} className="p-1 hover:bg-slate-100 rounded text-slate-500">
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
            <button onClick={() => { setEditingGuest(null); setShowGuestModal(true); }} className="text-primary text-xs font-medium flex items-center gap-1">
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
                onEdit={() => { setEditingGuest(guest); setShowGuestModal(true); }}
                isSelected={selectedGuestId === guest.id}
                onTouchDragEnd={(tId, sIdx) => handleTouchDrop(guest.id, tId, sIdx)}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background relative">
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
             <button 
              onClick={() => setCurrentView('guests')}
              className="md:hidden flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium"
            >
              <ArrowLeft size={16} />
            </button>
            
            {/* Editable Title */}
            <div className="flex items-center gap-2 max-w-[200px] md:max-w-md">
              {isEditingTitle ? (
                <input 
                  ref={titleInputRef}
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                  className="font-bold text-lg text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-0.5 w-full focus:ring-2 focus:ring-primary/20 outline-none"
                />
              ) : (
                <div 
                  onClick={() => setIsEditingTitle(true)}
                  className="font-bold text-lg text-slate-800 flex items-center gap-2 cursor-pointer hover:bg-slate-50 px-2 py-0.5 rounded transition-colors truncate"
                >
                  {eventName} <Edit3 size={14} className="text-slate-400" />
                </div>
              )}
            </div>

            <button 
              onClick={() => { setEditingTable(null); setShowTableModal(true); }}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium"
            >
              <LayoutGrid size={16} /> Add Table
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setShowAutoArrangeModal(true)}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-white font-medium shadow-md transition-all text-sm ${isGenerating ? 'bg-slate-400' : 'bg-gradient-to-r from-primary to-secondary'}`}
            >
              <Sparkles size={16} /> <span className="hidden md:inline">Auto</span>
            </button>
            
            <button onClick={() => handleSetEvent('past')} className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg font-medium text-sm">
              <CalendarCheck size={16} /> <span className="hidden md:inline">Finish</span>
            </button>

            <button onClick={handleExportEvent} className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium text-sm border border-slate-200">
               <Share2 size={16} /> <span className="hidden md:inline">Share File</span>
            </button>

            <button onClick={handleDownloadAllTables} disabled={isDownloading} className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg font-medium text-sm">
               <Save size={16} /> <span className="hidden md:inline">Img</span>
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
                  onEdit={(t) => { setEditingTable(t); setShowTableModal(true); }}
                  onDownload={handleDownloadTable}
                  onGuestClick={(g) => handleGuestSelect(g.id)}
                  onTableClick={handleTableClick}
                  selectedGuestId={selectedGuestId}
                  onTouchDrop={handleTouchDrop}
                />
              </div>
            ))}
            
            {tables.length > 0 && (
                <button 
                  onClick={() => { setEditingTable(null); setShowTableModal(true); }}
                  className="flex flex-col items-center justify-center min-h-[380px] rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all gap-2"
                >
                <Plus size={32} />
                <span className="font-medium">Add Table</span>
                </button>
            )}
          </div>
        </div>

        {/* Mobile Dock */}
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
            <button 
               onClick={() => { setEditingTable(null); setShowTableModal(true); }}
               className="text-xs text-primary font-bold flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded"
            >
               <Plus size={12}/> Table
            </button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto p-3 snap-x no-scrollbar">
             {unassignedGuests.map(guest => (
                <div key={guest.id} className="snap-start min-w-[140px] shrink-0">
                   <GuestCard 
                      guest={guest} 
                      onDragStart={handleDragStart} 
                      onClick={() => handleGuestSelect(guest.id)}
                      onEdit={() => { setEditingGuest(guest); setShowGuestModal(true); }}
                      variant="compact"
                      isSelected={selectedGuestId === guest.id}
                      onTouchDragEnd={(tId, sIdx) => handleTouchDrop(guest.id, tId, sIdx)}
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
