
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
import { getGuests, saveGuests, getEvents, saveEvent, deleteEvent, restoreEvent } from './services/storage';
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import * as XLSX from 'xlsx';
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
  Edit3,
  Download,
  Users,
  ChevronUp,
  X,
  ChevronDown,
  GripHorizontal
} from 'lucide-react';

type ViewState = 'landing' | 'guests' | 'seating' | 'view_event';

function App() {
  console.log("App v0.8.0 - Mobile Optimization");
  
  const getNextSaturday = () => {
    const d = new Date();
    d.setDate(d.getDate() + (6 - d.getDay() + 7) % 7);
    return d.toISOString().split('T')[0];
  };

  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [eventDate, setEventDate] = useState(getNextSaturday());
  const [eventName, setEventName] = useState('Nuevo Evento');
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [allEvents, setAllEvents] = useState<PastEvent[]>([]);
  const [viewingEvent, setViewingEvent] = useState<PastEvent | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [draggedGuestId, setDraggedGuestId] = useState<string | null>(null);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  // Mobile UI States
  const [mobilePanelState, setMobilePanelState] = useState<'closed' | 'peek' | 'open'>('peek');
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [showAutoArrangeModal, setShowAutoArrangeModal] = useState(false);
  const [aiConstraints, setAiConstraints] = useState("Mezcla grupos ligeramente pero mantén familias juntas.");

  useEffect(() => {
    try {
      const loadedGuests = getGuests();
      const loadedEvents = getEvents();
      setGuests(loadedGuests || []);
      setAllEvents(loadedEvents || []);
    } catch (err) {
      console.error("Error loading initial storage:", err);
    }
  }, []);

  useEffect(() => {
    if (currentView === 'seating') {
      setSidebarSearch('');
      // On mobile seating view, start with 'peek' if there are unassigned guests
    }
  }, [currentView]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  const activeGuests = useMemo(() => guests.filter(g => g.isInvited), [guests]);
  
  const unassignedGuests = useMemo(() => 
    activeGuests.filter(g => 
      g.assignedTableId === null && 
      (g.name || '').toLowerCase().includes((sidebarSearch || '').toLowerCase())
    ), 
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

  const handleGoHome = () => {
    if (currentView === 'seating' || currentView === 'guests') {
      const choice = window.confirm("¿Deseas guardar tu progreso antes de salir?");
      if (choice) {
         handleSetEvent('upcoming');
      }
    }
    setCurrentView('landing');
  };

  const handleStartNewEvent = (initialTableCount: number, templateEventId?: string) => {
    setCurrentEventId(null);
    setEventDate(getNextSaturday());
    
    if (templateEventId) {
      const template = allEvents.find(e => e.id === templateEventId);
      if (template) {
         setEventName(`Copia de ${template.name}`);
         setTables([...template.tables]); 
         const newGuests = guests.map(g => {
             const templateGuest = template.guests?.find(tg => tg.id === g.id);
             if (templateGuest && templateGuest.isInvited) {
                 return { ...g, isInvited: true, assignedTableId: templateGuest.assignedTableId, seatIndex: templateGuest.seatIndex };
             }
             return { ...g, isInvited: false, assignedTableId: null, seatIndex: undefined };
         });
         setGuests(newGuests);
         saveGuests(newGuests);
         setCurrentView('seating');
         return;
      }
    }

    setEventName('Nuevo Evento');
    setTables([]); 
    const resetGuests = guests.map(g => ({
        ...g,
        isInvited: false, 
        assignedTableId: null,
        seatIndex: undefined
    }));
    
    setGuests(resetGuests);
    saveGuests(resetGuests);
    setCurrentView('guests');
  };

  const handleViewEvent = (event: PastEvent) => {
    if (event.accessLevel === 'viewer') {
      setViewingEvent(event);
      setCurrentView('view_event');
      return;
    }

    if (event.status === 'upcoming') {
      handleEditEvent(event);
    } else {
      setViewingEvent(event);
      setCurrentView('view_event');
    }
  };

  const handleEditEvent = (event: PastEvent) => {
    setCurrentEventId(event.id);
    setEventDate(event.date);
    setEventName(event.name);
    setTables(event.tables || []);
    
    const masterMap = new Map(guests.map(g => [g.id, g]));
    const mergedGuests = guests.map(masterGuest => {
      const eventSnapshot = event.guests?.find(g => g.id === masterGuest.id);
      if (eventSnapshot && eventSnapshot.isInvited) {
            return { 
              ...masterGuest, 
              isInvited: true,
              assignedTableId: eventSnapshot.assignedTableId,
              seatIndex: eventSnapshot.seatIndex
            };
      }
      return { 
          ...masterGuest, 
          isInvited: false, 
          assignedTableId: null, 
          seatIndex: undefined 
      };
    });

    const missingGuests = (event.guests || []).filter(g => !masterMap.has(g.id));
    const finalGuestList = [...mergedGuests, ...missingGuests];
    
    setGuests(finalGuestList);
    saveGuests(finalGuestList);
    setCurrentView('seating');
  };

  const handleUpdateViewingEvent = (updatedEvent: PastEvent) => {
    const newEvents = saveEvent(updatedEvent);
    setAllEvents(newEvents);
    setViewingEvent(updatedEvent);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este evento?")) {
        const updated = deleteEvent(eventId);
        setAllEvents(updated);
        if (currentEventId === eventId || viewingEvent?.id === eventId) {
            setCurrentView('landing');
            setCurrentEventId(null);
            setViewingEvent(null);
        }
    }
  };

  const handleRestoreEvent = (eventId: string) => {
    const updated = restoreEvent(eventId);
    setAllEvents(updated);
  };

  const handleProceedFromRegistry = () => {
    const invitedCount = activeGuests.length;
    let newTables: Table[] = [...tables];
    
    if (newTables.length === 0) {
        if (invitedCount === 0) {
           newTables = [{ id: 't1', name: 'Mesa 1', capacity: 8, shape: 'circle' }];
        } else if (invitedCount <= 16) {
          const existingId = `t-${Date.now()}`;
          newTables = [{
            id: existingId,
            name: 'Mesa Principal',
            capacity: invitedCount, 
            shape: 'circle'
          }];
        } else {
          const maxPerTable = 10;
          const numTables = Math.ceil(invitedCount / maxPerTable);
          const baseCapacity = Math.floor(invitedCount / numTables);
          const remainder = invitedCount % numTables;

          newTables = Array.from({ length: numTables }).map((_, i) => ({
             id: `t-${Date.now()}-${i}`,
             name: `Mesa ${i + 1}`,
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
          guests: guests, 
          accessLevel: 'owner'
      };

      const updatedEvents = saveEvent(eventSnapshot);
      setAllEvents(updatedEvents || []);
      setCurrentEventId(id);
      
      if (status === 'past') {
          alert("¡Evento finalizado y guardado!");
          setCurrentView('landing');
      }
  };

  const handleSaveProgress = () => {
    handleSetEvent('upcoming');
    alert("¡Progreso guardado!");
  };

  const handleExportEvent = () => {
    if (!currentEventId) {
       handleSetEvent('upcoming'); 
    }
    
    const isViewerOnly = window.confirm(
      "¿Cómo quieres compartir?\n\n" +
      "Aceptar = Solo Lectura\n" +
      "Cancelar = Editable"
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
    const suffix = isViewerOnly ? 'LECTURA' : 'EDITABLE';
    downloadAnchorNode.setAttribute("download", `${(eventName || 'Evento').replace(/\s+/g, '_')}_${suffix}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    const fileName = file.name.toLowerCase();

    if ((fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) && XLSX) {
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

                if (jsonData.length === 0) {
                    alert("El archivo parece vacío.");
                    return;
                }

                if (window.confirm(`¿Importar ${jsonData.length} registros?`)) {
                    const newGuests = [...guests];
                    jsonData.forEach((row, index) => {
                        const fullName = row['Full Name'] || row['Name'] || row['Nombre'];
                        if (!fullName) return;
                        const guestId = `imp_${Date.now()}_${index}`;
                        const isInvited = true;
                        newGuests.push({
                            id: guestId,
                            name: fullName,
                            seatingName: row['Seating Name'] || fullName.split(' ')[0],
                            group: row['Group'] || 'Otro',
                            classification: (row['Classification'] || 'Frecuente') as any,
                            isInvited: isInvited,
                            gender: (row['Gender'] || 'Male') as any,
                            ageGroup: (row['Age Group'] || 'Adult') as any,
                            isCouple: false,
                            seatTogether: false,
                            tags: [],
                            assignedTableId: null
                        });
                    });
                    setGuests(newGuests);
                    saveGuests(newGuests);
                    setCurrentView('guests');
                }
            } catch (err) { alert("Error reading Excel/CSV."); }
        };
        return;
    }

    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = (event) => {
        try {
            if (event.target?.result) {
                const importedEvent = JSON.parse(event.target.result as string) as PastEvent;
                if (window.confirm(`¿Importar "${importedEvent.name}"?`)) {
                   setEventName(importedEvent.name);
                   setEventDate(importedEvent.date);
                   setTables(importedEvent.tables || []);
                   setGuests(importedEvent.guests || []);
                   setCurrentEventId(importedEvent.id); 
                   setCurrentView('seating');
                }
            }
        } catch (error) { alert("Invalid JSON file."); }
    };
  };

  const handleGuestSelect = (guestId: string) => {
    setSelectedGuestId(selectedGuestId === guestId ? null : guestId);
    if (guestId && mobilePanelState === 'peek') {
      setMobilePanelState('peek'); // keep peek or close if you want to see the table
    }
  };

  const assignGuestToTable = (guestId: string, tableId: string, seatIndex?: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const currentAssigned = activeGuests.filter(g => g.assignedTableId === tableId);
    const guestToMove = activeGuests.find(g => g.id === guestId);
    if (!guestToMove) return;

    if (guestToMove.assignedTableId !== tableId && currentAssigned.length >= table.capacity) {
      alert("¡Mesa llena!");
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
    }

    if (finalIndex === undefined) return;
    const existingGuest = currentAssigned.find(g => g.seatIndex === finalIndex);

    setGuests(prev => {
        const next = prev.map(g => {
            if (g.id === guestId) return { ...g, assignedTableId: tableId, seatIndex: finalIndex };
            if (existingGuest && g.id === existingGuest.id) {
                if (guestToMove.assignedTableId === tableId && guestToMove.seatIndex !== undefined) {
                    return { ...g, seatIndex: guestToMove.seatIndex }; 
                } else {
                    return { ...g, assignedTableId: null, seatIndex: undefined }; 
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
    setSelectedGuestId(guestId);
    setTimeout(() => {
        setSelectedGuestId(prev => prev === guestId ? null : prev);
    }, 5500);
  };

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

      const tableSeatCounters: Record<string, number> = {};
      tables.forEach(t => tableSeatCounters[t.id] = 0);

      plan.assignments.forEach(assign => {
        const guestIndex = newGuests.findIndex(g => g.id === assign.guestId);
        if (guestIndex !== -1) {
          const table = tables.find(t => t.id === assign.tableId);
          if (table && tableSeatCounters[table.id] < table.capacity) {
            newGuests[guestIndex].assignedTableId = assign.tableId;
            newGuests[guestIndex].seatIndex = tableSeatCounters[table.id];
            tableSeatCounters[table.id]++;
          }
        }
      });
      
      setGuests(newGuests);
      saveGuests(newGuests);
    } catch (error) {
      alert("Error organizing. Check API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadTable = async (tableId: string, tableName: string) => {
    const element = document.getElementById(`table-zone-${tableId}`);
    if (!element) return;
    try {
      const captureOptions = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc: Document) => {
          const toHide = clonedDoc.querySelectorAll('[data-html2canvas-ignore]');
          toHide.forEach(el => (el as HTMLElement).style.display = 'none');
          const clonedTable = clonedDoc.getElementById(`table-zone-${tableId}`);
          if(clonedTable) clonedTable.style.overflow = 'visible';
        }
      };

      const canvas = await (window as any).html2canvas ? (window as any).html2canvas(element, captureOptions) : html2canvas(element, captureOptions);
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      const safeName = (tableName || 'Table').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `LosCocos_${safeName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) { 
      console.error("Export Error", err); 
    }
  };

  const handleDownloadAllTables = async () => {
    if (!window.confirm("Se descargarán imágenes individuales de todas las mesas. ¿Continuar?")) return;
    setIsDownloading(true);
    try {
      for (const table of tables) {
        await handleDownloadTable(table.id, table.name);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    } finally { setIsDownloading(false); }
  };

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
  };

  const handleDeleteTable = (tableId: string) => {
    setGuests(prev => {
        const next = prev.map(g => g.assignedTableId === tableId ? { ...g, assignedTableId: null, seatIndex: undefined } : g);
        saveGuests(next);
        return next;
    });
    setTables(prev => prev.filter(t => t.id !== tableId));
  };

  const handleSaveGuest = (guestData: Guest) => {
    setGuests(prev => {
      let next = [];
      if (prev.some(g => g.id === guestData.id)) {
        next = prev.map(g => g.id === guestData.id ? guestData : g);
      } else {
        next = [...prev, guestData];
      }
      saveGuests(next);
      return next;
    });
  };
  
  const handleDeleteGuest = (guestId: string) => {
    if (window.confirm("¿Borrar invitado definitivamente?")) {
      setGuests(prev => {
        const cleaned = prev.filter(g => g.id !== guestId);
        saveGuests(cleaned);
        return cleaned;
      });
    }
  };

  if (currentView === 'view_event' && viewingEvent) {
      return (
        <EventViewer 
          event={viewingEvent} 
          onBack={handleGoHome} 
          onUpdateEvent={handleUpdateViewingEvent}
        />
      );
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
        onDeleteEvent={handleDeleteEvent}
        onRestoreEvent={handleRestoreEvent}
        onEditEvent={handleEditEvent}
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
          onBack={handleGoHome}
          onSave={() => handleSetEvent('upcoming')}
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
              <button onClick={handleGoHome} className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors">
                <Home size={20} />
              </button>
              <Palmtree size={24} />
              <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase">Los Cocos</h1>
            </div>
            <button 
              onClick={() => setCurrentView('guests')}
              className="text-xs text-primary font-black hover:underline uppercase tracking-widest"
            >
              Registro
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar invitado..." 
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Sin asignar ({unassignedGuests.length})
            </h2>
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
            {unassignedGuests.length === 0 && (
                <div className="py-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                    <Users size={32} className="text-slate-300 mb-2" />
                    <p className="text-slate-400 font-bold text-sm">
                      {activeGuests.length === 0 ? 'No hay invitados en este evento' : 'Todos sentados'}
                    </p>
                    {activeGuests.length === 0 && (
                      <button 
                        onClick={() => setCurrentView('guests')}
                        className="mt-3 text-xs font-black text-primary uppercase hover:underline"
                      >
                        Ir al Registro
                      </button>
                    )}
                </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Seating View */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background relative">
        {/* App Header */}
        <header className="bg-white border-b border-slate-200 px-3 md:px-6 py-3 flex items-center justify-between shadow-sm z-[50] shrink-0">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
             <button 
              onClick={handleGoHome}
              className="flex items-center justify-center p-2.5 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium border border-slate-200"
            >
              <Home size={18} />
            </button>
            <div className="flex items-center gap-2 max-w-[120px] md:max-w-md">
              {isEditingTitle ? (
                <input 
                  ref={titleInputRef}
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                  className="font-black text-lg text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-2 py-0.5 w-full focus:ring-2 focus:ring-primary/20 outline-none"
                />
              ) : (
                <div 
                  onClick={() => setIsEditingTitle(true)}
                  className="font-black text-base md:text-lg text-slate-800 flex items-center gap-2 cursor-pointer hover:bg-slate-50 px-2 py-0.5 rounded-lg transition-colors truncate"
                >
                  <span className="truncate">{eventName || 'Evento'}</span> <Edit3 size={14} className="text-slate-400 shrink-0" />
                </div>
              )}
            </div>
            <button 
              onClick={() => { setEditingTable(null); setShowTableModal(true); }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-black uppercase tracking-widest transition-all shadow-sm"
            >
              <LayoutGrid size={14} /> Mesa
            </button>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={() => setShowAutoArrangeModal(true)}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-white font-black text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 ${
                isGenerating 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-primary hover:scale-105 active:scale-95 shadow-[0_10px_20px_-5px_rgba(238,108,77,0.5)] hover:shadow-[0_20px_35px_-8px_rgba(238,108,77,0.6)] ring-4 ring-primary/10'
              }`}
            >
              <Sparkles size={16} /> <span className="hidden md:inline">Auto-Acomodo</span><span className="md:hidden">IA</span>
            </button>
            <button onClick={handleSaveProgress} className="p-2 md:p-2.5 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
               <Save size={18} />
            </button>
            <button onClick={handleDownloadAllTables} disabled={isDownloading} className="p-2 md:p-2.5 bg-slate-900 text-white rounded-xl transition-all hover:opacity-90 active:scale-95 shadow-lg">
               <Download size={18} />
            </button>
             <button onClick={() => handleSetEvent('past')} className="p-2 md:p-2.5 bg-emerald-500 text-white rounded-xl transition-all hover:bg-emerald-600 shadow-lg">
               <Check size={18} strokeWidth={3} />
            </button>
          </div>
        </header>

        <div className={`flex-1 overflow-auto p-4 md:p-8 transition-all duration-300 ${mobilePanelState === 'peek' ? 'pb-32' : (mobilePanelState === 'open' ? 'pb-[60vh]' : 'pb-12')}`} onClick={() => setSelectedGuestId(null)}>
          {tables.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
               <div className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl border-2 border-slate-100 flex flex-col items-center max-w-sm text-center">
                  <div className="bg-rose-50 p-6 rounded-full mb-6">
                    <LayoutGrid size={48} className="text-primary" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">No hay mesas</h3>
                  <p className="text-slate-500 text-sm font-medium mb-8">Comienza añadiendo tu primera mesa para organizar a los invitados.</p>
                  <button 
                    onClick={() => { setEditingTable(null); setShowTableModal(true); }}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <Plus size={20} /> Añadir Mesa
                  </button>
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 pb-12">
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
              <button 
                onClick={() => { setEditingTable(null); setShowTableModal(true); }}
                className="flex flex-col items-center justify-center min-h-[300px] md:min-h-[420px] rounded-[2rem] md:rounded-[2.5rem] border-4 border-dashed border-slate-200 text-slate-300 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all gap-3 group"
              >
                <Plus size={40} className="transition-transform group-hover:scale-110" />
                <span className="font-black uppercase tracking-widest text-[10px] md:text-xs">Añadir Mesa</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile: Collapsible Unassigned Guests Panel */}
        <div className="md:hidden fixed inset-x-0 bottom-0 z-[100] pointer-events-none">
          {/* Backdrop when open */}
          {mobilePanelState === 'open' && (
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto h-[100vh] -top-[100vh] animate-in fade-in duration-200"
              onClick={() => setMobilePanelState('peek')}
            />
          )}
          
          <div 
            className={`
              pointer-events-auto w-full bg-white/95 backdrop-blur-xl rounded-t-[2.5rem] shadow-[0_-15px_50px_-10px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-500 ease-out border-t border-slate-100
              ${mobilePanelState === 'closed' ? 'translate-y-[calc(100%-10px)]' : (mobilePanelState === 'peek' ? 'translate-y-[calc(100%-80px)]' : 'h-[80vh] translate-y-0')}
            `}
          >
            {/* Handle / Peek Header */}
            <div 
              className="flex flex-col items-center pt-3 pb-4 cursor-pointer"
              onClick={() => setMobilePanelState(mobilePanelState === 'open' ? 'peek' : 'open')}
            >
              <div className="w-10 h-1 bg-slate-200 rounded-full mb-3" />
              <div className="w-full px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-colors ${unassignedGuests.length > 0 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <Users size={16} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm tracking-tight">Invitados sin mesa</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{unassignedGuests.length} en espera</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {mobilePanelState === 'open' ? <ChevronDown size={20} className="text-slate-300" /> : <ChevronUp size={20} className="text-slate-300" />}
                </div>
              </div>
            </div>

            {/* Panel Body */}
            <div className={`flex-1 flex flex-col px-6 overflow-hidden ${mobilePanelState === 'open' ? 'opacity-100 pb-12' : 'opacity-0 h-0 pointer-events-none'}`}>
              <div className="w-full relative my-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar invitado..." 
                  className="w-full pl-11 pr-4 py-3 bg-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                />
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pt-2">
                <div className="grid grid-cols-1 gap-3">
                  {unassignedGuests.map(guest => (
                    <div key={guest.id}>
                      <GuestCard 
                        guest={guest} 
                        onDragStart={handleDragStart} 
                        onClick={() => handleGuestSelect(guest.id)}
                        onEdit={() => { setEditingGuest(guest); setShowGuestModal(true); }}
                        isSelected={selectedGuestId === guest.id}
                        onTouchDragEnd={(tId, sIdx) => handleTouchDrop(guest.id, tId, sIdx)}
                      />
                    </div>
                  ))}
                  {unassignedGuests.length === 0 && (
                    <div className="py-20 text-center text-slate-300 flex flex-col items-center">
                       <div className="bg-slate-50 p-6 rounded-full mb-4">
                          <Check size={40} className="text-emerald-500/30" />
                       </div>
                       <p className="font-bold">Todos tienen un lugar</p>
                       <p className="text-xs mt-1">¡Buen trabajo!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar Toggle for mobile access if needed */}
        {/* Note: Desktop sidebar is hidden on small screens by Tailwind hidden md:flex */}
      </main>
    </div>
  );
}

export default App;
