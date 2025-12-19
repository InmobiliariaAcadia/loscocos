
import React, { useState, useMemo, useEffect } from 'react';
import { Table, Guest } from '../types';
import { GuestCard } from './GuestCard';
import { XCircle, Settings, Armchair, Download, RotateCcw, X } from 'lucide-react';
// @ts-ignore
import html2canvas from 'html2canvas';

interface TableZoneProps {
  table: Table;
  assignedGuests: Guest[];
  onDrop: (e: React.DragEvent, tableId: string, seatIndex?: number) => void;
  onDragStart: (e: React.DragEvent | null, guestId: string) => void;
  onRemoveGuest: (guestId: string) => void;
  onDeleteTable: (tableId: string) => void;
  onEdit: (table: Table) => void;
  onDownload: (tableId: string, tableName: string) => void;
  onGuestClick: (guest: Guest) => void;
  onTableClick?: (tableId: string, seatIndex?: number) => void;
  selectedGuestId?: string | null;
  onTouchDrop?: (guestId: string, tableId: string, seatIndex?: number) => void;
}

export const TableZone: React.FC<TableZoneProps> = ({ 
  table, 
  assignedGuests, 
  onDrop, 
  onDragStart,
  onRemoveGuest,
  onDeleteTable,
  onEdit,
  onDownload,
  onGuestClick,
  onTableClick,
  selectedGuestId,
  onTouchDrop
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'visual'>('visual');
  const [undoInfo, setUndoInfo] = useState<{ guestId: string; seatIndex?: number; name: string } | null>(null);
  
  const isFull = assignedGuests.length >= table.capacity;
  const isTargetCandidate = !!selectedGuestId && !isFull;

  useEffect(() => {
    if (undoInfo) {
      const timer = setTimeout(() => {
        setUndoInfo(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [undoInfo]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropOnSlot = (e: React.DragEvent, seatIndex: number) => {
    e.stopPropagation();
    onDrop(e, table.id, seatIndex);
  };

  const handleTriggerRemove = (guest: Guest) => {
    setUndoInfo({
      guestId: guest.id,
      seatIndex: guest.seatIndex,
      name: guest.name
    });
    onRemoveGuest(guest.id);
  };

  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (undoInfo && onTableClick) {
      onTableClick(table.id, undoInfo.seatIndex);
      setUndoInfo(null);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`¿Estás seguro de que quieres eliminar la mesa "${table.name}"? Los invitados asignados volverán a la lista de espera.`)) {
      onDeleteTable(table.id);
    }
  };

  const seatedGuests = useMemo(() => {
    const seats = new Array(table.capacity).fill(null);
    const pendingGuests: Guest[] = [];

    assignedGuests.forEach(g => {
        const preferredIdx = (g.seatIndex !== undefined && typeof g.seatIndex === 'number') ? g.seatIndex : -1;
        if (preferredIdx >= 0 && preferredIdx < table.capacity && seats[preferredIdx] === null) {
            seats[preferredIdx] = g;
        } else {
            pendingGuests.push(g);
        }
    });

    pendingGuests.forEach(g => {
        const firstNull = seats.indexOf(null);
        if (firstNull !== -1) {
            seats[firstNull] = g;
        }
    });

    return seats;
  }, [assignedGuests, table.capacity]);

  const getSeatPosition = (index: number) => {
    if (table.shape === 'rectangle') {
       const N = table.capacity;
       if (N === 1) return { top: '50%', left: '15%' };
       const sideSeats = Math.max(0, N - 2);
       const topSeats = Math.ceil(sideSeats / 2);
       const bottomSeats = Math.floor(sideSeats / 2);
       let x = 50, y = 50;
       const HEAD_X_MARGIN = 18;
       const SIDE_Y_MARGIN = 22;
       const SIDE_START_X = 30;
       const SIDE_END_X = 70;
       if (index === 0) { x = HEAD_X_MARGIN; y = 50; }
       else if (index <= topSeats) {
           y = SIDE_Y_MARGIN;
           if (topSeats <= 1) x = 50;
           else {
               const step = (SIDE_END_X - SIDE_START_X) / (topSeats - 1);
               x = SIDE_START_X + (step * (index - 1));
           }
       } else if (index === topSeats + 1) { x = 100 - HEAD_X_MARGIN; y = 50; }
       else {
           y = 100 - SIDE_Y_MARGIN;
           const bottomIndex = index - (topSeats + 2);
           if (bottomSeats <= 1) x = 50;
           else {
               const step = (SIDE_END_X - SIDE_START_X) / (bottomSeats - 1);
               x = SIDE_END_X - (step * bottomIndex);
           }
       }
       return { top: `${y}%`, left: `${x}%` };
    }
    const radius = 33;
    const angleStep = (2 * Math.PI) / table.capacity;
    const angle = index * angleStep - (Math.PI / 2);
    let x = 50 + radius * Math.cos(angle);
    let y = 50 + radius * Math.sin(angle);
    if (table.shape === 'oval') {
       x = 50 + (radius * 1.5) * Math.cos(angle); 
       y = 50 + (radius * 0.9) * Math.sin(angle); 
    }
    return { top: `${y}%`, left: `${x}%` };
  };

  const getTableShapeStyles = (shape: Table['shape']) => {
    const base = "bg-white border-4 border-slate-200 shadow-2xl flex items-center justify-center text-slate-400 font-black z-10 relative transition-all uppercase tracking-widest text-[11px] leading-tight";
    const highlight = isTargetCandidate ? "border-primary bg-primary/5 text-primary cursor-pointer animate-pulse ring-8 ring-primary/10" : "";
    let shapeClass = "";
    switch (shape) {
      case 'circle': shapeClass = `${base} rounded-full w-36 h-36`; break;
      case 'oval': shapeClass = `${base} rounded-[45%] w-52 h-28`; break;
      case 'square': shapeClass = `${base} rounded-3xl w-36 h-36`; break;
      case 'rectangle': shapeClass = `${base} rounded-3xl w-52 h-32`; break;
      default: shapeClass = base;
    }
    return `${shapeClass} ${highlight}`;
  };

  const handleLocalDownload = async () => {
    const element = document.getElementById(`table-zone-${table.id}`);
    if (!element) return;

    try {
      const options = {
        scale: 3, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc: Document) => {
          const tableArea = clonedDoc.getElementById(`table-zone-${table.id}`);
          if (tableArea) {
             // CRITICAL: Remove overflow-hidden during capture so labels aren't clipped
             tableArea.style.overflow = 'visible';
             // Ensure it has a white background for the final image
             tableArea.style.backgroundColor = '#ffffff';
          }
          const toHide = clonedDoc.querySelectorAll('[data-html2canvas-ignore]');
          toHide.forEach(el => (el as HTMLElement).style.display = 'none');
        }
      };

      const canvas = await html2canvas(element, options);
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      
      const link = document.createElement('a');
      link.href = dataUrl;
      const safeName = (table.name || 'Mesa').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `LosCocos_${safeName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download Error", err);
    }
  };

  return (
    <div
      id={`table-zone-${table.id}`}
      data-drop-target="true"
      data-table-id={table.id}
      onDragOver={handleDragOver}
      onDrop={(e) => onDrop(e, table.id)}
      onClick={() => onTableClick && onTableClick(table.id)}
      className={`
        relative flex flex-col transition-all duration-300
        rounded-[2.5rem] bg-white border-2
        ${isTargetCandidate ? 'border-primary ring-8 ring-primary/5 scale-[1.03] shadow-2xl z-20' : (isFull ? 'border-red-100' : 'border-slate-100')}
        w-full min-h-[420px] shadow-2xl shadow-slate-200/50 overflow-hidden
      `}
    >
      <div className="p-4 border-b-2 border-slate-50 flex justify-between items-center bg-white z-[150] sticky top-0 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="font-black text-slate-900 truncate max-w-[140px] tracking-tight text-lg leading-none">{table.name}</span>
            <span className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isFull ? 'text-rose-500' : 'text-emerald-500'}`}>
              Asignados: {assignedGuests.length}/{table.capacity}
            </span>
          </div>
          <button 
             onClick={(e) => { e.stopPropagation(); onEdit(table); }}
             className="text-slate-300 hover:text-primary p-2 hover:bg-slate-50 rounded-xl transition-all active:scale-90"
             data-html2canvas-ignore
          >
             <Settings size={18} strokeWidth={2.5} />
          </button>
        </div>
        <div className="flex items-center gap-1.5" data-html2canvas-ignore>
          <button onClick={(e) => { e.stopPropagation(); handleLocalDownload(); }} className="text-slate-400 hover:text-primary p-2 bg-slate-50 rounded-xl active:scale-90"><Download size={18} strokeWidth={2.5} /></button>
          <button onClick={(e) => { e.stopPropagation(); setViewMode(viewMode === 'list' ? 'visual' : 'list'); }} className={`p-2 rounded-xl active:scale-90 transition-all ${viewMode === 'visual' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-400'}`}><Armchair size={18} strokeWidth={2.5} /></button>
          <button onClick={handleDeleteClick} className="text-slate-300 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-xl active:scale-90"><XCircle size={18} strokeWidth={2.5} /></button>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-50/30">
        {viewMode === 'list' && (
          <div className="p-4 overflow-y-auto max-h-[360px] space-y-3">
             {assignedGuests.map(guest => (
                 <div key={guest.id} className="relative group/item animate-in fade-in slide-in-from-right-4 duration-300">
                    <GuestCard 
                      guest={guest} 
                      onDragStart={onDragStart} 
                      onClick={() => onGuestClick(guest)}
                      variant="compact"
                      isSelected={selectedGuestId === guest.id}
                      onTouchDragEnd={(tId, sIdx) => onTouchDrop && onTouchDrop(guest.id, tId, sIdx)}
                    />
                    <button onClick={(e) => { e.stopPropagation(); handleTriggerRemove(guest); }} className="absolute -top-1.5 -right-1.5 bg-white text-rose-500 rounded-full shadow-lg p-1 border border-rose-50 active:scale-75 transition-transform z-10" data-html2canvas-ignore><XCircle size={16} strokeWidth={2.5} /></button>
                 </div>
             ))}
             {assignedGuests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-300 italic text-sm">
                   Mesa vacía
                </div>
             )}
          </div>
        )}

        {viewMode === 'visual' && (
          <div className="w-full h-full min-h-[360px] relative flex items-center justify-center p-6">
             <div className={getTableShapeStyles(table.shape)}>
                <span className="text-center px-4 pointer-events-none select-none drop-shadow-sm leading-tight">
                  {isTargetCandidate ? "Soltar aquí para asignar" : table.name}
                </span>
             </div>

             {Array.from({ length: table.capacity }).map((_, index) => {
               const pos = getSeatPosition(index);
               const guest = seatedGuests[index];

               return (
                 <div
                    key={`seat-${index}`}
                    data-drop-target="true"
                    data-table-id={table.id}
                    data-seat-index={index}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnSlot(e, index)}
                    onClick={(e) => { e.stopPropagation(); onTableClick && onTableClick(table.id, index); }}
                    className="absolute transition-all duration-500 ease-out z-[50]"
                    style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
                 >
                    {guest ? (
                        <div className="relative group/avatar animate-in zoom-in duration-300">
                            <GuestCard 
                                guest={guest} 
                                onDragStart={onDragStart} 
                                onClick={() => onGuestClick(guest)}
                                variant="avatar" 
                                isSelected={selectedGuestId === guest.id}
                                onTouchDragEnd={(tId, sIdx) => onTouchDrop && onTouchDrop(guest.id, tId, sIdx)}
                            />
                            <button
                                onClick={(e) => { e.stopPropagation(); handleTriggerRemove(guest); }}
                                className="absolute -top-3 -right-3 bg-white text-rose-500 rounded-full w-7 h-7 flex items-center justify-center shadow-xl border-2 border-rose-50 active:scale-75 transition-all z-[300] font-black text-base"
                                data-html2canvas-ignore
                            >
                                ×
                            </button>
                        </div>
                    ) : (
                        <div className={`
                            w-11 h-11 rounded-full border-2 border-dashed flex items-center justify-center text-slate-300 text-xs font-black transition-all cursor-pointer shadow-sm
                            ${selectedGuestId ? 'border-primary bg-primary/10 text-primary scale-125 animate-pulse shadow-primary/20' : 'border-slate-200 bg-white hover:border-primary/50 hover:bg-primary/5'}
                        `}>
                            {index + 1}
                        </div>
                    )}
                 </div>
               );
             })}
          </div>
        )}

        {undoInfo && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] animate-in slide-in-from-bottom-2 duration-300 pointer-events-none" data-html2canvas-ignore>
             <div className="bg-slate-900 text-white rounded-full pl-4 pr-1 py-1 flex items-center gap-3 shadow-2xl border border-white/10 pointer-events-auto">
                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-70">¿Quitar a {undoInfo.name}?</span>
                <button 
                  onClick={handleUndo}
                  className="bg-primary text-white px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
                >
                  <RotateCcw size={12} /> DESHACER
                </button>
                <button onClick={() => setUndoInfo(null)} className="p-1.5 text-slate-400 hover:text-white transition-colors">
                  <X size={14} />
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
