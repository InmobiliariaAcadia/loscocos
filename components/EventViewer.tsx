
import React, { useMemo, useState } from 'react';
import { PastEvent, Guest } from '../types';
import { TableZone } from './TableZone';
import { ArrowLeft, Calendar, Download, Share2 } from 'lucide-react';
// @ts-ignore
import html2canvas from 'html2canvas';

interface EventViewerProps {
  event: PastEvent;
  onBack: () => void;
}

export const EventViewer: React.FC<EventViewerProps> = ({ event, onBack }) => {
  const [isDownloading, setIsDownloading] = useState(false);

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
        const safeEvent = event.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
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

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{event.name}</h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
               <Calendar size={12} /> {new Date(event.date).toLocaleDateString()}
               <span className={`px-1.5 py-0.5 rounded uppercase text-[10px] font-bold ${event.status === 'past' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                 {event.status}
               </span>
            </div>
          </div>
        </div>
        
        <button 
            onClick={handleDownloadAll} 
            disabled={isDownloading}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm shadow hover:opacity-90"
        >
            <Share2 size={16} /> {isDownloading ? 'Saving...' : 'Share Images'}
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
            {event.tables.map(table => (
                <div key={table.id}>
                    <TableZone 
                        table={table}
                        assignedGuests={guestsByTable[table.id] || []}
                        onDrop={() => {}} // No-op in read-only
                        onDragStart={() => {}} // No-op
                        onRemoveGuest={() => {}} // No-op
                        onDeleteTable={() => {}} // No-op
                        onEdit={() => {}} // No-op
                        onDownload={handleDownloadTable}
                        onGuestClick={() => {}} // No-op
                        // IMPORTANT: We do not pass interaction handlers to enforce read-only visual
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
    </div>
  );
};
