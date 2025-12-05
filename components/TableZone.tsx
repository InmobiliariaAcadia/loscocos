import React, { useState, useMemo } from 'react';
import { Table, Guest } from '../types';
import { GuestCard } from './GuestCard';
import { Users, XCircle, Settings, Armchair, Download } from 'lucide-react';

interface TableZoneProps {
  table: Table;
  assignedGuests: Guest[];
  onDrop: (e: React.DragEvent, tableId: string, seatIndex?: number) => void;
  onDragStart: (e: React.DragEvent, guestId: string) => void;
  onRemoveGuest: (guestId: string) => void;
  onDeleteTable: (tableId: string) => void;
  onEdit: (table: Table) => void;
  onDownload: (tableId: string, tableName: string) => void;
  onGuestClick: (guest: Guest) => void;
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
  onGuestClick
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'visual'>('visual');
  const isFull = assignedGuests.length >= table.capacity;
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropOnSlot = (e: React.DragEvent, seatIndex: number) => {
    e.stopPropagation(); // Prevent bubbling to table container
    onDrop(e, table.id, seatIndex);
  };

  // Map guests to specific seat indices
  const seatedGuests = useMemo(() => {
    const seats = new Array(table.capacity).fill(null);
    assignedGuests.forEach(g => {
        // If guest has a valid seatIndex, put them there. 
        // If multiple conflict, the last one wins (should be handled by app logic to prevent conflict)
        // If no seatIndex, they are just "at the table" (handled in list view, or dumped in first empty in app logic)
        if (g.seatIndex !== undefined && g.seatIndex < table.capacity && g.seatIndex >= 0) {
            seats[g.seatIndex] = g;
        }
    });
    return seats;
  }, [assignedGuests, table.capacity]);

  // Calculate position for a specific seat index
  const getSeatPosition = (index: number) => {
    const radius = 42; // Percentage from center
    const angleStep = (2 * Math.PI) / table.capacity;
    const angle = index * angleStep - (Math.PI / 2); // Start top (-90deg)
    
    let x = 50 + radius * Math.cos(angle);
    let y = 50 + radius * Math.sin(angle);

    if (table.shape === 'oval') {
       x = 50 + (radius * 1.4) * Math.cos(angle); 
       y = 50 + (radius * 0.8) * Math.sin(angle); 
    }
    // Rect/Square logic can be approximate to circle for ease of drag-drop interaction
    
    return { top: `${y}%`, left: `${x}%` };
  };

  const getTableShapeStyles = (shape: Table['shape']) => {
    const base = "bg-white border-2 border-slate-300 shadow-inner flex items-center justify-center text-slate-400 font-medium z-10 relative";
    switch (shape) {
      case 'circle': return `${base} rounded-full w-32 h-32`;
      case 'oval': return `${base} rounded-[40%] w-48 h-24`;
      case 'square': return `${base} rounded-lg w-32 h-32`;
      case 'rectangle': return `${base} rounded-lg w-48 h-28`;
      default: return base;
    }
  };

  return (
    <div
      id={`table-zone-${table.id}`}
      onDragOver={handleDragOver}
      onDrop={(e) => onDrop(e, table.id)} // General drop on table (auto-find slot)
      className={`
        relative flex flex-col transition-all duration-200
        rounded-xl bg-slate-50/50 border-2
        ${isFull ? 'border-red-100' : 'border-slate-200'}
        w-full min-h-[380px] shadow-sm hover:shadow-md hover:border-primary/30
      `}
    >
      {/* Header */}
      <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-xl z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 truncate max-w-[120px]" title={table.name}>{table.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${isFull ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {assignedGuests.length}/{table.capacity}
          </span>
        </div>
        {/* Actions - Hidden during capture */}
        <div className="flex items-center gap-1" data-html2canvas-ignore>
          <button 
            onClick={() => onDownload(table.id, table.name)}
            className="text-slate-400 hover:text-primary transition-colors p-1"
            title="Download Table Image"
          >
            <Download size={16} />
          </button>
          <button 
            onClick={() => setViewMode(viewMode === 'list' ? 'visual' : 'list')}
            className={`p-1 transition-colors ${viewMode === 'visual' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
            title="Toggle View"
          >
            <Armchair size={16} />
          </button>
          <button 
            onClick={() => onEdit(table)}
            className="text-slate-400 hover:text-primary transition-colors p-1"
            title="Edit Table"
          >
            <Settings size={14} />
          </button>
          <button 
            onClick={() => onDeleteTable(table.id)}
            className="text-slate-400 hover:text-red-500 transition-colors p-1"
            title="Delete Table"
          >
            <XCircle size={16} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden">
        
        {viewMode === 'list' && (
          <div className="p-2 overflow-y-auto max-h-[340px]">
             {assignedGuests.length === 0 ? (
                <div className="text-center text-slate-300 mt-10">Empty Table</div>
             ) : (
               assignedGuests.map(guest => (
                 <div key={guest.id} className="relative group/item">
                    <GuestCard 
                      guest={guest} 
                      onDragStart={onDragStart} 
                      onClick={() => onGuestClick(guest)}
                      variant="compact"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveGuest(guest.id); }}
                      className="absolute top-1 right-1 hover:text-red-500 text-slate-300"
                      data-html2canvas-ignore
                    >
                      <XCircle size={14} />
                    </button>
                 </div>
               ))
             )}
          </div>
        )}

        {viewMode === 'visual' && (
          <div className="w-full h-full min-h-[340px] relative flex items-center justify-center p-4">
             {/* The Table Shape Center */}
             <div className={getTableShapeStyles(table.shape)}>
                <span className="text-xs text-center px-2 pointer-events-none select-none">
                  {assignedGuests.length === 0 ? "Drop Here" : table.name}
                </span>
             </div>

             {/* Render Seats (Slots) */}
             {Array.from({ length: table.capacity }).map((_, index) => {
               const pos = getSeatPosition(index);
               const guest = seatedGuests[index];

               return (
                 <div
                    key={`seat-${index}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnSlot(e, index)}
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
                            />
                            <button
                                onClick={(e) => { e.stopPropagation(); onRemoveGuest(guest.id); }}
                                className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full w-4 h-4 flex items-center justify-center shadow-md opacity-0 group-hover/avatar:opacity-100 transition-opacity border border-slate-100 hover:bg-red-50 z-50 cursor-pointer"
                                title="Unassign"
                                data-html2canvas-ignore
                            >
                                <span className="text-xs leading-none mb-0.5">×</span>
                            </button>
                        </div>
                    ) : (
                        // Empty Seat Placeholder
                        <div className="w-8 h-8 rounded-full border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-300 text-[10px] hover:border-primary hover:bg-primary/5 transition-colors cursor-default">
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