import React, { useState, useMemo } from 'react';
import { Table, Guest } from '../types';
import { GuestCard } from './GuestCard';
import { XCircle, Settings, Armchair, Download } from 'lucide-react';

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
  const isFull = assignedGuests.length >= table.capacity;
  
  // Highlight table if a guest is selected and table has space
  const isTargetCandidate = !!selectedGuestId && !isFull;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropOnSlot = (e: React.DragEvent, seatIndex: number) => {
    e.stopPropagation();
    onDrop(e, table.id, seatIndex);
  };

  const seatedGuests = useMemo(() => {
    const seats = new Array(table.capacity).fill(null);
    assignedGuests.forEach(g => {
        if (g.seatIndex !== undefined && g.seatIndex < table.capacity && g.seatIndex >= 0) {
            seats[g.seatIndex] = g;
        }
    });
    return seats;
  }, [assignedGuests, table.capacity]);

  const getSeatPosition = (index: number) => {
    if (table.shape === 'rectangle') {
       const N = table.capacity;
       // Logic: 1 at Start (Left), 1 at End (Right), Rest split Top/Bottom
       
       if (N === 1) return { top: '50%', left: '15%' };
       
       const sideSeats = Math.max(0, N - 2);
       const topSeats = Math.ceil(sideSeats / 2);
       const bottomSeats = Math.floor(sideSeats / 2);
       
       let x = 50, y = 50;
       
       // Position Config - Tighter Layout
       const HEAD_X_MARGIN = 18; // Closer to edges (was 15)
       const SIDE_Y_MARGIN = 22; // Closer to table vertically (was 18)
       const SIDE_START_X = 30;  // Constrain side width to align with table body
       const SIDE_END_X = 70;

       if (index === 0) {
           // Left Head
           x = HEAD_X_MARGIN;
           y = 50;
       } else if (index <= topSeats) {
           // Top Row (Indices 1 to topSeats)
           y = SIDE_Y_MARGIN;
           
           if (topSeats <= 1) {
               x = 50;
           } else {
               const step = (SIDE_END_X - SIDE_START_X) / (topSeats - 1);
               // index-1 to normalize 1..topSeats to 0..topSeats-1
               x = SIDE_START_X + (step * (index - 1));
           }
       } else if (index === topSeats + 1) {
           // Right Head
           x = 100 - HEAD_X_MARGIN;
           y = 50;
       } else {
           // Bottom Row (Indices topSeats+2 to N-1)
           y = 100 - SIDE_Y_MARGIN;
           const bottomIndex = index - (topSeats + 2);
           
           if (bottomSeats <= 1) {
               x = 50;
           } else {
               const step = (SIDE_END_X - SIDE_START_X) / (bottomSeats - 1);
               // Reverse direction (Right to Left) for clockwise flow
               x = SIDE_END_X - (step * bottomIndex);
           }
       }
       return { top: `${y}%`, left: `${x}%` };
    }

    // Default Circular/Oval Logic - Tighter Radius
    const radius = 33; // Reduced from 42 to 33
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
    const base = "bg-white border-2 border-slate-300 shadow-inner flex items-center justify-center text-slate-400 font-medium z-10 relative transition-colors";
    const highlight = isTargetCandidate ? "border-primary bg-primary/5 text-primary cursor-pointer" : "";
    
    let shapeClass = "";
    switch (shape) {
      case 'circle': shapeClass = `${base} rounded-full w-32 h-32`; break;
      case 'oval': shapeClass = `${base} rounded-[40%] w-48 h-24`; break;
      case 'square': shapeClass = `${base} rounded-lg w-32 h-32`; break;
      case 'rectangle': shapeClass = `${base} rounded-lg w-48 h-28`; break;
      default: shapeClass = base;
    }
    return `${shapeClass} ${highlight}`;
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
        rounded-xl bg-slate-50/50 border-2
        ${isTargetCandidate ? 'border-primary ring-4 ring-primary/20 scale-[1.02] shadow-lg z-10' : (isFull ? 'border-red-100' : 'border-slate-200')}
        w-full min-h-[380px] shadow-sm hover:shadow-md
      `}
    >
      {/* Header */}
      <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-xl z-20">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-700 truncate max-w-[120px]">{table.name}</span>
          <button 
             onClick={(e) => { e.stopPropagation(); onEdit(table); }}
             className="text-slate-400 hover:text-primary p-1 hover:bg-slate-100 rounded-full transition-colors"
             aria-label="Edit Table"
          >
             <Settings size={14} />
          </button>
          <span className={`text-xs px-2 py-0.5 rounded-full ml-1 ${isFull ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {assignedGuests.length}/{table.capacity}
          </span>
        </div>
        <div className="flex items-center gap-1" data-html2canvas-ignore>
          <button onClick={(e) => { e.stopPropagation(); onDownload(table.id, table.name); }} className="text-slate-400 hover:text-primary p-1"><Download size={16} /></button>
          <button onClick={(e) => { e.stopPropagation(); setViewMode(viewMode === 'list' ? 'visual' : 'list'); }} className={`p-1 ${viewMode === 'visual' ? 'text-primary' : 'text-slate-400'}`}><Armchair size={16} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDeleteTable(table.id); }} className="text-slate-400 hover:text-red-500 p-1"><XCircle size={16} /></button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {viewMode === 'list' && (
          <div className="p-2 overflow-y-auto max-h-[340px]">
             {assignedGuests.map(guest => (
                 <div key={guest.id} className="relative group/item">
                    <GuestCard 
                      guest={guest} 
                      onDragStart={onDragStart} 
                      onClick={() => onGuestClick(guest)}
                      variant="compact"
                      isSelected={selectedGuestId === guest.id}
                      onTouchDragEnd={(tId, sIdx) => onTouchDrop && onTouchDrop(guest.id, tId, sIdx)}
                    />
                    <button onClick={(e) => { e.stopPropagation(); onRemoveGuest(guest.id); }} className="absolute top-1 right-1 hover:text-red-500 text-slate-300"><XCircle size={14} /></button>
                 </div>
             ))}
          </div>
        )}

        {viewMode === 'visual' && (
          <div className="w-full h-full min-h-[340px] relative flex items-center justify-center p-4">
             {/* Center Shape */}
             <div className={getTableShapeStyles(table.shape)}>
                <span className="text-xs text-center px-2 pointer-events-none select-none">
                  {isTargetCandidate ? "Tap to Place" : table.name}
                </span>
             </div>

             {/* Seats */}
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
                    className="absolute transition-all duration-500 ease-out z-20"
                    style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
                 >
                    {guest ? (
                        <div className="relative group/avatar">
                            <GuestCard 
                                guest={guest} 
                                onDragStart={onDragStart} 
                                onClick={() => onGuestClick(guest)}
                                variant="avatar" 
                                isSelected={selectedGuestId === guest.id}
                                onTouchDragEnd={(tId, sIdx) => onTouchDrop && onTouchDrop(guest.id, tId, sIdx)}
                            />
                            <button
                                onClick={(e) => { e.stopPropagation(); onRemoveGuest(guest.id); }}
                                className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full w-5 h-5 flex items-center justify-center shadow-md opacity-0 group-hover/avatar:opacity-100 transition-opacity border border-slate-100 z-50"
                            >
                                <span className="text-sm leading-none mb-0.5">×</span>
                            </button>
                        </div>
                    ) : (
                        <div className={`
                            w-10 h-10 rounded-full border border-dashed flex items-center justify-center text-slate-300 text-[10px] transition-all cursor-pointer
                            ${selectedGuestId ? 'border-primary bg-primary/10 text-primary scale-110 animate-pulse shadow-[0_0_10px_rgba(238,108,77,0.4)]' : 'border-slate-300 bg-slate-50 hover:border-primary hover:bg-primary/5'}
                        `}>
                            {index + 1}
                        </div>
                    )}
                 </div>
               );
             })}
          </div>
        )}
      </div>
    </div>
  );
};